import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface SearchQuery {
  q: string;
  filters?: SearchFilter[];
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  types?: string[];
}

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'in';
  value?: any;
  values?: any[];
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  query: string;
  filters?: any;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isFavorite: boolean;
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'filter' | 'saved_search' | 'recent';
  frequency?: number;
}

export interface FullTextSearchResult {
  id: string;
  type: 'product' | 'order' | 'customer' | 'vendor';
  title: string;
  description: string;
  metadata: Record<string, any>;
  relevanceScore: number;
  matchedFields: string[];
}

@Injectable()
export class SearchService {
  private indexedFields = {
    products: ['name', 'description', 'sku', 'category', 'brand'],
    orders: ['orderNumber', 'customerName', 'status', 'items'],
    customers: ['name', 'email', 'phone', 'city', 'country'],
    vendors: ['name', 'description', 'category', 'city'],
  };

  constructor(private prisma: PrismaService) {
    this.initializeSearchIndex();
  }

  /**
   * Initialize search index
   */
  private async initializeSearchIndex() {
    try {
      console.log('Search index initialized');
      // In production, would initialize Elasticsearch or similar
    } catch (error) {
      console.error('Failed to initialize search index:', error);
    }
  }

  /**
   * Perform full-text search
   */
  async search(query: SearchQuery): Promise<FullTextSearchResult[]> {
    const {
      q,
      filters = [],
      limit = 20,
      offset = 0,
      sortBy = '_score',
      sortOrder = 'desc',
      types = ['product', 'order', 'customer', 'vendor'],
    } = query;

    const results: FullTextSearchResult[] = [];

    // Search in each type
    if (types.includes('product')) {
      const products = await this.searchProducts(q, filters, limit, offset);
      results.push(...products);
    }

    if (types.includes('order')) {
      const orders = await this.searchOrders(q, filters, limit, offset);
      results.push(...orders);
    }

    if (types.includes('customer')) {
      const customers = await this.searchCustomers(q, filters, limit, offset);
      results.push(...customers);
    }

    if (types.includes('vendor')) {
      const vendors = await this.searchVendors(q, filters, limit, offset);
      results.push(...vendors);
    }

    // Sort by relevance score
    return results
      .sort((a, b) =>
        sortOrder === 'desc'
          ? b.relevanceScore - a.relevanceScore
          : a.relevanceScore - b.relevanceScore,
      )
      .slice(offset, offset + limit);
  }

  /**
   * Search products
   */
  async searchProducts(
    q: string,
    filters: SearchFilter[],
    limit: number,
    offset: number,
  ): Promise<FullTextSearchResult[]> {
    // Mock implementation
    const products = [
      {
        id: 'prod-001',
        name: 'Samsung Galaxy S24',
        category: 'Elektronik',
        sku: 'SGS24-001',
      },
      {
        id: 'prod-002',
        name: 'iPhone 15 Pro Max',
        category: 'Elektronik',
        sku: 'IP15P-001',
      },
    ];

    return products
      .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
      .map((p) => ({
        id: p.id,
        type: 'product' as const,
        title: p.name,
        description: `SKU: ${p.sku} | Kategorisi: ${p.category}`,
        metadata: { sku: p.sku, category: p.category },
        relevanceScore: this.calculateRelevance(p.name, q),
        matchedFields: ['name'],
      }));
  }

  /**
   * Search orders
   */
  async searchOrders(
    q: string,
    filters: SearchFilter[],
    limit: number,
    offset: number,
  ): Promise<FullTextSearchResult[]> {
    const orders = [
      {
        id: 'order-245',
        orderNumber: '#245',
        customerName: 'Ali Demir',
        status: 'shipped',
      },
      {
        id: 'order-246',
        orderNumber: '#246',
        customerName: 'Ayşe Yılmaz',
        status: 'delivered',
      },
    ];

    return orders
      .filter(
        (o) =>
          o.orderNumber.includes(q) ||
          o.customerName.toLowerCase().includes(q.toLowerCase()),
      )
      .map((o) => ({
        id: o.id,
        type: 'order' as const,
        title: `Sipariş ${o.orderNumber} - ${o.customerName}`,
        description: `Durum: ${o.status}`,
        metadata: {
          orderNumber: o.orderNumber,
          customer: o.customerName,
          status: o.status,
        },
        relevanceScore: this.calculateRelevance(
          `${o.orderNumber} ${o.customerName}`,
          q,
        ),
        matchedFields: ['orderNumber', 'customerName'],
      }));
  }

  /**
   * Search customers
   */
  async searchCustomers(
    q: string,
    filters: SearchFilter[],
    limit: number,
    offset: number,
  ): Promise<FullTextSearchResult[]> {
    const customers = [
      {
        id: 'cust-089',
        name: 'Fatma Kaya',
        email: 'fatma@example.com',
        tier: 'premium',
      },
      {
        id: 'cust-090',
        name: 'İbrahim Çetin',
        email: 'ibrahim@example.com',
        tier: 'standard',
      },
    ];

    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) || c.email.includes(q),
      )
      .map((c) => ({
        id: c.id,
        type: 'customer' as const,
        title: c.name,
        description: `${c.email} | Tier: ${c.tier}`,
        metadata: { email: c.email, tier: c.tier },
        relevanceScore: this.calculateRelevance(`${c.name} ${c.email}`, q),
        matchedFields: ['name', 'email'],
      }));
  }

  /**
   * Search vendors
   */
  async searchVendors(
    q: string,
    filters: SearchFilter[],
    limit: number,
    offset: number,
  ): Promise<FullTextSearchResult[]> {
    const vendors = [
      { id: 'vend-001', name: 'TechMart', category: 'Elektronik' },
      { id: 'vend-002', name: 'FashionHub', category: 'Giyim' },
    ];

    return vendors
      .filter((v) => v.name.toLowerCase().includes(q.toLowerCase()))
      .map((v) => ({
        id: v.id,
        type: 'vendor' as const,
        title: v.name,
        description: `Kategorisi: ${v.category}`,
        metadata: { category: v.category },
        relevanceScore: this.calculateRelevance(v.name, q),
        matchedFields: ['name'],
      }));
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(
    query: string,
    limit: number = 10,
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];

    // Add recent searches
    const recentSearches = await this.prisma.searchHistory.findMany({
      where: { query: { contains: query } },
      distinct: ['query'],
      take: 5,
    });

    suggestions.push(
      ...recentSearches.map((s) => ({
        text: s.query,
        type: 'recent' as const,
        frequency: 1,
      })),
    );

    // Add saved searches
    const savedSearches = await this.prisma.savedSearch.findMany({
      where: { name: { contains: query } },
      take: 3,
    });

    suggestions.push(
      ...savedSearches.map((s) => ({
        text: s.name,
        type: 'saved_search' as const,
      })),
    );

    // Add filter suggestions
    const filterSuggestions = [
      'kategori:Elektronik',
      'durum:aktif',
      'fiyat:>5000',
      'stok:<10',
    ].filter((f) => f.includes(query));

    suggestions.push(
      ...filterSuggestions.map((f) => ({
        text: f,
        type: 'filter' as const,
      })),
    );

    return suggestions.slice(0, limit);
  }

  /**
   * Save search
   */
  async saveSearch(
    userId: string,
    name: string,
    query: string,
    filters?: SearchFilter[],
    description?: string,
  ): Promise<SavedSearch> {
    return this.prisma.savedSearch.create({
      data: {
        userId,
        name,
        query,
        filters: filters as any,
        description,
        isFavorite: false,
        usageCount: 0,
      },
    });
  }

  /**
   * Get saved searches
   */
  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: [{ isFavorite: 'desc' }, { usageCount: 'desc' }],
    });
  }

  /**
   * Get saved search by ID
   */
  async getSavedSearchById(id: string): Promise<SavedSearch | null> {
    return this.prisma.savedSearch.findUnique({
      where: { id },
    });
  }

  /**
   * Update saved search
   */
  async updateSavedSearch(
    id: string,
    data: Partial<SavedSearch>,
  ): Promise<SavedSearch> {
    return this.prisma.savedSearch.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(id: string): Promise<void> {
    await this.prisma.savedSearch.delete({
      where: { id },
    });
  }

  /**
   * Toggle favorite
   */
  async toggleFavorite(id: string): Promise<SavedSearch> {
    const search = await this.getSavedSearchById(id);
    if (!search) {
      throw new Error('Search not found');
    }

    return this.updateSavedSearch(id, {
      isFavorite: !search.isFavorite,
    });
  }

  /**
   * Record search history
   */
  async recordSearch(userId: string, query: string): Promise<void> {
    await this.prisma.searchHistory.create({
      data: {
        userId,
        query,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Get search history
   */
  async getSearchHistory(userId: string, limit: number = 50): Promise<any[]> {
    return this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(userId: string): Promise<void> {
    await this.prisma.searchHistory.deleteMany({
      where: { userId },
    });
  }

  /**
   * Get search analytics
   */
  async getAnalytics(userId?: string) {
    const where = userId ? { userId } : {};

    const totalSearches = await this.prisma.searchHistory.count({ where });
    const uniqueQueries = await this.prisma.searchHistory.findMany({
      where,
      distinct: ['query'],
    });

    const topSearches = await this.prisma.searchHistory.groupBy({
      by: ['query'],
      where,
      _count: true,
      orderBy: { _count: { query: 'desc' } },
      take: 10,
    });

    return {
      totalSearches,
      uniqueQueries: uniqueQueries.length,
      topSearches: topSearches.map((s) => ({
        query: s.query,
        count: s._count,
      })),
      topSavedSearches: await this.prisma.savedSearch.findMany({
        where: userId ? { userId } : {},
        orderBy: { usageCount: 'desc' },
        take: 5,
      }),
    };
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(text: string, query: string): number {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // Exact match
    if (lowerText === lowerQuery) return 1.0;

    // Starts with
    if (lowerText.startsWith(lowerQuery)) return 0.9;

    // Contains
    if (lowerText.includes(lowerQuery)) return 0.7;

    // Partial match
    const queryWords = lowerQuery.split(' ');
    const matchedWords = queryWords.filter((w) => lowerText.includes(w)).length;
    return (matchedWords / queryWords.length) * 0.5;
  }

  /**
   * Index search query (for Elasticsearch)
   */
  async indexQuery(type: string, id: string, data: Record<string, any>) {
    // In production, would index in Elasticsearch
    console.log(`Indexed ${type}:${id}`, data);
  }

  /**
   * Reindex all data
   */
  async reindexAll() {
    try {
      console.log('Starting full reindex...');

      // Simulate reindexing
      const startTime = Date.now();

      // Would reindex products, orders, customers, vendors
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const duration = Date.now() - startTime;
      console.log(`Reindex completed in ${duration}ms`);

      return { success: true, duration };
    } catch (error) {
      console.error('Reindex failed:', error);
      throw error;
    }
  }
}
