// Supplier Management System
// Manage supplier relationships, purchase orders, and supplier performance

import { prisma } from '@/lib/prisma';
import { addJob } from '@/lib/queue';

type SupplierStatus = 'active' | 'inactive' | 'on_hold' | 'blacklisted';
type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
type SupplierRating = 'excellent' | 'good' | 'average' | 'poor';

interface Supplier {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  companyName?: string;
  contactName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxNumber?: string;
  website?: string;
  status: SupplierStatus;
  paymentTerms: number; // Days
  currency: string;
  leadTime: number; // Average days
  minimumOrderAmount?: number;
  notes?: string;
  rating?: SupplierRating;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SupplierProduct {
  id: string;
  supplierId: string;
  productId: string;
  supplierSku?: string;
  supplierPrice: number;
  minimumOrderQuantity: number;
  leadTime?: number; // Override supplier default
  isPreferred: boolean;
  lastOrderedAt?: Date;
  notes?: string;
}

interface PurchaseOrder {
  id: string;
  tenantId: string;
  supplierId: string;
  poNumber: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  terms?: string;
  createdBy: string;
  sentAt?: Date;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  receivedQuantity: number;
  notes?: string;
}

// Supplier manager
export class SupplierManager {
  // Create supplier
  async createSupplier(
    tenantId: string,
    data: Omit<Supplier, 'id' | 'tenantId' | 'totalOrders' | 'totalSpent' | 'createdAt' | 'updatedAt'>
  ): Promise<Supplier> {
    // Check if supplier code exists
    const existing = await this.getSupplierByCode(tenantId, data.code);
    if (existing) {
      throw new Error(`Supplier code ${data.code} already exists`);
    }

    const supplier: Supplier = {
      ...data,
      id: crypto.randomUUID(),
      tenantId,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Would save to database
    return supplier;
  }

  // Create purchase order
  async createPurchaseOrder(
    tenantId: string,
    supplierId: string,
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice?: number; // If not provided, use supplier price
      notes?: string;
    }>,
    data: {
      expectedDeliveryDate?: Date;
      notes?: string;
      terms?: string;
      createdBy: string;
    }
  ): Promise<PurchaseOrder> {
    // Validate supplier
    const supplier = await this.getSupplier(supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    // Get supplier products for pricing
    const supplierProducts = await this.getSupplierProducts(supplierId);
    const productPriceMap = new Map(supplierProducts.map(sp => [sp.productId, sp]));

    // Build PO items
    const poItems: PurchaseOrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const supplierProduct = productPriceMap.get(item.productId);
      const unitPrice = item.unitPrice ?? supplierProduct?.supplierPrice ?? 0;
      const total = unitPrice * item.quantity;

      poItems.push({
        id: crypto.randomUUID(),
        purchaseOrderId: '', // Will be set
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        total,
        receivedQuantity: 0,
        notes: item.notes,
      });

      subtotal += total;
    }

    // Calculate tax and total
    const taxRate = 0.18; // 18% KDV
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Generate PO number
    const poNumber = await this.generatePONumber(tenantId);

    const purchaseOrder: PurchaseOrder = {
      id: crypto.randomUUID(),
      tenantId,
      supplierId,
      poNumber,
      status: 'draft',
      items: poItems,
      subtotal,
      taxRate,
      taxAmount,
      total,
      currency: supplier.currency,
      expectedDeliveryDate: data.expectedDeliveryDate,
      notes: data.notes,
      terms: data.terms,
      createdBy: data.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Would save to database
    return purchaseOrder;
  }

  // Send purchase order to supplier
  async sendPurchaseOrder(poId: string): Promise<void> {
    const po = await this.getPurchaseOrder(poId);
    if (!po || po.status !== 'draft') {
      throw new Error('Purchase order not found or not in draft status');
    }

    const supplier = await this.getSupplier(po.supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    // Generate PDF
    const pdfUrl = await this.generatePOPDF(po);

    // Send email
    await addJob('email.send', {
      tenantId: po.tenantId,
      payload: {
        template: 'purchase_order',
        to: supplier.email,
        subject: `Purchase Order ${po.poNumber}`,
        attachments: [{ url: pdfUrl, name: `PO-${po.poNumber}.pdf` }],
        data: {
          poNumber: po.poNumber,
          supplierName: supplier.name,
          total: po.total,
          currency: po.currency,
          expectedDelivery: po.expectedDeliveryDate,
        },
      },
    });

    // Update status
    po.status = 'sent';
    po.sentAt = new Date();
    po.updatedAt = new Date();

    // Would update in database
  }

  // Receive PO items
  async receiveItems(
    poId: string,
    receivedItems: Array<{
      itemId: string;
      quantity: number;
      notes?: string;
    }>
  ): Promise<PurchaseOrder> {
    const po = await this.getPurchaseOrder(poId);
    if (!po) {
      throw new Error('Purchase order not found');
    }

    // Update received quantities
    for (const received of receivedItems) {
      const item = po.items.find(i => i.id === received.itemId);
      if (item) {
        item.receivedQuantity += received.quantity;
        
        // Update product stock
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: received.quantity } },
        });
      }
    }

    // Check if fully received
    const allReceived = po.items.every(item => 
      item.receivedQuantity >= item.quantity
    );

    if (allReceived) {
      po.status = 'received';
      po.actualDeliveryDate = new Date();
    }

    po.updatedAt = new Date();

    // Would update in database
    return po;
  }

  // Get low stock items with supplier info
  async getReorderSuggestions(tenantId: string): Promise<Array<{
    productId: string;
    productName: string;
    currentStock: number;
    reorderPoint: number;
    suggestedQuantity: number;
    preferredSupplier?: {
      id: string;
      name: string;
      price: number;
      leadTime: number;
    };
  }>> {
    // Get products below reorder point
    const products = await prisma.product.findMany({
      where: {
        tenantId,
        status: 'active',
        // stock: { lte: { reorderPoint: true } }, // Simplified
      },
      select: {
        id: true,
        title: true,
        stock: true,
        reorderPoint: true,
        reorderQuantity: true,
      },
    });

    const suggestions = [];

    for (const product of products) {
      if (!product.reorderPoint || product.stock > product.reorderPoint) {
        continue;
      }

      // Get preferred supplier
      const supplierProduct = await this.getPreferredSupplier(product.id);

      suggestions.push({
        productId: product.id,
        productName: product.title,
        currentStock: product.stock,
        reorderPoint: product.reorderPoint,
        suggestedQuantity: product.reorderQuantity || 10,
        preferredSupplier: supplierProduct ? {
          id: supplierProduct.supplierId,
          name: '', // Would fetch supplier name
          price: supplierProduct.supplierPrice,
          leadTime: supplierProduct.leadTime || 7,
        } : undefined,
      });
    }

    return suggestions;
  }

  // Get supplier performance metrics
  async getSupplierPerformance(supplierId: string, period: { from: Date; to: Date }): Promise<{
    totalOrders: number;
    totalSpent: number;
    onTimeDelivery: number; // Percentage
    averageLeadTime: number;
    qualityScore: number; // Based on returns
    rating: SupplierRating;
  }> {
    // Would calculate from historical data
    return {
      totalOrders: 0,
      totalSpent: 0,
      onTimeDelivery: 0,
      averageLeadTime: 0,
      qualityScore: 0,
      rating: 'average',
    };
  }

  // Compare supplier prices for a product
  async compareSupplierPrices(productId: string): Promise<Array<{
    supplierId: string;
    supplierName: string;
    price: number;
    currency: string;
    minimumQuantity: number;
    leadTime: number;
    isPreferred: boolean;
    totalCostFor100: number; // Including shipping estimate
  }>> {
    const supplierProducts = await this.getSupplierProductsForProduct(productId);

    return supplierProducts.map(sp => ({
      supplierId: sp.supplierId,
      supplierName: '', // Would fetch supplier name
      price: sp.supplierPrice,
      currency: 'TRY', // Would fetch from supplier
      minimumQuantity: sp.minimumOrderQuantity,
      leadTime: sp.leadTime || 7,
      isPreferred: sp.isPreferred,
      totalCostFor100: sp.supplierPrice * 100, // Simplified
    }));
  }

  // Auto-generate POs based on reorder points
  async autoGeneratePurchaseOrders(tenantId: string): Promise<{
    generated: number;
    pos: PurchaseOrder[];
  }> {
    const suggestions = await this.getReorderSuggestions(tenantId);
    const generatedPOs: PurchaseOrder[] = [];

    // Group by supplier
    const bySupplier = new Map<string, typeof suggestions>();
    
    for (const suggestion of suggestions) {
      if (!suggestion.preferredSupplier) continue;
      
      const supplierId = suggestion.preferredSupplier.id;
      if (!bySupplier.has(supplierId)) {
        bySupplier.set(supplierId, []);
      }
      bySupplier.get(supplierId)!.push(suggestion);
    }

    // Create PO for each supplier
    for (const [supplierId, items] of bySupplier) {
      try {
        const po = await this.createPurchaseOrder(
          tenantId,
          supplierId,
          items.map(i => ({
            productId: i.productId,
            quantity: i.suggestedQuantity,
          })),
          { createdBy: 'system' }
        );
        
        generatedPOs.push(po);
      } catch (error) {
        console.error(`Failed to create PO for supplier ${supplierId}:`, error);
      }
    }

    return {
      generated: generatedPOs.length,
      pos: generatedPOs,
    };
  }

  // Private helper methods
  private async getSupplier(id: string): Promise<Supplier | null> {
    // Would fetch from database
    return null;
  }

  private async getSupplierByCode(tenantId: string, code: string): Promise<Supplier | null> {
    // Would fetch from database
    return null;
  }

  private async getSupplierProducts(supplierId: string): Promise<SupplierProduct[]> {
    // Would fetch from database
    return [];
  }

  private async getSupplierProductsForProduct(productId: string): Promise<SupplierProduct[]> {
    // Would fetch from database
    return [];
  }

  private async getPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
    // Would fetch from database
    return null;
  }

  private async getPreferredSupplier(productId: string): Promise<SupplierProduct | null> {
    const products = await this.getSupplierProductsForProduct(productId);
    return products.find(p => p.isPreferred) || products[0] || null;
  }

  private async generatePONumber(tenantId: string): Promise<string> {
    const prefix = 'PO';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${date}-${random}`;
  }

  private async generatePOPDF(po: PurchaseOrder): Promise<string> {
    // Would generate PDF
    return `https://storage.example.com/po/${po.id}.pdf`;
  }
}

// Export
export const supplierManager = new SupplierManager();
export { Supplier, SupplierProduct, PurchaseOrder, PurchaseOrderItem };
