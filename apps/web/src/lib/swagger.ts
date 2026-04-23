import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'PazarYönetimi API',
        version: '1.0.0',
        description: 'Pazaryeri yönetim SaaS platformu API dokümantasyonu',
        contact: {
          name: 'PazarYönetimi Destek',
          email: 'api@pazaryonetimi.com',
        },
      },
      servers: [
        {
          url: 'https://api.pazaryonetimi.com',
          description: 'Production API',
        },
        {
          url: 'https://staging-api.pazaryonetimi.com',
          description: 'Staging API',
        },
        {
          url: 'http://localhost:3000',
          description: 'Local Development',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
        },
        schemas: {
          Product: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string', example: 'iPhone 15 Pro' },
              description: { type: 'string' },
              sku: { type: 'string', example: 'APP-IPH15-001' },
              barcode: { type: 'string', example: '1234567890123' },
              price: { type: 'number', format: 'decimal', example: 79999.99 },
              stock: { type: 'integer', example: 150 },
              status: { 
                type: 'string', 
                enum: ['active', 'paused', 'draft'],
                example: 'active'
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
            required: ['id', 'title', 'sku', 'price'],
          },
          Order: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              platform: { 
                type: 'string', 
                enum: ['TRENDYOL', 'HEPSIBURADA', 'AMAZON', 'N11', 'CICEKSEPETI'],
                example: 'TRENDYOL'
              },
              marketplaceOrderId: { type: 'string' },
              status: { 
                type: 'string', 
                enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'],
                example: 'CONFIRMED'
              },
              customerName: { type: 'string' },
              customerEmail: { type: 'string', format: 'email' },
              totalAmount: { type: 'number', format: 'decimal' },
              currency: { type: 'string', default: 'TRY' },
              orderDate: { type: 'string', format: 'date-time' },
            },
            required: ['id', 'platform', 'totalAmount'],
          },
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              code: { type: 'string' },
            },
          },
          Pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', default: 1 },
              limit: { type: 'integer', default: 20 },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
        parameters: {
          TenantId: {
            name: 'X-Tenant-Id',
            in: 'header',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Tenant ID',
          },
          PageParam: {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Sayfa numarası',
          },
          LimitParam: {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
            description: 'Sayfa başına öğe sayısı',
          },
        },
      },
      tags: [
        { name: 'Products', description: 'Ürün yönetimi' },
        { name: 'Orders', description: 'Sipariş yönetimi' },
        { name: 'Inventory', description: 'Stok yönetimi' },
        { name: 'Customers', description: 'Müşteri yönetimi' },
        { name: 'Integrations', description: 'Pazaryeri entegrasyonları' },
        { name: 'Analytics', description: 'Raporlama ve analiz' },
        { name: 'Webhooks', description: 'Webhook yönetimi' },
        { name: 'AI', description: 'AI destekli özellikler' },
      ],
    },
  });
  return spec;
};
