// Type definitions for extension

export interface ScrapedProductData {
  title: string;
  price: number;
  images: string[];
  rating: number;
  reviewCount: number;
  stockStatus: boolean;
}

export interface ScrapedStoreData {
  storeName: string;
  rating: number;
  followerCount: number;
  productCount: number;
  totalReviews?: number;
  establishedDate?: string;
  responseTime?: string;
  platform?: string;
}

export interface ProductAnalysis {
  pricePosition: 'high' | 'low' | 'average';
  rating: number;
  recommendation: string;
  competitorCount?: number;
  avgMarketPrice?: number;
}

export interface ExtensionMessage {
  type: 'ANALYZE_PRODUCT' | 'GET_PRODUCT_DATA' | 'OPEN_DASHBOARD';
  data?: ScrapedProductData;
  platform?: string;
  url?: string;
}
