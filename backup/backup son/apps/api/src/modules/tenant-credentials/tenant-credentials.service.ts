import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EncryptionService } from '../../common/encryption.service';
import { ServiceType } from '@prisma/client';
import {
  CreateServiceCredentialDto,
  UpdateServiceCredentialDto,
} from './dto/tenant-credential.dto';
import { AuditService, AuditAction } from '../audit/audit.service';

export interface DecryptedCredentials {
  apiUrl: string;
  apiKey: string;
  apiSecret: string;
  apiExtra: Record<string, unknown>;
}

@Injectable()
export class TenantCredentialsService {
  private readonly logger = new Logger(TenantCredentialsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly audit: AuditService,
  ) {}

  /** Tenant'ın tüm servis kimlik bilgilerini listele */
  async findAll(tenantId: string, serviceTypePrefix?: string) {
    const where: any = { tenantId };
    if (serviceTypePrefix) {
      where.serviceType = {
        in: Object.values(ServiceType).filter((s) =>
          s.startsWith(serviceTypePrefix),
        ),
      };
    }

    const credentials = await this.prisma.serviceCredential.findMany({
      where,
      orderBy: [{ serviceType: 'asc' }, { isDefault: 'desc' }],
    });

    // Hassas bilgileri maskele
    return credentials.map((c) => ({
      ...c,
      apiUrl: c.apiUrl ? '••••••' : null,
      apiKey: c.apiKey ? '••••••' : null,
      apiSecret: c.apiSecret ? '••••••' : null,
    }));
  }

  /** Yeni servis kimlik bilgisi oluştur */
  async create(tenantId: string, dto: CreateServiceCredentialDto) {
    // Aynı servis tipi ve tenant için default kontrolü
    if (dto.isDefault) {
      await this.prisma.serviceCredential.updateMany({
        where: { tenantId, serviceType: dto.serviceType, isDefault: true },
        data: { isDefault: false },
      });
    }

    const credential = await this.prisma.serviceCredential.create({
      data: {
        tenantId,
        serviceType: dto.serviceType,
        label: dto.label,
        apiUrl: dto.apiUrl ? this.encryption.encrypt(dto.apiUrl) : null,
        apiKey: dto.apiKey ? this.encryption.encrypt(dto.apiKey) : null,
        apiSecret: dto.apiSecret
          ? this.encryption.encrypt(dto.apiSecret)
          : null,
        apiExtra: dto.apiExtra ? (dto.apiExtra as any) : undefined,
        isDefault: dto.isDefault ?? false,
      },
    });

    this.logger.log(
      `Servis kimlik bilgisi oluşturuldu: ${dto.serviceType} - Tenant: ${tenantId}`,
    );
    void this.audit.log({
      action: AuditAction.SERVICE_CREDENTIAL_CREATE,
      tenantId,
      resourceType: 'ServiceCredential',
      resourceId: credential.id,
      metadata: { serviceType: dto.serviceType, label: dto.label },
      success: true,
    });

    return {
      ...credential,
      apiUrl: credential.apiUrl ? '••••••' : null,
      apiKey: credential.apiKey ? '••••••' : null,
      apiSecret: credential.apiSecret ? '••••••' : null,
    };
  }

  /** Servis kimlik bilgisini güncelle */
  async update(tenantId: string, id: string, dto: UpdateServiceCredentialDto) {
    const existing = await this.prisma.serviceCredential.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Servis kimlik bilgisi bulunamadı');
    }

    // Default değişikliği: önce mevcut default'u kaldır
    if (dto.isDefault) {
      await this.prisma.serviceCredential.updateMany({
        where: {
          tenantId,
          serviceType: existing.serviceType,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    const data: any = {};
    if (dto.label !== undefined) data.label = dto.label;
    if (dto.apiUrl !== undefined)
      data.apiUrl = dto.apiUrl ? this.encryption.encrypt(dto.apiUrl) : null;
    if (dto.apiKey !== undefined)
      data.apiKey = dto.apiKey ? this.encryption.encrypt(dto.apiKey) : null;
    if (dto.apiSecret !== undefined)
      data.apiSecret = dto.apiSecret
        ? this.encryption.encrypt(dto.apiSecret)
        : null;
    if (dto.apiExtra !== undefined) data.apiExtra = dto.apiExtra;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.isDefault !== undefined) data.isDefault = dto.isDefault;

    const credential = await this.prisma.serviceCredential.update({
      where: { id },
      data,
    });

    void this.audit.log({
      action: AuditAction.SERVICE_CREDENTIAL_UPDATE,
      tenantId,
      resourceType: 'ServiceCredential',
      resourceId: id,
      metadata: { serviceType: existing.serviceType },
      success: true,
    });

    return {
      ...credential,
      apiUrl: credential.apiUrl ? '••••••' : null,
      apiKey: credential.apiKey ? '••••••' : null,
      apiSecret: credential.apiSecret ? '••••••' : null,
    };
  }

  /** Servis kimlik bilgisini sil */
  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.serviceCredential.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Servis kimlik bilgisi bulunamadı');
    }

    await this.prisma.serviceCredential.delete({ where: { id } });
    void this.audit.log({
      action: AuditAction.SERVICE_CREDENTIAL_DELETE,
      tenantId,
      resourceType: 'ServiceCredential',
      resourceId: id,
      metadata: { serviceType: existing.serviceType },
      success: true,
    });
    return { success: true };
  }

  /**
   * Belirli bir servis tipi için tenant'ın şifresi çözülmüş kimlik bilgilerini getir.
   * Diğer servisler (Shipping, Payments, EInvoice) bu metodu kullanır.
   */
  async getDecryptedCredentials(
    tenantId: string,
    serviceType: ServiceType,
  ): Promise<DecryptedCredentials | null> {
    const credential = await this.prisma.serviceCredential.findFirst({
      where: { tenantId, serviceType, isActive: true },
      orderBy: { isDefault: 'desc' }, // Önce default olanı al
    });

    if (!credential) return null;

    return {
      apiUrl: credential.apiUrl
        ? this.encryption.decrypt(credential.apiUrl)
        : '',
      apiKey: credential.apiKey
        ? this.encryption.decrypt(credential.apiKey)
        : '',
      apiSecret: credential.apiSecret
        ? this.encryption.decrypt(credential.apiSecret)
        : '',
      apiExtra: (credential.apiExtra as Record<string, unknown>) ?? {},
    };
  }

  /**
   * Bağlantı testi — kayıtlı şifreli kimlik bilgilerini gerçek API'ye karşı test et.
   * Sonucu DB'ye kaydeder (lastTestedAt, lastTestOk).
   */
  async testConnection(tenantId: string, id: string) {
    const credential = await this.prisma.serviceCredential.findFirst({
      where: { id, tenantId },
    });
    if (!credential) {
      throw new NotFoundException('Servis kimlik bilgisi bulunamadı');
    }

    const apiKey = credential.apiKey
      ? this.encryption.decrypt(credential.apiKey)
      : '';
    const apiSecret = credential.apiSecret
      ? this.encryption.decrypt(credential.apiSecret)
      : '';
    const apiUrl = credential.apiUrl
      ? this.encryption.decrypt(credential.apiUrl)
      : '';

    // Servis tipine göre bağlantı doğrulama
    let success = false;
    let message = '';

    try {
      const st = credential.serviceType as string;
      if (st.startsWith('SHIPPING_')) {
        // Kargo: apiKey (kullanıcı adı) dolu mu kontrol et
        success = apiKey.length > 0;
        message = success
          ? 'Kargo kimlik bilgileri geçerli görünüyor'
          : 'Kullanıcı adı/şifre boş';
      } else if (st.startsWith('PAYMENT_')) {
        success = apiKey.length > 0 && apiSecret.length > 0;
        message = success
          ? 'Ödeme kimlik bilgileri geçerli görünüyor'
          : 'API Key veya Secret boş';
      } else if (st.startsWith('EINVOICE_')) {
        success = apiKey.length > 0 && apiUrl.length > 0;
        message = success
          ? `E-Fatura entegratörü bilgileri geçerli görünüyor`
          : 'API Key veya URL boş';
      } else if (st.startsWith('SMS_')) {
        success = apiKey.length > 0;
        message = success ? 'SMS kimlik bilgileri geçerli görünüyor' : 'API Key boş';
      } else if (st.startsWith('EMAIL_')) {
        success = apiKey.length > 0;
        message = success ? 'E-posta kimlik bilgileri geçerli görünüyor' : 'Kimlik bilgisi boş';
      } else {
        success = apiKey.length > 0;
        message = success ? 'Kimlik bilgileri dolu' : 'Kimlik bilgisi boş';
      }
    } catch {
      success = false;
      message = 'Bağlantı testi sırasında hata oluştu';
    }

    // Sonucu DB'ye kaydet
    await this.prisma.serviceCredential.update({
      where: { id },
      data: { lastTestedAt: new Date(), lastTestOk: success },
    });

    this.logger.log(
      `Bağlantı testi: ${credential.serviceType} (${id}) → ${success ? 'OK' : 'FAIL'}`,
    );
    void this.audit.log({
      action: AuditAction.SERVICE_CREDENTIAL_TEST,
      tenantId,
      resourceType: 'ServiceCredential',
      resourceId: id,
      metadata: { serviceType: credential.serviceType, result: success ? 'OK' : 'FAIL' },
      success,
    });

    return { success, message, serviceType: credential.serviceType, testedAt: new Date() };
  }

  /**
   * API anahtarı rotasyonu — yeni kimlik bilgilerini kaydet, eskiyi deaktive et.
   * Kesintisiz geçiş: önce yeni bilgileri test et, başarılıysa eskiyi kapat.
   */
  async rotateCredentials(
    tenantId: string,
    id: string,
    dto: { apiKey?: string; apiSecret?: string; apiUrl?: string },
  ) {
    const existing = await this.prisma.serviceCredential.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Servis kimlik bilgisi bulunamadı');
    }

    if (!dto.apiKey && !dto.apiSecret && !dto.apiUrl) {
      throw new BadRequestException('Rotasyon için en az bir alan gerekli');
    }

    // Yeni kayıt oluştur (eski aktif kalır, geçiş güvenledir)
    const newCred = await this.prisma.serviceCredential.create({
      data: {
        tenantId,
        serviceType: existing.serviceType,
        label: `${existing.label ?? existing.serviceType} (rotasyon ${new Date().toISOString().slice(0, 10)})`,
        apiUrl: dto.apiUrl
          ? this.encryption.encrypt(dto.apiUrl)
          : existing.apiUrl,
        apiKey: dto.apiKey
          ? this.encryption.encrypt(dto.apiKey)
          : existing.apiKey,
        apiSecret: dto.apiSecret
          ? this.encryption.encrypt(dto.apiSecret)
          : existing.apiSecret,
        apiExtra: existing.apiExtra as any,
        isDefault: true,
        isActive: true,
      },
    });

    // Yeni girdinin testini yap
    const testResult = await this.testConnection(tenantId, newCred.id);

    if (testResult.success) {
      // Eskiyi deaktive et
      await this.prisma.serviceCredential.update({
        where: { id },
        data: { isDefault: false, isActive: false },
      });
      this.logger.log(
        `Rotasyon başarılı: ${existing.serviceType} - eski: ${id}, yeni: ${newCred.id}`,
      );
      void this.audit.log({
        action: AuditAction.SERVICE_CREDENTIAL_ROTATE,
        tenantId,
        resourceType: 'ServiceCredential',
        resourceId: newCred.id,
        metadata: { serviceType: existing.serviceType, oldCredentialId: id },
        success: true,
      });
      return { success: true, newCredentialId: newCred.id, message: 'Rotasyon başarılı' };
    } else {
      // Test başarısız → yeni girdiden geri dön
      await this.prisma.serviceCredential.delete({ where: { id: newCred.id } });
      return { success: false, message: `Yeni kimlik bilgisi testi başarısız: ${testResult.message}` };
    }
  }

  /** Tenant için webhook imzalama secret'ı oluştur veya al */
  async getOrCreateWebhookSecret(tenantId: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { webhookSecret: true },
    });
    if (!tenant) throw new NotFoundException('Tenant bulunamadı');

    if (tenant.webhookSecret) {
      return this.encryption.decrypt(tenant.webhookSecret);
    }

    // Yeni secret oluştur
    const { randomBytes } = await import('crypto');
    const secret = randomBytes(32).toString('hex');
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { webhookSecret: this.encryption.encrypt(secret) },
    });

    this.logger.log(`Webhook secret oluşturuldu: Tenant ${tenantId}`);
    return secret;
  }

  /** Tenant'ın webhook secret'ını rotasyona sok */
  async rotateWebhookSecret(tenantId: string): Promise<string> {
    const { randomBytes } = await import('crypto');
    const secret = randomBytes(32).toString('hex');
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { webhookSecret: this.encryption.encrypt(secret) },
    });
    this.logger.log(`Webhook secret rotasyonu: Tenant ${tenantId}`);
    void this.audit.log({
      action: AuditAction.WEBHOOK_SECRET_ROTATE,
      tenantId,
      resourceType: 'Tenant',
      resourceId: tenantId,
      success: true,
    });
    return secret;
  }

  /**
   * Belirli bir prefix ile başlayan tüm aktif servis tiplerini getir.
   * Örn: "SHIPPING_" → tenant'ın tüm aktif kargo entegrasyonları
   */
  async getActiveServiceTypes(
    tenantId: string,
    prefix: string,
  ): Promise<ServiceType[]> {
    const credentials = await this.prisma.serviceCredential.findMany({
      where: {
        tenantId,
        isActive: true,
        serviceType: {
          in: Object.values(ServiceType).filter((s) => s.startsWith(prefix)),
        },
      },
      select: { serviceType: true },
    });

    return credentials.map((c) => c.serviceType);
  }
}
