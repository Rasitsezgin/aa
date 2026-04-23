// Global Search with Meilisearch
// Alternative: Use Algolia for managed solution

interface SearchConfig {
  host: string;
  apiKey: string;
}

interface SearchDocument {
  id: string;
  type: 'product' | 'order' | 'customer' | 'invoice' | 'ticket';
  tenantId: string;
  title: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  updatedAt: number;
}

class SearchClient {
  private config: SearchConfig;
  private indexes: Map<string, string> = new Map([
    ['products', 'products'],
    ['orders', 'orders'],
    ['customers', 'customers'],
  ]);

  constructor(config: SearchConfig) {
    this.config = config;
  }

  // Index a document
  async indexDocument(indexName: string, doc: SearchDocument): Promise<void> {
    const url = `${this.config.host}/indexes/${indexName}/documents`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([doc]),
    });

    if (!response.ok) {
      throw new Error(`Failed to index document: ${await response.text()}`);
    }
  }

  // Bulk index documents
  async bulkIndex(indexName: string, docs: SearchDocument[]): Promise<void> {
    const batchSize = 1000;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      await this.indexDocument(indexName, batch as unknown as SearchDocument);
    }
  }

  // Search across all indexes
  async search(
    query: string,
    options: {
      tenantId: string;
      types?: string[];
      limit?: number;
      offset?: number;
      filters?: string;
    }
  ): Promise<{ hits: SearchDocument[]; total: number; processingTimeMs: number }> {
    const { tenantId, types, limit = 20, offset = 0, filters } = options;

    // Search each index
    const searchPromises = (types || ['products', 'orders', 'customers']).map(async (indexName) => {
      const url = `${this.config.host}/indexes/${indexName}/search`;

      const filterString = filters
        ? `tenantId = ${tenantId} AND ${filters}`
        : `tenantId = ${tenantId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          limit,
          offset,
          filter: filterString,
          attributesToHighlight: ['title', 'description'],
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
        }),
      });

      if (!response.ok) {
        return { hits: [], estimatedTotalHits: 0, processingTimeMs: 0 };
      }

      return response.json();
    });

    const results = await Promise.all(searchPromises);

    // Combine and sort results
    const allHits = results.flatMap((r, idx) =>
      (r.hits || []).map((hit: Record<string, unknown>) => ({
        ...hit,
        type: (types || ['products', 'orders', 'customers'])[idx],
      }))
    ) as SearchDocument[];

    // Sort by relevance (simplified)
    allHits.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    const totalProcessingTime = results.reduce((sum, r) => sum + (r.processingTimeMs || 0), 0);

    return {
      hits: allHits.slice(0, limit),
      total: results.reduce((sum, r) => sum + (r.estimatedTotalHits || 0), 0),
      processingTimeMs: totalProcessingTime,
    };
  }

  // Delete document from index
  async deleteDocument(indexName: string, documentId: string): Promise<void> {
    const url = `${this.config.host}/indexes/${indexName}/documents/${documentId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete document');
    }
  }

  // Update search settings for tenant
  async configureIndex(indexName: string, tenantId: string): Promise<void> {
    const url = `${this.config.host}/indexes/${indexName}/settings`;

    const settings = {
      searchableAttributes: ['title', 'description', 'tags', 'sku', 'barcode'],
      filterableAttributes: ['tenantId', 'type', 'status', 'category'],
      sortableAttributes: ['updatedAt', 'createdAt', 'price'],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
        'updatedAt:desc',
      ],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
      },
    };

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error('Failed to configure index');
    }
  }

  // Get search suggestions (autocomplete)
  async getSuggestions(
    query: string,
    tenantId: string,
    limit = 5
  ): Promise<Array<{ query: string; count: number }>> {
    const url = `${this.config.host}/indexes/products/search`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        limit,
        filter: `tenantId = ${tenantId}`,
        attributesToRetrieve: ['title'],
      }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return (data.hits || []).map((hit: { title?: string }) => ({
      query: hit.title || '',
      count: 1,
    }));
  }
}

// React hook for search
export function useGlobalSearch() {
  const search = async (
    query: string,
    tenantId: string,
    options?: { types?: string[]; limit?: number }
  ) => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, tenantId, ...options }),
    });

    if (!response.ok) {
      throw new Error('Search failed');
    }

    return response.json();
  };

  return { search };
}

export { SearchClient };
export type { SearchDocument, SearchConfig };
