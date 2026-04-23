// Zod Validation Schemas
// Comprehensive validation for forms and API inputs

import { z } from 'zod';

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export const userSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(/[A-Z]/, 'En az bir büyük harf içermelidir')
    .regex(/[a-z]/, 'En az bir küçük harf içermelidir')
    .regex(/[0-9]/, 'En az bir rakam içermelidir')
    .regex(/[^A-Za-z0-9]/, 'En az bir özel karakter içermelidir'),
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır').max(50),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır').max(50),
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{10,}$/, 'Geçerli bir telefon numarası giriniz')
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Şifre gereklidir'),
  rememberMe: z.boolean().optional(),
});

export const passwordResetSchema = z.object({
  email: z.string().email(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mevcut şifre gereklidir'),
    newPassword: userSchema.shape.password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

// ============================================================================
// PRODUCT MANAGEMENT
// ============================================================================

export const productSchema = z.object({
  title: z
    .string()
    .min(3, 'Ürün adı en az 3 karakter olmalıdır')
    .max(200, 'Ürün adı en fazla 200 karakter olabilir'),
  
  description: z
    .string()
    .max(5000, 'Açıklama en fazla 5000 karakter olabilir')
    .optional(),
  
  sku: z
    .string()
    .min(3, 'SKU en az 3 karakter olmalıdır')
    .max(50, 'SKU en fazla 50 karakter olabilir')
    .regex(/^[A-Z0-9-_]+$/i, 'SKU sadece harf, rakam, tire ve alt çizgi içerebilir'),
  
  barcode: z
    .string()
    .regex(/^[0-9]{8,13}$/, 'Barkod 8-13 rakam arası olmalıdır')
    .optional()
    .or(z.literal('')),
  
  price: z
    .number()
    .min(0, 'Fiyat 0\'dan küçük olamaz')
    .max(9999999.99, 'Fiyat çok yüksek'),
  
  costPrice: z
    .number()
    .min(0)
    .max(9999999.99)
    .optional(),
  
  stock: z
    .number()
    .int('Stok tam sayı olmalıdır')
    .min(0, 'Stok 0\'dan küçük olamaz')
    .max(999999, 'Stok çok yüksek'),
  
  minStock: z
    .number()
    .int()
    .min(0)
    .optional(),
  
  categoryId: z.string().uuid('Geçerli bir kategori seçiniz').optional(),
  
  brandId: z.string().uuid().optional(),
  
  tags: z.array(z.string()).max(20, 'En fazla 20 etiket ekleyebilirsiniz').optional(),
  
  images: z
    .array(z.string().url('Geçerli bir görsel URL\'si giriniz'))
    .min(1, 'En az bir görsel yüklemelisiniz')
    .max(10, 'En fazla 10 görsel yükleyebilirsiniz'),
  
  status: z.enum(['active', 'paused', 'draft']),
  
  weight: z.number().min(0).max(1000).optional(), // kg
  
  dimensions: z
    .object({
      length: z.number().min(0),
      width: z.number().min(0),
      height: z.number().min(0),
    })
    .optional(),
  
  variants: z
    .array(
      z.object({
        name: z.string(),
        options: z.array(z.string()),
      })
    )
    .max(5)
    .optional(),
});

// Bulk product update
export const bulkProductUpdateSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1),
  updates: z.object({
    price: z.number().min(0).optional(),
    stock: z.number().int().min(0).optional(),
    status: z.enum(['active', 'paused', 'draft']).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// ============================================================================
// ORDER MANAGEMENT
// ============================================================================

export const orderSchema = z.object({
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  
  shippingAddress: z.object({
    title: z.string().optional(),
    fullName: z.string().min(2),
    addressLine1: z.string().min(5),
    addressLine2: z.string().optional(),
    city: z.string().min(2),
    district: z.string().min(2),
    postalCode: z.string().regex(/^[0-9]{5,6}$/),
    country: z.string().default('TR'),
  }),
  
  billingAddress: z.object({
    sameAsShipping: z.boolean().optional(),
    fullName: z.string().min(2).optional(),
    addressLine1: z.string().min(5).optional(),
    city: z.string().min(2).optional(),
    district: z.string().min(2).optional(),
    postalCode: z.string().regex(/^[0-9]{5,6}$/).optional(),
  }),
  
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        sku: z.string(),
        name: z.string(),
        quantity: z.number().int().min(1),
        unitPrice: z.number().min(0),
        totalPrice: z.number().min(0),
      })
    )
    .min(1, 'En az bir ürün eklemelisiniz'),
  
  shippingCost: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  notes: z.string().max(1000).optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
  ]),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// INTEGRATION SETTINGS
// ============================================================================

export const integrationSchema = z.object({
  platform: z.enum([
    'TRENDYOL',
    'HEPSIBURADA',
    'AMAZON',
    'N11',
    'CICEKSEPETI',
    'VIVENSE',
    'PTTAVM',
    'TEKNOZA',
    'MEDIAMARKT',
    'SHOPIER',
  ]),
  
  credentials: z.object({
    apiKey: z.string().min(1, 'API Key gereklidir'),
    apiSecret: z.string().optional(),
    sellerId: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
  }),
  
  settings: z.object({
    autoSync: z.boolean().default(true),
    syncInterval: z.number().int().min(5).max(1440).default(15), // minutes
    syncProducts: z.boolean().default(true),
    syncOrders: z.boolean().default(true),
    syncStock: z.boolean().default(true),
    priceMarkup: z.number().min(-50).max(100).default(0), // percentage
    stockBuffer: z.number().int().min(0).default(0),
  }),
  
  isActive: z.boolean().default(false),
});

// ============================================================================
// SETTINGS & CONFIGURATION
// ============================================================================

export const tenantSettingsSchema = z.object({
  companyName: z.string().min(2).max(100),
  companyEmail: z.string().email(),
  companyPhone: z.string().optional(),
  taxNumber: z.string().regex(/^[0-9]{10,11}$/).optional(),
  taxOffice: z.string().optional(),
  
  address: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    district: z.string().min(2),
    postalCode: z.string().regex(/^[0-9]{5,6}$/),
  }),
  
  defaultCurrency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  defaultLanguage: z.enum(['tr', 'en']).default('tr'),
  timezone: z.string().default('Europe/Istanbul'),
  
  orderSettings: z.object({
    autoConfirm: z.boolean().default(false),
    minOrderAmount: z.number().min(0).default(0),
    freeShippingThreshold: z.number().min(0).optional(),
  }),
  
  notificationSettings: z.object({
    emailNewOrder: z.boolean().default(true),
    emailLowStock: z.boolean().default(true),
    emailDailyReport: z.boolean().default(false),
    whatsappNotifications: z.boolean().default(false),
  }),
});

// ============================================================================
// API & WEBHOOK
// ============================================================================

export const webhookSchema = z.object({
  url: z.string().url('Geçerli bir URL giriniz'),
  events: z
    .array(
      z.enum([
        'product.created',
        'product.updated',
        'product.deleted',
        'order.created',
        'order.updated',
        'order.cancelled',
        'stock.low',
        'integration.synced',
      ])
    )
    .min(1, 'En az bir event seçmelisiniz'),
  
  secret: z.string().min(16, 'Secret en az 16 karakter olmalıdır').optional(),
  
  isActive: z.boolean().default(true),
  
  retryPolicy: z.object({
    maxRetries: z.number().int().min(0).max(5).default(3),
    retryInterval: z.number().int().min(1).max(60).default(5), // seconds
  }),
});

export const apiKeySchema = z.object({
  name: z.string().min(3).max(50),
  permissions: z.array(z.string()).min(1, 'En az bir izin seçmelisiniz'),
  expiresIn: z.number().int().min(1).max(365).optional(), // days
});

// ============================================================================
// CAMPAIGN & MARKETING
// ============================================================================

export const campaignSchema = z.object({
  name: z.string().min(3).max(100),
  subject: z.string().min(5).max(200),
  fromName: z.string().min(2).max(50),
  
  recipients: z.object({
    type: z.enum(['all', 'segment', 'manual']),
    segmentId: z.string().uuid().optional(),
    emails: z.array(z.string().email()).optional(),
  }),
  
  content: z.object({
    html: z.string().min(10),
    text: z.string().optional(),
  }),
  
  scheduling: z.object({
    sendImmediately: z.boolean().default(true),
    scheduledAt: z.date().optional(),
  }),
  
  tracking: z.object({
    trackOpens: z.boolean().default(true),
    trackClicks: z.boolean().default(true),
  }),
});

// ============================================================================
// REPORTS & ANALYTICS
// ============================================================================

export const reportFiltersSchema = z.object({
  dateRange: z.enum([
    'today',
    'yesterday',
    'last7days',
    'last30days',
    'last90days',
    'thisMonth',
    'lastMonth',
    'custom',
  ]),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  platforms: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
});

// ============================================================================
// UTILITY SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const searchSchema = z.object({
  q: z.string().min(1).max(100),
  filters: z.record(z.string()).optional(),
});

export const idSchema = z.object({
  id: z.string().uuid('Geçerli bir ID formatı değil'),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type UserInput = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type IntegrationInput = z.infer<typeof integrationSchema>;
export type TenantSettingsInput = z.infer<typeof tenantSettingsSchema>;
export type WebhookInput = z.infer<typeof webhookSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError['errors'];
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error.errors };
  }
}

export function validatePartial<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: Partial<T>;
  errors?: z.ZodError['errors'];
} {
  const partialSchema = schema.partial();
  return validateInput(partialSchema, data);
}

// Format Zod errors for display
export function formatErrors(errors: z.ZodError['errors']): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  errors.forEach((error) => {
    const path = error.path.join('.');
    formatted[path] = error.message;
  });
  
  return formatted;
}

// ============================================================================
// CUSTOM VALIDATORS
// ============================================================================

// Turkish Tax Number validation
export function validateTaxNumber(taxNumber: string): boolean {
  if (!/^[0-9]{10}$/.test(taxNumber)) return false;
  
  const digits = taxNumber.split('').map(Number);
  const lastDigit = digits[9];
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = digits[i];
    const multiplier = (i + 1) % 2 === 0 ? 2 : 1;
    const product = digit * multiplier;
    sum += product > 9 ? product - 9 : product;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === lastDigit;
}

// Turkish ID Number validation
export function validateTCKN(tckn: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(tckn)) return false;
  
  const digits = tckn.split('').map(Number);
  
  // 10th digit check
  let sum = 0;
  for (let i = 0; i < 9; i += 2) {
    sum += digits[i];
  }
  sum *= 7;
  for (let i = 1; i < 8; i += 2) {
    sum -= digits[i];
  }
  if ((sum % 10 + 10) % 10 !== digits[9]) return false;
  
  // 11th digit check
  let total = 0;
  for (let i = 0; i < 10; i++) {
    total += digits[i];
  }
  if (total % 10 !== digits[10]) return false;
  
  return true;
}

// IBAN validation for Turkey
export function validateIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  if (!/^TR[0-9]{24}$/.test(cleaned)) return false;
  
  // Move first 4 chars to end
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  
  // Replace letters with numbers
  const numeric = rearranged
    .split('')
    .map((char) => {
      if (/[A-Z]/.test(char)) {
        return (char.charCodeAt(0) - 55).toString();
      }
      return char;
    })
    .join('');
  
  // Mod 97 check
  let remainder = '';
  for (let i = 0; i < numeric.length; i++) {
    remainder = (parseInt(remainder + numeric[i]) % 97).toString();
  }
  
  return parseInt(remainder) === 1;
}

// Export Zod for extending schemas
export { z };
