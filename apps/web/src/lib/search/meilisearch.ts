// Meilisearch Integration
// Advanced search with typo-tolerance, facets, and filters

import { MeiliSearch, Index } from 'meilisearch';

interface SearchConfig {
  host: string;
  apiKey: string;
}

interface ProductDocument {
  id: string;
  title: string;
  description: string;
  sku: string;
  barcode?: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  tags: string[];
  status: string;
  tenantId: string;
  images: string[];
  createdAt: string;
}

interface OrderDocument {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  platform: string;
  orderDate: string;
  tenantId: string;
  products: string[]; // Product names for search
}

class MeilisearchClient {
  private client: MeiliSearch;
  private productsIndex: Index<ProductDocument>;
  private ordersIndex: Index<OrderDocument>;

  constructor(config: SearchConfig) {
    this.client = new MeiliSearch({
      host: config.host,
      apiKey: config.apiKey,
    });
    
    this.productsIndex = this.client.index('products');
    this.ordersIndex = this.client.index('orders');
  }

  // Initialize indexes with settings
  async initializeIndexes(): Promise<void> {
    // Product index settings
    await this.productsIndex.updateSettings({
      searchableAttributes: [
        'title',
        'description',
        'sku',
        'barcode',
        'brand',
        'category',
        'tags',
      ],
      filterableAttributes: [
        'tenantId',
        'category',
        'brand',
        'status',
        'stock',
        'price',
        'tags',
      ],
      sortableAttributes: ['price', 'stock', 'createdAt', 'title'],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
        'createdAt:desc',
      ],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
      },
      pagination: {
        maxTotalHits: 10000,
      },
    });

    // Order index settings
    await this.ordersIndex.updateSettings({
      searchableAttributes: [
        'orderNumber',
        'customerName',
        'customerEmail',
        'products',
      ],
      filterableAttributes: [
        'tenantId',
        'status',
        'platform',
        'totalAmount',
        'orderDate',
      ],
      sortableAttributes: ['orderDate', 'totalAmount'],
    });
  }

  // Index products
  async indexProducts(products: ProductDocument[]): Promise<void> {
    await this.productsIndex.addDocuments(products);
  }

  // Index orders
  async indexOrders(orders: OrderDocument[]): Promise<void> {
    await this.ordersIndex.addDocuments(orders);
  }

  // Search products
  async searchProducts(
    query: string,
    tenantId: string,
    options: {
      filters?: string;
      sort?: string[];
      page?: number;
      hitsPerPage?: number;
      facets?: string[];
    } = {}
  ): Promise<{
    hits: ProductDocument[];
    totalHits: number;
    page: number;
    totalPages: number;
    facets?: Record<string, Record<string, number>>;
    processingTimeMs: number;
  }> {
    const filter = `tenantId = ${tenantId}${options.filters ? ` AND ${options.filters}` : ''}`;
    
    const result = await this.productsIndex.search(query, {
      filter,
      sort: options.sort,
      page: options.page || 1,
      hitsPerPage: options.hitsPerPage || 20,
      facets: options.facets,
      attributesToHighlight: ['title', 'description'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });

    return {
      hits: result.hits as ProductDocument[],
      totalHits: result.totalHits,
      page: result.page,
      totalPages: result.totalPages,
      facets: result.facetDistribution,
      processingTimeMs: result.processingTimeMs,
    };
  }

  // Search orders
  async searchOrders(
    query: string,
    tenantId: string,
    options: {
      filters?: string;
      page?: number;
      hitsPerPage?: number;
    } = {}
  ) {
    const filter = `tenantId = ${tenantId}${options.filters ? ` AND ${options.filters}` : ''}`;
    
    return await this.ordersIndex.search(query, {
      filter,
      page: options.page || 1,
      hitsPerPage: options.hitsPerPage || 20,
    });
  }

  // Delete documents
  async deleteProduct(productId: string): Promise<void> {
    await this.productsIndex.deleteDocument(productId);
  }

  async deleteOrder(orderId: string): Promise<void> {
    await this.ordersIndex.deleteDocument(orderId);
  }

  // Get stats
  async getStats() {
    const [productStats, orderStats] = await Promise.all([
      this.productsIndex.getStats(),
      this.ordersIndex.getStats(),
    ]);

    return { products: productStats, orders: orderStats };
  }
}

// Search suggestions (autocomplete)
export async function getSearchSuggestions(
  client: MeilisearchClient,
  query: string,
  tenantId: string,
  limit: number = 5
): Promise<string[]> {
  if (query.length < 2) return [];

  const result = await client.searchProducts(query, tenantId, {
    hitsPerPage: limit,
  });

  return result.hits.map(hit => hit.title);
}

// Faceted search (e-commerce style)
export async function facetedProductSearch(
  client: MeilisearchClient,
  query: string,
  tenantId: string,
  selectedFilters: Record<string, string[]>
) {
  // Build filter string
  const filterParts: string[] = [];
  
  Object.entries(selectedFilters).forEach(([key, values]) => {
    if (values.length > 0) {
      const part = values.map(v => `${key} = '${v}'`).join(' OR ');
      filterParts.push(`(${part})`);
    }
  });

  const filters = filterParts.join(' AND ');

  return await client.searchProducts(query, tenantId, {
    filters,
    facets: ['category', 'brand', 'status'],
    hitsPerPage: 24,
  });
}

// Sync utilities
export async function syncProductsToMeilisearch(
  client: MeilisearchClient,
  tenantId: string
): Promise<{ indexed: number; errors: string[] }> {
  const { prisma } = await import('@/lib/prisma');
  
  const products = await prisma.product.findMany({
    where: { tenantId, status: 'active' },
    include: {
      images: { select: { url: true } },
    },
  });

  const docs: ProductDocument[] = products.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description || '',
    sku: p.sku,
    barcode: p.barcode || undefined,
    category: p.category || 'Uncategorized',
    brand: p.brand || 'Unknown',
    price: Number(p.price),
    stock: p.stock,
    tags: p.tags || [],
    status: p.status,
    tenantId: p.tenantId,
    images: p.images.map(i => i.url),
    createdAt: p.createdAt.toISOString(),
  }));

  try {
    await client.indexProducts(docs);
    return { indexed: docs.length, errors: [] };
  } catch (error) {
    return { indexed: 0, errors: [String(error)] };
  }
}

// Export singleton
let searchClient: MeilisearchClient | null = null;

export function getSearchClient(): MeilisearchClient {
  if (!searchClient) {
    const host = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
    const apiKey = process.env.MEILISEARCH_API_KEY || '';
    
    searchClient = new MeilisearchClient({ host, apiKey });
  }
  
  return searchClient;
}

export { MeilisearchClient, ProductDocument, OrderDocument };
