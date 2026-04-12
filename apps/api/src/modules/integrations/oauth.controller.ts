import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  Body,
  Headers,
  Param,
} from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { EncryptionService } from '../../common/encryption.service';
import { Public } from '../auth/public.decorator';

/**
 * OAuth Callback Handler
 * Amazon SP-API, Hepsiburada ve diğer OAuth gerektiren platformlar için callback endpoint'leri
 */
@Controller('oauth')
export class OAuthController {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) {}

  /**
   * Amazon Selling Partner API OAuth Callback
   * GET /oauth/amazon/callback?state={tenantId}&selling_partner_id={sellerId}&spapi_oauth_code={code}
   */
  @Public()
  @Get('amazon/callback')
  async amazonCallback(
    @Query('state') tenantId: string,
    @Query('selling_partner_id') sellerId: string,
    @Query('spapi_oauth_code') authCode: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ) {
    try {
      if (error) {
        console.error(`Amazon OAuth Error: ${error} - ${errorDescription}`);
        return res.redirect(
          `/dashboard/stores?error=amazon_auth_failed&message=${encodeURIComponent(errorDescription)}`,
        );
      }

      if (!tenantId || !sellerId || !authCode) {
        return res.redirect('/dashboard/stores?error=missing_params');
      }

      // Amazon'dan refresh token al
      const tokenResponse = await this.exchangeAmazonCodeForToken(
        authCode,
        sellerId,
      );

      if (!tokenResponse.refresh_token) {
        throw new Error('Refresh token alınamadı');
      }

      // Integration'ı güncelle veya oluştur
      const existing = await this.prisma.integration.findFirst({
        where: {
          tenantId,
          platform: 'AMAZON',
        },
      });

      if (existing) {
        await this.prisma.integration.update({
          where: {
            id: existing.id,
          },
          data: {
            apiSecret: this.encryption.encrypt(tokenResponse.refresh_token),
            isActive: true,
            apiExtra: {
              ...(existing.apiExtra as object),
              sellerId,
              accessToken: tokenResponse.access_token,
              expiresAt: Date.now() + tokenResponse.expires_in * 1000,
            },
          },
        });
      } else {
        await this.prisma.integration.create({
          data: {
            tenantId,
            platform: 'AMAZON',
            apiKey: this.encryption.encrypt(sellerId),
            apiSecret: this.encryption.encrypt(tokenResponse.refresh_token),
            isActive: true,
            apiExtra: {
              sellerId,
              accessToken: tokenResponse.access_token,
              expiresAt: Date.now() + tokenResponse.expires_in * 1000,
              marketplaceId: 'amazon-tr',
            },
          },
        });
      }

      return res.redirect('/dashboard/stores?success=amazon_connected');
    } catch (err) {
      console.error('Amazon OAuth callback error:', err);
      return res.redirect(
        `/dashboard/stores?error=amazon_callback_failed&message=${encodeURIComponent(err.message)}`,
      );
    }
  }

  /**
   * Hepsiburada OAuth Callback
   * GET /oauth/hepsiburada/callback?code={code}&state={tenantId}
   */
  @Public()
  @Get('hepsiburada/callback')
  async hepsiburadaCallback(
    @Query('code') code: string,
    @Query('state') tenantId: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    try {
      if (error) {
        return res.redirect(`/dashboard/stores?error=hepsiburada_auth_failed`);
      }

      if (!code || !tenantId) {
        return res.redirect('/dashboard/stores?error=missing_params');
      }

      // Hepsiburada'dan token al
      const tokenResponse = await this.exchangeHepsiburadaCodeForToken(code);

      // Merchant ID bilgisini çek
      const merchantInfo = await this.getHepsiburadaMerchantInfo(
        tokenResponse.access_token,
      );

      const existing = await this.prisma.integration.findFirst({
        where: { tenantId, platform: 'HEPSIBURADA' },
      });

      if (existing) {
        await this.prisma.integration.update({
          where: { id: existing.id },
          data: {
            apiKey: this.encryption.encrypt(tokenResponse.access_token),
            apiSecret: this.encryption.encrypt(tokenResponse.refresh_token),
            isActive: true,
            apiExtra: {
              merchantId: merchantInfo.merchantId,
              expiresAt: Date.now() + tokenResponse.expires_in * 1000,
            },
          },
        });
      } else {
        await this.prisma.integration.create({
          data: {
            tenantId,
            platform: 'HEPSIBURADA',
            apiKey: this.encryption.encrypt(tokenResponse.access_token),
            apiSecret: this.encryption.encrypt(tokenResponse.refresh_token),
            isActive: true,
            apiExtra: {
              merchantId: merchantInfo.merchantId,
              expiresAt: Date.now() + tokenResponse.expires_in * 1000,
              marketplaceId: 'hepsiburada',
            },
          },
        });
      }

      return res.redirect('/dashboard/stores?success=hepsiburada_connected');
    } catch (err) {
      console.error('Hepsiburada OAuth callback error:', err);
      return res.redirect(
        `/dashboard/stores?error=hepsiburada_callback_failed`,
      );
    }
  }

  /**
   * OAuth başlatma endpoint'i
   * Kullanıcıyı platformun OAuth sayfasına yönlendirir
   */
  @Public()
  @Get('init/:platform')
  async initiateOAuth(
    @Param('platform') platform: string,
    @Query('tenantId') tenantId: string,
    @Query('redirectUri') redirectUri: string,
    @Res() res: Response,
  ) {
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId required' });
    }

    let authUrl: string;

    switch (platform.toLowerCase()) {
      case 'amazon':
      case 'amazon-tr':
        authUrl = this.buildAmazonAuthUrl(tenantId, redirectUri);
        break;
      case 'hepsiburada':
        authUrl = this.buildHepsiburadaAuthUrl(tenantId, redirectUri);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported platform' });
    }

    return res.redirect(authUrl);
  }

  // Private helper methods
  private async exchangeAmazonCodeForToken(code: string, sellerId: string) {
    const clientId = process.env.AMAZON_CLIENT_ID;
    const clientSecret = process.env.AMAZON_CLIENT_SECRET;

    const response = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: `${process.env.API_URL}/oauth/amazon/callback`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    return response.json();
  }

  private async exchangeHepsiburadaCodeForToken(code: string) {
    const clientId = process.env.HEPSIBURADA_CLIENT_ID;
    const clientSecret = process.env.HEPSIBURADA_CLIENT_SECRET;

    const response = await fetch('https://api.hepsiburada.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: `${process.env.API_URL}/oauth/hepsiburada/callback`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Hepsiburada token exchange failed: ${response.status}`);
    }

    return response.json();
  }

  private async getHepsiburadaMerchantInfo(accessToken: string) {
    const response = await fetch('https://api.hepsiburada.com/user/merchant', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to get merchant info');
    }

    return response.json();
  }

  private buildAmazonAuthUrl(tenantId: string, redirectUri?: string): string {
    const clientId = process.env.AMAZON_CLIENT_ID;
    const redirect =
      redirectUri || `${process.env.API_URL}/oauth/amazon/callback`;

    const params = new URLSearchParams({
      application_id: clientId!,
      state: tenantId,
      redirect_uri: redirect,
    });

    return `https://sellercentral.amazon.com/apps/authorize/consent?${params.toString()}`;
  }

  private buildHepsiburadaAuthUrl(
    tenantId: string,
    redirectUri?: string,
  ): string {
    const clientId = process.env.HEPSIBURADA_CLIENT_ID;
    const redirect =
      redirectUri || `${process.env.API_URL}/oauth/hepsiburada/callback`;

    const params = new URLSearchParams({
      client_id: clientId!,
      response_type: 'code',
      state: tenantId,
      redirect_uri: redirect,
      scope: 'read write',
    });

    return `https://api.hepsiburada.com/oauth/authorize?${params.toString()}`;
  }
}
