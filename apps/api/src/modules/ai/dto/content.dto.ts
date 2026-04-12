export class AnalyzeContentDto {
  title: string;
  description?: string;
  platform?: string;
  productId?: string;
  keywords?: string[];
  category?: string;
}

export class OptimizeContentDto {
  title: string;
  description?: string;
  platform: string;
  tone?: string; // professional, friendly, luxury, fun, technical
  productId?: string;
  keywords?: string[];
  category?: string;
  templateId?: string;
}

export class BatchOptimizeDto {
  name: string;
  productIds: string[];
  platform: string;
  tone?: string;
  config?: {
    autoApply?: boolean;
    autoSync?: boolean;
    skipHighScore?: boolean;
    minScoreThreshold?: number;
  };
}

export class ApplyOptimizationDto {
  optimizationId: string;
  syncToPlatform?: boolean;
}

export class BulkApplyOptimizationsDto {
  optimizationIds: string[];
  syncToPlatform?: boolean;
}

export class CreateTemplateDto {
  name: string;
  description?: string;
  platform?: string;
  category?: string;
  tone?: string;
  titleTemplate?: string;
  descriptionTemplate?: string;
  promptTemplate?: string;
  variables?: Record<string, string>;
}

export class UpdateTemplateDto {
  name?: string;
  description?: string;
  platform?: string;
  category?: string;
  tone?: string;
  titleTemplate?: string;
  descriptionTemplate?: string;
  promptTemplate?: string;
  variables?: Record<string, string>;
}

export class CreateContentRuleDto {
  platform: string;
  ruleType: string;
  ruleName: string;
  ruleValue: Record<string, any>;
}

export class GenerateDescriptionDto {
  productName: string;
  keywords?: string[];
  platform: string;
  tone: string;
  category?: string;
  features?: string[];
  templateId?: string;
}

export class CompareContentDto {
  productId: string;
  competitorUrl?: string;
  competitorTitle?: string;
  competitorDescription?: string;
  platform: string;
}
