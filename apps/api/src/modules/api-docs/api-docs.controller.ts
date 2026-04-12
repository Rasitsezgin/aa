import { Controller, Get } from '@nestjs/common';

@Controller('api/docs')
export class ApiDocsController {
  @Get('swagger')
  async getSwaggerDocs() {
    return {
      openapi: '3.0.0',
      info: {
        title: 'Pazaryönetimi API',
        description: 'E-ticaret platform API dokumentasyonu',
        version: '1.0.0',
        contact: { name: 'API Support', email: 'api@pazaryonetimi.com' },
        license: { name: 'MIT' },
      },
      servers: [
        { url: 'https://api.pazaryonetimi.com/v1', description: 'Production' },
        { url: 'http://localhost:3001/v1', description: 'Development' },
      ],
      paths: {
        '/products': {
          get: {
            tags: ['Products'],
            summary: 'Ürünleri listele',
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1 },
              },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', default: 20 },
              },
              { name: 'search', in: 'query', schema: { type: 'string' } },
              { name: 'category', in: 'query', schema: { type: 'string' } },
            ],
            responses: {
              '200': {
                description: 'Ürün listesi',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: { type: 'array' },
                        pagination: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: ['Products'],
            summary: 'Yeni ürün oluştur',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      price: { type: 'number' },
                      description: { type: 'string' },
                      categoryId: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: { '201': { description: 'Ürün oluşturuldu' } },
          },
        },
        '/orders': {
          get: {
            tags: ['Orders'],
            summary: 'Siparişleri listele',
            parameters: [
              {
                name: 'status',
                in: 'query',
                schema: {
                  type: 'string',
                  enum: ['pending', 'confirmed', 'shipped', 'delivered'],
                },
              },
              {
                name: 'startDate',
                in: 'query',
                schema: { type: 'string', format: 'date' },
              },
            ],
            responses: { '200': { description: 'Sipariş listesi' } },
          },
        },
        '/customers': {
          get: {
            tags: ['Customers'],
            summary: 'Müşterileri listele',
            parameters: [
              { name: 'segment', in: 'query', schema: { type: 'string' } },
            ],
            responses: { '200': { description: 'Müşteri listesi' } },
          },
        },
        '/analytics/sales': {
          get: {
            tags: ['Analytics'],
            summary: 'Satış analitikleri',
            parameters: [
              {
                name: 'period',
                in: 'query',
                schema: {
                  type: 'string',
                  enum: ['day', 'week', 'month', 'year'],
                },
              },
            ],
            responses: { '200': { description: 'Satış verileri' } },
          },
        },
      },
    };
  }

  @Get('sdk/javascript')
  async getJavaScriptSDK() {
    return {
      version: '1.0.0',
      description: 'JavaScript SDK for Pazaryönetimi API',
      installation: 'npm install @pazaryonetimi/sdk',
      documentation: 'https://docs.pazaryonetimi.com',
      github: 'https://github.com/pazaryonetimi/sdk-js',
    };
  }

  @Get('sdk/python')
  async getPythonSDK() {
    return {
      version: '1.0.0',
      description: 'Python SDK for Pazaryönetimi API',
      installation: 'pip install pazaryonetimi-sdk',
      documentation: 'https://docs.pazaryonetimi.com',
      github: 'https://github.com/pazaryonetimi/sdk-python',
    };
  }

  @Get('samples/products')
  async getProductsSample() {
    return {
      curl: 'curl -X GET https://api.pazaryonetimi.com/v1/products -H "Authorization: Bearer YOUR_API_KEY"',
      javascript: `const client = new PazaryonetimiClient({ apiKey: 'your_api_key' });
const products = await client.products.list({ limit: 10 });`,
      python: `import pazaryonetimi
client = pazaryonetimi.Client('your_api_key')
products = client.products.list(limit=10)`,
      go: `client := pazaryonetimi.NewClient("your_api_key")
products, err := client.Products.List(ctx, &ListProductsRequest{Limit: 10})`,
    };
  }

  @Get('reference')
  async getAPIReference() {
    return {
      baseURL: 'https://api.pazaryonetimi.com/v1',
      authentication: {
        type: 'Bearer Token',
        header: 'Authorization: Bearer YOUR_API_KEY',
        example: 'Authorization: Bearer sk_live_abc123xyz789',
      },
      rateLimit: {
        requestsPerMinute: 100,
        requestsPerHour: 5000,
        headerName: 'X-RateLimit-Remaining',
      },
      endpoints: [
        {
          method: 'GET',
          path: '/products',
          description: 'Liste tüm ürünleri',
          permissions: ['products:read'],
        },
        {
          method: 'POST',
          path: '/products',
          description: 'Yeni ürün oluştur',
          permissions: ['products:write'],
        },
        {
          method: 'GET',
          path: '/orders/{id}',
          description: 'Sipariş detayı al',
          permissions: ['orders:read'],
        },
        {
          method: 'PATCH',
          path: '/orders/{id}',
          description: 'Sipariş güncelle',
          permissions: ['orders:write'],
        },
        {
          method: 'GET',
          path: '/analytics/dashboard',
          description: 'Dashboard metrikleri',
          permissions: ['analytics:read'],
        },
        {
          method: 'GET',
          path: '/customers/segments',
          description: 'Müşteri segmentleri',
          permissions: ['customers:read'],
        },
      ],
    };
  }

  @Get('webhooks/events')
  async getWebhookEvents() {
    return {
      events: [
        {
          name: 'product.created',
          description: 'Yeni ürün oluşturuldu',
          payload: {
            id: 'prod_123',
            name: 'Ürün Adı',
            price: 99.99,
            createdAt: '2025-02-03T10:30:00Z',
          },
        },
        {
          name: 'order.placed',
          description: 'Sipariş verildi',
          payload: {
            id: 'ord_456',
            customerId: 'cust_789',
            total: 299.99,
            status: 'pending',
          },
        },
        {
          name: 'order.shipped',
          description: 'Sipariş kargoya verildi',
          payload: {
            id: 'ord_456',
            trackingNumber: 'TR123456789',
            carrier: 'UPS',
          },
        },
        {
          name: 'customer.updated',
          description: 'Müşteri bilgileri güncellendi',
          payload: {
            id: 'cust_789',
            email: 'customer@example.com',
            segment: 'VIP',
          },
        },
        {
          name: 'inventory.alert',
          description: 'Stok uyarısı',
          payload: {
            productId: 'prod_123',
            currentStock: 5,
            alertThreshold: 10,
          },
        },
      ],
    };
  }

  @Get('status')
  async getAPIStatus() {
    return {
      status: 'operational',
      version: '1.0.0',
      lastUpdate: new Date(),
      services: {
        api: { status: 'operational', uptime: '99.99%' },
        database: { status: 'operational', latency: '2ms' },
        cache: { status: 'operational', hitRate: '95%' },
        cdn: { status: 'operational', avgResponseTime: '100ms' },
      },
    };
  }
}
