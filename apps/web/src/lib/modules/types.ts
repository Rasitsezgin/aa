// Modül Sistemi Type Tanımlamaları

export type ModuleCategory = 
  | 'AI_TOOLS'
  | 'ANALYTICS'
  | 'MARKETPLACE'
  | 'FINANCE'
  | 'MARKETING'
  | 'LOGISTICS'
  | 'AUTOMATION'
  | 'REPORTS';

export type Plan = 'FREE' | 'PRO' | 'ENTERPRISE';

export type AnnouncementType = 
  | 'INFO'
  | 'WARNING'
  | 'SUCCESS'
  | 'PROMOTION'
  | 'MAINTENANCE'
  | 'UPDATE';

export type AnnouncementTarget = 
  | 'ALL'
  | 'FREE_USERS'
  | 'PRO_USERS'
  | 'ENTERPRISE_USERS'
  | 'SPECIFIC_TENANTS';

export interface SystemModule {
  id: string;
  key: string;
  name: string;
  description?: string;
  icon?: string;
  category: ModuleCategory;
  
  // Fiyatlandırma
  basePrice: number;
  monthlyPrice: number;
  yearlyPrice?: number;
  
  // Plan kısıtlamaları
  requiredPlan: Plan;
  isCore: boolean;
  isActive: boolean;
  isBeta: boolean;
  isNew: boolean;
  
  // Özellikler
  features?: string[];
  config?: Record<string, any>;
  permissions?: string[];
  dependencies?: string[];
  
  // İstatistikler
  usageCount: number;
  rating?: number;
  
  // Menü
  sortOrder: number;
  showInMenu: boolean;
  menuPath?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantModule {
  id: string;
  tenantId: string;
  moduleId: string;
  module?: SystemModule;
  
  isEnabled: boolean;
  customConfig?: Record<string, any>;
  
  startDate: Date;
  endDate?: Date;
  isTrial: boolean;
  trialEndsAt?: Date;
  
  lastUsedAt?: Date;
  usageCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  summary?: string;
  
  type: AnnouncementType;
  target: AnnouncementTarget;
  targetTenants?: string[];
  
  icon?: string;
  color?: string;
  imageUrl?: string;
  actionUrl?: string;
  actionText?: string;
  
  startsAt: Date;
  endsAt?: Date;
  
  isActive: boolean;
  isPinned: boolean;
  priority: number;
  
  viewCount: number;
  dismissCount: number;
  
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  
  isRead?: boolean;
  isDismissed?: boolean;
}

export interface ModuleAccess {
  hasAccess: boolean;
  isEnabled: boolean;
  isTrial: boolean;
  trialDaysLeft?: number;
  requiredPlan: Plan;
  currentPlan: Plan;
  canUpgrade: boolean;
}

// Modül kategorileri için meta bilgiler
export const MODULE_CATEGORIES: Record<ModuleCategory, { name: string; icon: string; color: string }> = {
  AI_TOOLS: { name: 'AI Araçları', icon: 'Sparkles', color: 'purple' },
  ANALYTICS: { name: 'Analitik', icon: 'BarChart3', color: 'blue' },
  MARKETPLACE: { name: 'Pazaryeri', icon: 'Store', color: 'green' },
  FINANCE: { name: 'Finans', icon: 'CreditCard', color: 'yellow' },
  MARKETING: { name: 'Pazarlama', icon: 'Megaphone', color: 'pink' },
  LOGISTICS: { name: 'Lojistik', icon: 'Truck', color: 'orange' },
  AUTOMATION: { name: 'Otomasyon', icon: 'Zap', color: 'cyan' },
  REPORTS: { name: 'Raporlar', icon: 'FileText', color: 'slate' },
};

// Duyuru tipleri için meta bilgiler
export const ANNOUNCEMENT_TYPES: Record<AnnouncementType, { name: string; icon: string; color: string }> = {
  INFO: { name: 'Bilgi', icon: 'Info', color: 'blue' },
  WARNING: { name: 'Uyarı', icon: 'AlertTriangle', color: 'yellow' },
  SUCCESS: { name: 'Başarı', icon: 'CheckCircle', color: 'green' },
  PROMOTION: { name: 'Promosyon', icon: 'Gift', color: 'purple' },
  MAINTENANCE: { name: 'Bakım', icon: 'Wrench', color: 'orange' },
  UPDATE: { name: 'Güncelleme', icon: 'RefreshCw', color: 'cyan' },
};

// Plan özellikleri
export const PLAN_FEATURES: Record<Plan, { name: string; moduleLimit: number | 'unlimited'; color: string }> = {
  FREE: { name: 'Ücretsiz', moduleLimit: 3, color: 'slate' },
  PRO: { name: 'Pro', moduleLimit: 10, color: 'blue' },
  ENTERPRISE: { name: 'Kurumsal', moduleLimit: 'unlimited', color: 'purple' },
};
