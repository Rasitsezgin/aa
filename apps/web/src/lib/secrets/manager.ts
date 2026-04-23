// Secrets Manager
// Secure credential and configuration management

import { EventEmitter } from 'events';

type SecretType = 'api_key' | 'password' | 'certificate' | 'token' | 'connection_string' | 'custom';
type SecretStatus = 'active' | 'pending_rotation' | 'deprecated' | 'revoked';

interface Secret {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: SecretType;
  version: number;
  status: SecretStatus;
  value: string; // Encrypted
  encryptionKeyId: string;
  metadata: {
    createdAt: Date;
    createdBy: string;
    lastUsed?: Date;
    lastRotated?: Date;
    expiresAt?: Date;
    rotationPeriod?: number; // days
  };
  tags: string[];
  allowedServices: string[]; // Services that can access
  environment: 'development' | 'staging' | 'production';
}

interface SecretVersion {
  secretId: string;
  version: number;
  value: string;
  createdAt: Date;
  deprecatedAt?: Date;
}

interface AccessLog {
  id: string;
  secretId: string;
  service: string;
  action: 'read' | 'write' | 'rotate';
  timestamp: Date;
  success: boolean;
  ipAddress: string;
  errorMessage?: string;
}

// Secrets Manager
export class SecretsManager extends EventEmitter {
  private secrets: Map<string, Secret> = new Map();
  private versions: Map<string, SecretVersion[]> = new Map();
  private accessLogs: Map<string, AccessLog[]> = new Map();
  private encryptionKeys: Map<string, string> = new Map();

  // Create secret
  createSecret(
    tenantId: string,
    config: {
      name: string;
      value: string;
      type: SecretType;
      description?: string;
      tags?: string[];
      environment?: Secret['environment'];
      rotationPeriod?: number;
      allowedServices?: string[];
    }
  ): Secret {
    const keyId = this.getOrCreateKey(tenantId);
    const encrypted = this.encrypt(config.value, keyId);

    const secret: Secret = {
      id: crypto.randomUUID(),
      tenantId,
      name: config.name,
      description: config.description,
      type: config.type,
      version: 1,
      status: 'active',
      value: encrypted,
      encryptionKeyId: keyId,
      metadata: {
        createdAt: new Date(),
        createdBy: 'system',
        rotationPeriod: config.rotationPeriod,
      },
      tags: config.tags || [],
      allowedServices: config.allowedServices || [],
      environment: config.environment || 'production',
    };

    this.secrets.set(secret.id, secret);

    // Store version
    this.versions.set(secret.id, [{
      secretId: secret.id,
      version: 1,
      value: encrypted,
      createdAt: new Date(),
    }]);

    this.emit('secretCreated', { secret, tenantId });
    return secret;
  }

  // Get secret value
  getSecret(
    secretId: string,
    requester: {
      service: string;
      ipAddress: string;
    }
  ): string | null {
    const secret = this.secrets.get(secretId);
    if (!secret) return null;

    // Check access
    if (secret.allowedServices.length > 0 && 
        !secret.allowedServices.includes(requester.service)) {
      this.logAccess(secretId, requester, 'read', false, 'Access denied');
      return null;
    }

    // Check expiry
    if (secret.metadata.expiresAt && secret.metadata.expiresAt < new Date()) {
      this.logAccess(secretId, requester, 'read', false, 'Secret expired');
      return null;
    }

    // Decrypt and return
    const decrypted = this.decrypt(secret.value, secret.encryptionKeyId);
    
    secret.metadata.lastUsed = new Date();
    this.logAccess(secretId, requester, 'read', true);

    this.emit('secretAccessed', { secretId, service: requester.service });
    return decrypted;
  }

  // Get secret by name
  getByName(
    tenantId: string,
    name: string,
    environment: string,
    requester: { service: string; ipAddress: string }
  ): string | null {
    const secret = Array.from(this.secrets.values()).find(
      s => s.tenantId === tenantId && s.name === name && s.environment === environment
    );
    
    return secret ? this.getSecret(secret.id, requester) : null;
  }

  // Rotate secret
  async rotateSecret(
    secretId: string,
    requester: { service: string; ipAddress: string }
  ): Promise<Secret> {
    const secret = this.secrets.get(secretId);
    if (!secret) throw new Error('Secret not found');

    // Generate new value based on type
    const newValue = this.generateNewValue(secret.type);
    
    // Store old version
    const versions = this.versions.get(secretId) || [];
    versions.push({
      secretId,
      version: secret.version,
      value: secret.value,
      createdAt: secret.metadata.createdAt,
      deprecatedAt: new Date(),
    });

    // Update secret
    secret.version++;
    secret.value = this.encrypt(newValue, secret.encryptionKeyId);
    secret.metadata.lastRotated = new Date();
    secret.status = 'active';

    this.versions.set(secretId, versions);
    this.logAccess(secretId, requester, 'rotate', true);

    this.emit('secretRotated', { secretId, newVersion: secret.version });
    return secret;
  }

  // Batch rotate
  async rotateBatch(
    tenantId: string,
    options: {
      olderThanDays?: number;
      type?: SecretType;
    }
  ): Promise<{ rotated: number; failed: number }> {
    let rotated = 0;
    let failed = 0;

    const secrets = Array.from(this.secrets.values()).filter(s => {
      if (s.tenantId !== tenantId) return false;
      if (options.type && s.type !== options.type) return false;
      if (options.olderThanDays && s.metadata.lastRotated) {
        const daysSince = (Date.now() - s.metadata.lastRotated.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > options.olderThanDays;
      }
      return true;
    });

    for (const secret of secrets) {
      try {
        await this.rotateSecret(secret.id, { service: 'batch-rotation', ipAddress: 'internal' });
        rotated++;
      } catch {
        failed++;
      }
    }

    return { rotated, failed };
  }

  // Revoke secret
  revokeSecret(
    secretId: string,
    reason: string,
    requester: { service: string; ipAddress: string }
  ): Secret {
    const secret = this.secrets.get(secretId);
    if (!secret) throw new Error('Secret not found');

    secret.status = 'revoked';
    this.logAccess(secretId, requester, 'write', true, reason);

    this.emit('secretRevoked', { secretId, reason });
    return secret;
  }

  // Get access logs
  getAccessLogs(
    secretId: string,
    options: {
      from?: Date;
      to?: Date;
      limit?: number;
    } = {}
  ): AccessLog[] {
    const logs = this.accessLogs.get(secretId) || [];
    let filtered = logs;

    if (options.from) {
      filtered = filtered.filter(l => l.timestamp >= options.from!);
    }

    if (options.to) {
      filtered = filtered.filter(l => l.timestamp <= options.to!);
    }

    return filtered.slice(0, options.limit || 100);
  }

  // List secrets
  listSecrets(
    tenantId: string,
    options: {
      environment?: string;
      type?: SecretType;
      tags?: string[];
      status?: SecretStatus;
    } = {}
  ): Secret[] {
    let secrets = Array.from(this.secrets.values()).filter(s => s.tenantId === tenantId);

    if (options.environment) {
      secrets = secrets.filter(s => s.environment === options.environment);
    }

    if (options.type) {
      secrets = secrets.filter(s => s.type === options.type);
    }

    if (options.tags) {
      secrets = secrets.filter(s => options.tags!.every(t => s.tags.includes(t)));
    }

    if (options.status) {
      secrets = secrets.filter(s => s.status === options.status);
    }

    return secrets.sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime());
  }

  // Get version history
  getVersionHistory(secretId: string): SecretVersion[] {
    return (this.versions.get(secretId) || []).sort((a, b) => b.version - a.version);
  }

  // Revert to version
  async revertToVersion(
    secretId: string,
    version: number,
    requester: { service: string; ipAddress: string }
  ): Promise<Secret> {
    const secret = this.secrets.get(secretId);
    if (!secret) throw new Error('Secret not found');

    const versions = this.versions.get(secretId) || [];
    const target = versions.find(v => v.version === version);
    if (!target) throw new Error('Version not found');

    // Store current as version
    versions.push({
      secretId,
      version: secret.version,
      value: secret.value,
      createdAt: new Date(),
      deprecatedAt: new Date(),
    });

    // Revert
    secret.version++;
    secret.value = target.value;
    this.versions.set(secretId, versions);

    this.logAccess(secretId, requester, 'write', true, `Reverted to version ${version}`);
    this.emit('secretReverted', { secretId, toVersion: version });

    return secret;
  }

  // Private methods
  private getOrCreateKey(tenantId: string): string {
    if (!this.encryptionKeys.has(tenantId)) {
      this.encryptionKeys.set(tenantId, `key-${tenantId}-${Date.now()}`);
    }
    return this.encryptionKeys.get(tenantId)!;
  }

  private encrypt(value: string, keyId: string): string {
    // In production: Use KMS, HashiCorp Vault, or AWS Secrets Manager
    return `enc:${keyId}:${btoa(value)}`;
  }

  private decrypt(encrypted: string, keyId: string): string {
    if (!encrypted.startsWith('enc:')) return encrypted;
    const parts = encrypted.split(':');
    return atob(parts[2]);
  }

  private generateNewValue(type: SecretType): string {
    switch (type) {
      case 'api_key':
        return `pk_${crypto.randomUUID().replace(/-/g, '')}`;
      case 'password':
        return this.generatePassword();
      case 'token':
        return `tkn_${btoa(String(Date.now()))}`;
      default:
        return `sec_${crypto.randomUUID()}`;
    }
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private logAccess(
    secretId: string,
    requester: { service: string; ipAddress: string },
    action: AccessLog['action'],
    success: boolean,
    errorMessage?: string
  ): void {
    const log: AccessLog = {
      id: crypto.randomUUID(),
      secretId,
      service: requester.service,
      action,
      timestamp: new Date(),
      success,
      ipAddress: requester.ipAddress,
      errorMessage,
    };

    const logs = this.accessLogs.get(secretId) || [];
    logs.unshift(log);
    this.accessLogs.set(secretId, logs.slice(0, 1000));
  }
}

// Export singleton
export const secretsManager = new SecretsManager();

export { Secret, SecretVersion, AccessLog, SecretType };
