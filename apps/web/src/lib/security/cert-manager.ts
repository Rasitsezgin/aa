// Certificate Manager
// SSL/TLS certificate lifecycle management

import { EventEmitter } from 'events';

type CertificateStatus = 'pending_validation' | 'issued' | 'inactive' | 'expired' | 'revoked' | 'failed';
type CertificateType = 'imported' | 'acme' | 'private_ca' | 'managed';
type ValidationMethod = 'dns' | 'email' | 'http';

interface Certificate {
  id: string;
  tenantId: string;
  domain: string;
  alternativeNames: string[];
  status: CertificateStatus;
  type: CertificateType;
  validation: {
    method: ValidationMethod;
    status: 'pending' | 'success' | 'failed';
    records?: Array<{
      name: string;
      type: string;
      value: string;
    }>;
  };
  issuer: string;
  subject: string;
  serialNumber: string;
  signatureAlgorithm: string;
  keyAlgorithm: 'RSA-2048' | 'RSA-4096' | 'ECDSA-256' | 'ECDSA-384';
  keySize: number;
  notBefore: Date;
  notAfter: Date;
  inUseBy: string[]; // Resource IDs using this cert
  renewalEligibility: boolean;
  renewalConfig?: {
    autoRenew: boolean;
    daysBeforeExpiry: number;
  };
  tags: string[];
  createdAt: Date;
  importedAt?: Date;
}

interface CertificateRenewal {
  id: string;
  certificateId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  oldCertificateId: string;
  newCertificateId?: string;
  requestedAt: Date;
  completedAt?: Date;
  scheduledFor?: Date;
}

interface PrivateCA {
  id: string;
  tenantId: string;
  name: string;
  status: 'active' | 'creating' | 'pending_certificate' | 'failed';
  type: 'root' | 'subordinate';
  parentCA?: string;
  subject: {
    country: string;
    organization: string;
    organizationalUnit?: string;
    commonName: string;
  };
  validity: {
    notBefore: Date;
    notAfter: Date;
  };
  keySpec: {
    algorithm: string;
    size: number;
  };
  revocationConfiguration: {
    crlEnabled: boolean;
    ocspEnabled: boolean;
  };
  certificatesIssued: number;
}

// Certificate Manager
export class CertificateManager extends EventEmitter {
  private certificates: Map<string, Certificate> = new Map();
  private renewals: Map<string, CertificateRenewal[]> = new Map();
  private cas: Map<string, PrivateCA> = new Map();

  // Request certificate
  requestCertificate(
    tenantId: string,
    config: {
      domain: string;
      alternativeNames?: string[];
      type: CertificateType;
      validation: ValidationMethod;
      keyAlgorithm?: Certificate['keyAlgorithm'];
      autoRenew?: boolean;
    }
  ): Certificate {
    const cert: Certificate = {
      id: crypto.randomUUID(),
      tenantId,
      domain: config.domain,
      alternativeNames: config.alternativeNames || [],
      status: 'pending_validation',
      type: config.type,
      validation: {
        method: config.validation,
        status: 'pending',
      },
      issuer: config.type === 'acme' ? "Let's Encrypt" : 'Pazaryonetimi CA',
      subject: config.domain,
      serialNumber: '',
      signatureAlgorithm: 'SHA256WITHRSA',
      keyAlgorithm: config.keyAlgorithm || 'RSA-2048',
      keySize: 2048,
      notBefore: new Date(),
      notAfter: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days default
      inUseBy: [],
      renewalEligibility: true,
      renewalConfig: config.autoRenew !== false ? {
        autoRenew: true,
        daysBeforeExpiry: 30,
      } : undefined,
      tags: [],
      createdAt: new Date(),
    };

    // Generate validation records
    if (config.validation === 'dns') {
      cert.validation.records = [
        {
          name: `_acme-challenge.${config.domain}`,
          type: 'TXT',
          value: `validation-token-${crypto.randomUUID().slice(0, 8)}`,
        },
      ];
    }

    this.certificates.set(cert.id, cert);
    this.emit('certificateRequested', cert);

    // Auto-validate after delay
    setTimeout(() => {
      this.validateCertificate(cert.id);
    }, 5000);

    return cert;
  }

  // Import certificate
  importCertificate(
    tenantId: string,
    config: {
      certificate: string;
      privateKey: string;
      certificateChain?: string;
      domain: string;
      tags?: string[];
    }
  ): Certificate {
    const cert: Certificate = {
      id: crypto.randomUUID(),
      tenantId,
      domain: config.domain,
      alternativeNames: [],
      status: 'issued',
      type: 'imported',
      validation: {
        method: 'dns',
        status: 'success',
      },
      issuer: 'Imported',
      subject: config.domain,
      serialNumber: `imported-${Date.now()}`,
      signatureAlgorithm: 'SHA256WITHRSA',
      keyAlgorithm: 'RSA-2048',
      keySize: 2048,
      notBefore: new Date(),
      notAfter: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      inUseBy: [],
      renewalEligibility: false,
      tags: config.tags || [],
      createdAt: new Date(),
      importedAt: new Date(),
    };

    this.certificates.set(cert.id, cert);
    this.emit('certificateImported', cert);
    return cert;
  }

  // Validate certificate
  async validateCertificate(certId: string): Promise<Certificate> {
    const cert = this.certificates.get(certId);
    if (!cert) throw new Error('Certificate not found');

    cert.validation.status = 'success';
    cert.status = 'issued';
    cert.serialNumber = `SN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    this.emit('certificateValidated', cert);
    return cert;
  }

  // Attach certificate to resource
  attachCertificate(certId: string, resourceId: string): Certificate {
    const cert = this.certificates.get(certId);
    if (!cert) throw new Error('Certificate not found');

    if (!cert.inUseBy.includes(resourceId)) {
      cert.inUseBy.push(resourceId);
    }

    this.emit('certificateAttached', { certId, resourceId });
    return cert;
  }

  // Detach certificate
  detachCertificate(certId: string, resourceId: string): Certificate {
    const cert = this.certificates.get(certId);
    if (!cert) throw new Error('Certificate not found');

    cert.inUseBy = cert.inUseBy.filter(id => id !== resourceId);

    this.emit('certificateDetached', { certId, resourceId });
    return cert;
  }

  // Renew certificate
  async renewCertificate(certId: string): Promise<CertificateRenewal> {
    const cert = this.certificates.get(certId);
    if (!cert) throw new Error('Certificate not found');

    const renewal: CertificateRenewal = {
      id: crypto.randomUUID(),
      certificateId: certId,
      status: 'in_progress',
      oldCertificateId: certId,
      requestedAt: new Date(),
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    };

    const renewals = this.renewals.get(certId) || [];
    renewals.push(renewal);
    this.renewals.set(certId, renewals);

    // Simulate renewal
    setTimeout(() => {
      // Create new certificate
      const newCert = this.requestCertificate(cert.tenantId, {
        domain: cert.domain,
        alternativeNames: cert.alternativeNames,
        type: cert.type,
        validation: cert.validation.method,
        keyAlgorithm: cert.keyAlgorithm,
      });

      renewal.newCertificateId = newCert.id;
      renewal.status = 'completed';
      renewal.completedAt = new Date();

      // Copy in-use resources
      newCert.inUseBy = [...cert.inUseBy];

      // Update old certificate
      cert.status = 'inactive';

      this.emit('certificateRenewed', renewal);
    }, 3000);

    this.emit('certificateRenewalStarted', renewal);
    return renewal;
  }

  // Create private CA
  createPrivateCA(
    tenantId: string,
    config: Omit<PrivateCA, 'id' | 'tenantId' | 'status' | 'certificatesIssued'>
  ): PrivateCA {
    const ca: PrivateCA = {
      ...config,
      id: crypto.randomUUID(),
      tenantId,
      status: 'creating',
      certificatesIssued: 0,
    };

    this.cas.set(ca.id, ca);

    // Simulate creation
    setTimeout(() => {
      ca.status = 'active';
      this.emit('privateCAActivated', ca);
    }, 2000);

    this.emit('privateCACreated', ca);
    return ca;
  }

  // Issue certificate from private CA
  issueFromCA(
    caId: string,
    config: {
      domain: string;
      validityDays: number;
    }
  ): Certificate {
    const ca = this.cas.get(caId);
    if (!ca) throw new Error('CA not found');
    if (ca.status !== 'active') throw new Error('CA not active');

    const cert: Certificate = {
      id: crypto.randomUUID(),
      tenantId: ca.tenantId,
      domain: config.domain,
      alternativeNames: [],
      status: 'issued',
      type: 'private_ca',
      validation: {
        method: 'dns',
        status: 'success',
      },
      issuer: ca.subject.commonName,
      subject: config.domain,
      serialNumber: `CA-${ca.certificatesIssued + 1}-${Date.now()}`,
      signatureAlgorithm: ca.keySpec.algorithm,
      keyAlgorithm: 'RSA-2048',
      keySize: ca.keySpec.size,
      notBefore: new Date(),
      notAfter: new Date(Date.now() + config.validityDays * 24 * 60 * 60 * 1000),
      inUseBy: [],
      renewalEligibility: true,
      tags: [],
      createdAt: new Date(),
    };

    ca.certificatesIssued++;
    this.certificates.set(cert.id, cert);

    this.emit('certificateIssuedFromCA', { caId, certificate: cert });
    return cert;
  }

  // Get expiring certificates
  getExpiringCertificates(tenantId: string, days: number = 30): Certificate[] {
    const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    return Array.from(this.certificates.values())
      .filter(c => 
        c.tenantId === tenantId && 
        c.status === 'issued' && 
        c.notAfter <= cutoff
      )
      .sort((a, b) => a.notAfter.getTime() - b.notAfter.getTime());
  }

  // Get certificate details
  getCertificate(certId: string): Certificate | null {
    return this.certificates.get(certId) || null;
  }

  // List certificates
  listCertificates(tenantId: string): Certificate[] {
    return Array.from(this.certificates.values())
      .filter(c => c.tenantId === tenantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Revoke certificate
  revokeCertificate(certId: string, reason: string): Certificate {
    const cert = this.certificates.get(certId);
    if (!cert) throw new Error('Certificate not found');

    cert.status = 'revoked';

    this.emit('certificateRevoked', { certId, reason });
    return cert;
  }
}

// Export singleton
export const certificateManager = new CertificateManager();

export type { Certificate, CertificateRenewal, PrivateCA, CertificateStatus };
