import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService, SearchFilter } from './search.service';

// DTOs
export class SearchQueryDto {
  q: string;
  filters?: SearchFilter[];
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  types?: string[];
}

export class SaveSearchDto {
  name: string;
  query: string;
  filters?: SearchFilter[];
  description?: string;
}

export class UpdateSavedSearchDto {
  name?: string;
  description?: string;
  filters?: SearchFilter[];
  isFavorite?: boolean;
}

@ApiTags('Search & Advanced Filtering')
@Controller('api/search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  /**
   * Full-text search
   */
  @Post('query')
  @ApiOperation({ summary: 'Perform full-text search' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    schema: {
      example: [
        {
          id: 'prod-001',
          type: 'product',
          title: 'Samsung Galaxy S24',
          description: 'Latest flagship smartphone',
          relevanceScore: 0.98,
          matchedFields: ['name', 'description'],
        },
      ],
    },
  })
  async search(@Body() dto: SearchQueryDto) {
    if (!dto.q || dto.q.trim().length === 0) {
      throw new BadRequestException('Search query is required');
    }

    // Record search history
    await this.searchService.recordSearch('system', dto.q);

    return this.searchService.search(dto);
  }

  /**
   * Get search suggestions
   */
  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiResponse({
    status: 200,
    description: 'Search suggestions',
    schema: {
      example: [
        { text: 'Samsung Galaxy', type: 'recent', frequency: 5 },
        { text: 'High-Value Customers', type: 'saved_search' },
        { text: 'kategori:Elektronik', type: 'filter' },
      ],
    },
  })
  async getSuggestions(
    @Query('q') query: string,
    @Query('limit') limit: string = '10',
  ) {
    if (!query) {
      return [];
    }

    return this.searchService.getSuggestions(query, parseInt(limit));
  }

  /**
   * Save search
   */
  @Post('saved')
  @ApiOperation({ summary: 'Save search query' })
  @ApiResponse({
    status: 201,
    description: 'Search saved',
  })
  async saveSearch(@Request() req: any, @Body() dto: SaveSearchDto) {
    return this.searchService.saveSearch(
      req.user.id,
      dto.name,
      dto.query,
      dto.filters,
      dto.description,
    );
  }

  /**
   * Get saved searches
   */
  @Get('saved')
  @ApiOperation({ summary: 'Get saved searches' })
  @ApiResponse({
    status: 200,
    description: 'List of saved searches',
  })
  async getSavedSearches(@Request() req: any) {
    return this.searchService.getSavedSearches(req.user.id);
  }

  /**
   * Get saved search by ID
   */
  @Get('saved/:id')
  @ApiOperation({ summary: 'Get saved search by ID' })
  @ApiResponse({
    status: 200,
    description: 'Saved search details',
  })
  async getSavedSearch(@Param('id') id: string) {
    const search = await this.searchService.getSavedSearchById(id);
    if (!search) {
      throw new BadRequestException('Saved search not found');
    }
    return search;
  }

  /**
   * Update saved search
   */
  @Put('saved/:id')
  @ApiOperation({ summary: 'Update saved search' })
  @ApiResponse({
    status: 200,
    description: 'Search updated',
  })
  async updateSavedSearch(
    @Param('id') id: string,
    @Body() dto: UpdateSavedSearchDto,
  ) {
    return this.searchService.updateSavedSearch(id, dto);
  }

  /**
   * Delete saved search
   */
  @Delete('saved/:id')
  @ApiOperation({ summary: 'Delete saved search' })
  @ApiResponse({
    status: 200,
    description: 'Search deleted',
  })
  async deleteSavedSearch(@Param('id') id: string) {
    await this.searchService.deleteSavedSearch(id);
    return { success: true };
  }

  /**
   * Toggle favorite
   */
  @Put('saved/:id/favorite')
  @ApiOperation({ summary: 'Toggle saved search as favorite' })
  @ApiResponse({
    status: 200,
    description: 'Favorite status updated',
  })
  async toggleFavorite(@Param('id') id: string) {
    return this.searchService.toggleFavorite(id);
  }

  /**
   * Get search history
   */
  @Get('history')
  @ApiOperation({ summary: 'Get search history' })
  @ApiResponse({
    status: 200,
    description: 'Search history',
  })
  async getHistory(@Request() req: any, @Query('limit') limit: string = '50') {
    return this.searchService.getSearchHistory(req.user.id, parseInt(limit));
  }

  /**
   * Clear search history
   */
  @Delete('history')
  @ApiOperation({ summary: 'Clear search history' })
  @ApiResponse({
    status: 200,
    description: 'History cleared',
  })
  async clearHistory(@Request() req: any) {
    await this.searchService.clearSearchHistory(req.user.id);
    return { success: true };
  }

  /**
   * Get search analytics
   */
  @Get('analytics')
  @ApiOperation({ summary: 'Get search analytics' })
  @ApiResponse({
    status: 200,
    description: 'Search analytics',
  })
  async getAnalytics(@Request() req: any) {
    return this.searchService.getAnalytics(req.user.id);
  }

  /**
   * Get global search analytics
   */
  @Get('analytics/global')
  @ApiOperation({ summary: 'Get global search analytics' })
  @ApiResponse({
    status: 200,
    description: 'Global search analytics',
  })
  async getGlobalAnalytics() {
    return this.searchService.getAnalytics();
  }

  /**
   * Reindex search database
   */
  @Post('reindex')
  @ApiOperation({ summary: 'Trigger full search reindex' })
  @ApiResponse({
    status: 200,
    description: 'Reindex started',
  })
  async reindex() {
    return this.searchService.reindexAll();
  }

  /**
   * Get search filters
   */
  @Get('filters')
  @ApiOperation({ summary: 'Get available search filters' })
  @ApiResponse({
    status: 200,
    description: 'Available filters',
    schema: {
      example: {
        products: {
          category: ['Elektronik', 'Giyim', 'Kitap'],
          status: ['Aktif', 'İnaktif', 'Arşiv'],
          priceRange: { min: 0, max: 1000000 },
        },
        orders: {
          status: ['Pending', 'Processing', 'Shipped', 'Delivered'],
          dateRange: { min: '2025-01-01', max: '2025-12-31' },
        },
        customers: {
          tier: ['Bronze', 'Silver', 'Gold', 'Platinum'],
          country: ['Türkiye', 'Germany', 'UK'],
        },
      },
    },
  })
  async getFilters() {
    return {
      products: {
        category: ['Elektronik', 'Giyim', 'Kitap', 'Spor', 'Ev & Bahçe'],
        status: ['Aktif', 'İnaktif', 'Arşiv', 'Kaldırılmış'],
        priceRange: { min: 0, max: 1000000 },
        stockStatus: ['In Stock', 'Low Stock', 'Out of Stock'],
        brand: ['Samsung', 'Apple', 'Sony', 'LG'],
      },
      orders: {
        status: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
        paymentStatus: ['Unpaid', 'Paid', 'Failed', 'Refunded'],
        dateRange: { min: '2025-01-01', max: '2025-12-31' },
        paymentMethod: ['Credit Card', 'Debit Card', 'Bank Transfer', 'E-Wallet'],
      },
      customers: {
        tier: ['Bronze', 'Silver', 'Gold', 'Platinum', 'VIP'],
        country: ['Türkiye', 'Germany', 'France', 'UK', 'USA'],
        status: ['Active', 'Inactive', 'Suspended'],
        joinDateRange: { min: '2020-01-01', max: '2025-12-31' },
      },
      vendors: {
        category: ['Elektronik', 'Giyim', 'Kitap'],
        status: ['Active', 'Inactive', 'Suspended'],
        rating: { min: 0, max: 5 },
        country: ['Türkiye', 'Germany', 'UK'],
      },
    };
  }

  /**
   * Get search metrics
   */
  @Get('metrics')
  @ApiOperation({ summary: 'Get search system metrics' })
  @ApiResponse({
    status: 200,
    description: 'Search metrics',
    schema: {
      example: {
        indexedItems: 1250000,
        indexHealth: 'healthy',
        indexSize: '2.5 GB',
        averageQueryTime: 125,
        queriesPerSecond: 42,
        lastIndexUpdate: '2025-03-01T10:30:00Z',
        nextScheduledIndex: '2025-03-02T02:00:00Z',
      },
    },
  })
  async getMetrics() {
    return {
      indexedItems: 1250000,
      indexHealth: 'healthy',
      indexSize: '2.5 GB',
      averageQueryTime: 125, // milliseconds
      queriesPerSecond: 42,
      lastIndexUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      nextScheduledIndex: new Date(Date.now() + 24 * 60 * 60 * 1000),
      populatedFields: {
        products: { indexed: 45000, total: 45000 },
        orders: { indexed: 125000, total: 125000 },
        customers: { indexed: 85000, total: 85000 },
        vendors: { indexed: 1000, total: 1000 },
      },
    };
  }
}
