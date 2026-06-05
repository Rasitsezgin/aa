import { Logger } from '@nestjs/common';
import {
  AmazonSpApiCredentials,
  AmazonSpApiRegion,
} from './amazon-sp-api.config';
import { mapAmazonOrder, mapAmazonListingProduct } from './amazon-sp-api.mapper';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const SellingPartnerAPI = require('amazon-sp-api');

type SpApiClient = {
  callAPI: (params: Record<string, unknown>) => Promise<unknown>;
};

export class AmazonSpApiClient {
  private readonly logger = new Logger(AmazonSpApiClient.name);
  private client: SpApiClient | null = null;

  constructor(private readonly credentials: AmazonSpApiCredentials) {}

  static async testLwaCredentials(credentials: {
    refreshToken: string;
    clientId: string;
    clientSecret: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://api.amazon.com/auth/o2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: credentials.refreshToken,
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
        }),
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Amazon LWA token yenileme başarılı',
        };
      }

      const body = await response.text();
      return {
        success: false,
        message: `Amazon LWA testi başarısız (HTTP ${response.status}): ${body.slice(0, 180)}`,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  }

  private async getClient(): Promise<SpApiClient> {
    if (this.client) {
      return this.client;
    }

    this.client = new SellingPartnerAPI({
      region: this.credentials.marketplace.region as AmazonSpApiRegion,
      refresh_token: this.credentials.refreshToken,
      credentials: {
        SELLING_PARTNER_APP_CLIENT_ID: this.credentials.clientId,
        SELLING_PARTNER_APP_CLIENT_SECRET: this.credentials.clientSecret,
        AWS_ACCESS_KEY_ID: this.credentials.awsAccessKeyId,
        AWS_SECRET_ACCESS_KEY: this.credentials.awsSecretAccessKey,
        AWS_SELLING_PARTNER_ROLE: this.credentials.roleArn,
      },
      options: {
        auto_request_tokens: true,
        use_sandbox: false,
      },
    });

    if (!this.client) {
      throw new Error('Amazon SP-API client initialization failed');
    }

    return this.client;
  }

  private createdAfterIso(days = 30): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  }

  async getOrders(): Promise<Record<string, unknown>[]> {
    const client = await this.getClient();
    const response = (await client.callAPI({
      operation: 'getOrders',
      endpoint: 'orders',
      query: {
        MarketplaceIds: [this.credentials.marketplace.spMarketplaceId],
        CreatedAfter: this.createdAfterIso(30),
        MaxResultsPerPage: 50,
      },
    })) as { Orders?: Record<string, unknown>[]; Payload?: { Orders?: Record<string, unknown>[] } };

    const orders = response?.Orders || response?.Payload?.Orders || [];
    return Array.isArray(orders) ? orders : [];
  }

  async syncOrders(): Promise<{
    success: boolean;
    platform: 'AMAZON';
    source: 'sp-api';
    count: number;
    orders: ReturnType<typeof mapAmazonOrder>[];
  }> {
    const rawOrders = await this.getOrders();
    const orders = rawOrders.map((order) =>
      mapAmazonOrder(order, this.credentials.marketplace.currency),
    );

    this.logger.log(
      `Amazon SP-API orders fetched: ${orders.length} (${this.credentials.marketplaceSlug})`,
    );

    return {
      success: true,
      platform: 'AMAZON',
      source: 'sp-api',
      count: orders.length,
      orders,
    };
  }

  async searchListingProducts(limit = 20): Promise<Record<string, unknown>[]> {
    const client = await this.getClient();
    const response = (await client.callAPI({
      operation: 'searchListingsItems',
      endpoint: 'listingsItems',
      path: {
        sellerId: this.credentials.sellerId,
      },
      query: {
        marketplaceIds: [this.credentials.marketplace.spMarketplaceId],
        pageSize: Math.min(Math.max(limit, 1), 20),
      },
    })) as { items?: Record<string, unknown>[] };

    const items = Array.isArray(response?.items) ? response.items : [];
    return items.map((item, index) => mapAmazonListingProduct(item, index));
  }

  async updateStock(sku: string, stock: number): Promise<Record<string, unknown>> {
    const client = await this.getClient();

    const response = await client.callAPI({
      operation: 'patchListingsItem',
      endpoint: 'listingsItems',
      path: {
        sellerId: this.credentials.sellerId,
        sku,
      },
      query: {
        marketplaceIds: [this.credentials.marketplace.spMarketplaceId],
        issueLocale: 'en_US',
      },
      body: {
        productType: 'PRODUCT',
        patches: [
          {
            op: 'replace',
            path: '/attributes/fulfillment_availability',
            value: [
              {
                fulfillment_channel_code: 'DEFAULT',
                quantity: Math.max(0, Math.floor(stock)),
              },
            ],
          },
        ],
      },
    });

    return {
      success: true,
      platform: 'AMAZON',
      sku,
      stock,
      source: 'sp-api',
      response,
    };
  }

  async updatePrice(sku: string, price: number): Promise<Record<string, unknown>> {
    const client = await this.getClient();
    const currency = this.credentials.marketplace.currency;

    const response = await client.callAPI({
      operation: 'patchListingsItem',
      endpoint: 'listingsItems',
      path: {
        sellerId: this.credentials.sellerId,
        sku,
      },
      query: {
        marketplaceIds: [this.credentials.marketplace.spMarketplaceId],
        issueLocale: 'en_US',
      },
      body: {
        productType: 'PRODUCT',
        patches: [
          {
            op: 'replace',
            path: '/attributes/purchasable_offer',
            value: [
              {
                currency,
                our_price: [
                  {
                    schedule: [
                      {
                        value_with_tax: Number(price.toFixed(2)),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    return {
      success: true,
      platform: 'AMAZON',
      sku,
      price,
      source: 'sp-api',
      response,
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const lwa = await AmazonSpApiClient.testLwaCredentials({
      refreshToken: this.credentials.refreshToken,
      clientId: this.credentials.clientId,
      clientSecret: this.credentials.clientSecret,
    });

    if (!lwa.success) {
      return lwa;
    }

    try {
      await this.getOrders();
      return {
        success: true,
        message: 'Amazon SP-API bağlantısı ve sipariş erişimi doğrulandı',
      };
    } catch (error) {
      return {
        success: false,
        message: `Amazon SP-API sipariş erişimi başarısız: ${(error as Error).message}`,
      };
    }
  }
}
