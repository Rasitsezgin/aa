// Multi-Warehouse Inventory Management
// Support for multiple locations, transfers, and distributed stock

import { prisma } from '@/lib/prisma';

interface Warehouse {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  isDefault: boolean;
  isActive: boolean;
}

interface WarehouseStock {
  id: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  reservedQuantity: number; // For pending orders
  availableQuantity: number; // quantity - reserved
  reorderPoint: number;
  reorderQuantity: number;
  updatedAt: Date;
}

interface StockTransfer {
  id: string;
  tenantId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  requestedBy: string;
  approvedBy?: string;
  shippedAt?: Date;
  receivedAt?: Date;
  notes?: string;
  createdAt: Date;
}

// Warehouse manager
export class WarehouseManager {
  // Create warehouse
  async createWarehouse(
    tenantId: string,
    data: Omit<Warehouse, 'id' | 'tenantId' | 'isActive'>
  ): Promise<Warehouse> {
    // If this is the first warehouse or marked as default, unset others
    if (data.isDefault) {
      await this.unsetDefaultWarehouses(tenantId);
    }

    // Would create in database
    const warehouse: Warehouse = {
      ...data,
      id: crypto.randomUUID(),
      tenantId,
      isActive: true,
    };

    return warehouse;
  }

  // Get warehouse stock
  async getWarehouseStock(
    warehouseId: string,
    filters?: { productId?: string; lowStock?: boolean }
  ): Promise<WarehouseStock[]> {
    // Would fetch from database
    return [];
  }

  // Get product stock across all warehouses
  async getProductStockAcrossWarehouses(
    productId: string,
    tenantId: string
  ): Promise<{
    total: number;
    reserved: number;
    available: number;
    byWarehouse: Array<{
      warehouseId: string;
      warehouseName: string;
      quantity: number;
      reserved: number;
      available: number;
    }>;
  }> {
    // Fetch stock from all warehouses
    const stocks = await this.getProductStock(productId, tenantId);

    const total = stocks.reduce((sum, s) => sum + s.quantity, 0);
    const reserved = stocks.reduce((sum, s) => sum + s.reservedQuantity, 0);

    return {
      total,
      reserved,
      available: total - reserved,
      byWarehouse: stocks.map(s => ({
        warehouseId: s.warehouseId,
        warehouseName: '', // Would fetch warehouse name
        quantity: s.quantity,
        reserved: s.reservedQuantity,
        available: s.availableQuantity,
      })),
    };
  }

  // Reserve stock for order
  async reserveStock(
    orderId: string,
    items: Array<{ productId: string; quantity: number; warehouseId?: string }>,
    tenantId: string
  ): Promise<{
    success: boolean;
    reserved: Array<{ productId: string; warehouseId: string; quantity: number }>;
    unavailable: Array<{ productId: string; requested: number; available: number }>;
  }> {
    const reserved: Array<{ productId: string; warehouseId: string; quantity: number }> = [];
    const unavailable: Array<{ productId: string; requested: number; available: number }> = [];

    for (const item of items) {
      // Find best warehouse with stock
      const warehouseId = item.warehouseId || await this.findBestWarehouse(item.productId, tenantId);
      
      if (!warehouseId) {
        unavailable.push({
          productId: item.productId,
          requested: item.quantity,
          available: 0,
        });
        continue;
      }

      const stock = await this.getStock(warehouseId, item.productId);
      const available = stock.quantity - stock.reservedQuantity;

      if (available >= item.quantity) {
        // Reserve the stock
        await this.updateReservedQuantity(warehouseId, item.productId, item.quantity);
        reserved.push({
          productId: item.productId,
          warehouseId,
          quantity: item.quantity,
        });
      } else {
        unavailable.push({
          productId: item.productId,
          requested: item.quantity,
          available,
        });
      }
    }

    return {
      success: unavailable.length === 0,
      reserved,
      unavailable,
    };
  }

  // Release reserved stock (order cancelled)
  async releaseReservedStock(
    reservedItems: Array<{ productId: string; warehouseId: string; quantity: number }>
  ): Promise<void> {
    for (const item of reservedItems) {
      await this.updateReservedQuantity(
        item.warehouseId,
        item.productId,
        -item.quantity
      );
    }
  }

  // Commit reserved stock (order shipped)
  async commitReservedStock(
    reservedItems: Array<{ productId: string; warehouseId: string; quantity: number }>
  ): Promise<void> {
    for (const item of reservedItems) {
      // Reduce both quantity and reserved
      await this.reduceStock(item.warehouseId, item.productId, item.quantity);
    }
  }

  // Create stock transfer
  async createTransfer(
    tenantId: string,
    data: Omit<StockTransfer, 'id' | 'tenantId' | 'status' | 'createdAt'>
  ): Promise<StockTransfer> {
    // Validate stock availability at source
    for (const item of data.items) {
      const stock = await this.getStock(data.fromWarehouseId, item.productId);
      const available = stock.quantity - stock.reservedQuantity;

      if (available < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${item.productId}. Available: ${available}, Requested: ${item.quantity}`
        );
      }
    }

    const transfer: StockTransfer = {
      ...data,
      id: crypto.randomUUID(),
      tenantId,
      status: 'pending',
      createdAt: new Date(),
    };

    // Would save to database
    return transfer;
  }

  // Approve and ship transfer
  async shipTransfer(transferId: string, approvedBy: string): Promise<void> {
    const transfer = await this.getTransfer(transferId);
    if (!transfer || transfer.status !== 'pending') {
      throw new Error('Transfer not found or already processed');
    }

    // Reserve stock at source
    for (const item of transfer.items) {
      await this.updateReservedQuantity(
        transfer.fromWarehouseId,
        item.productId,
        item.quantity
      );
    }

    // Update transfer status
    // Would update in database
  }

  // Receive transfer
  async receiveTransfer(transferId: string): Promise<void> {
    const transfer = await this.getTransfer(transferId);
    if (!transfer || transfer.status !== 'in_transit') {
      throw new Error('Transfer not found or not in transit');
    }

    // Move stock from source to destination
    for (const item of transfer.items) {
      // Reduce from source (committed)
      await this.reduceStock(transfer.fromWarehouseId, item.productId, item.quantity);
      
      // Add to destination
      await this.addStock(transfer.toWarehouseId, item.productId, item.quantity);
    }

    // Update transfer status
    // Would update in database
  }

  // Get nearest warehouse for shipping
  async findNearestWarehouse(
    customerCity: string,
    tenantId: string
  ): Promise<string | null> {
    // Would implement geolocation logic
    // For now, return default warehouse
    const defaultWarehouse = await this.getDefaultWarehouse(tenantId);
    return defaultWarehouse?.id || null;
  }

  // Get warehouse with most stock
  async findBestWarehouse(
    productId: string,
    tenantId: string
  ): Promise<string | null> {
    const stocks = await this.getProductStock(productId, tenantId);
    
    const best = stocks
      .filter(s => s.availableQuantity > 0)
      .sort((a, b) => b.availableQuantity - a.availableQuantity)[0];

    return best?.warehouseId || null;
  }

  // Private helper methods
  private async unsetDefaultWarehouses(tenantId: string): Promise<void> {
    // Would update database
  }

  private async getDefaultWarehouse(tenantId: string): Promise<Warehouse | null> {
    // Would fetch from database
    return null;
  }

  private async getStock(warehouseId: string, productId: string): Promise<WarehouseStock> {
    // Would fetch from database
    return {
      id: '',
      warehouseId,
      productId,
      quantity: 0,
      reservedQuantity: 0,
      availableQuantity: 0,
      reorderPoint: 0,
      reorderQuantity: 0,
      updatedAt: new Date(),
    };
  }

  private async getProductStock(productId: string, tenantId: string): Promise<WarehouseStock[]> {
    // Would fetch from database
    return [];
  }

  private async updateReservedQuantity(
    warehouseId: string,
    productId: string,
    delta: number
  ): Promise<void> {
    // Would update in database
    console.log(`Updated reserved quantity: ${warehouseId}, ${productId}, ${delta}`);
  }

  private async addStock(
    warehouseId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    // Would update in database
    console.log(`Added stock: ${warehouseId}, ${productId}, ${quantity}`);
  }

  private async reduceStock(
    warehouseId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    // Would update in database
    console.log(`Reduced stock: ${warehouseId}, ${productId}, ${quantity}`);
  }

  private async getTransfer(transferId: string): Promise<StockTransfer | null> {
    // Would fetch from database
    return null;
  }
}

// Stock allocation strategy
export class StockAllocationStrategy {
  // Allocate stock from multiple warehouses if needed
  static allocateFromMultipleWarehouses(
    requiredQuantity: number,
    warehouseStocks: Array<{ warehouseId: string; available: number }>
  ): Array<{ warehouseId: string; quantity: number }> {
    const allocation: Array<{ warehouseId: string; quantity: number }> = [];
    let remaining = requiredQuantity;

    // Sort by available stock (descending)
    const sorted = [...warehouseStocks].sort((a, b) => b.available - a.available);

    for (const stock of sorted) {
      if (remaining <= 0) break;

      const take = Math.min(stock.available, remaining);
      allocation.push({ warehouseId: stock.warehouseId, quantity: take });
      remaining -= take;
    }

    return allocation;
  }

  // Find optimal warehouse based on distance and stock
  static findOptimalWarehouse(
    customerLocation: { lat: number; lng: number },
    warehouses: Array<{
      id: string;
      location: { lat: number; lng: number };
      availableStock: number;
    }>,
    requiredQuantity: number
  ): string | null {
    const eligible = warehouses.filter(w => w.availableStock >= requiredQuantity);
    
    if (eligible.length === 0) return null;

    // Calculate distances and score
    const scored = eligible.map(w => {
      const distance = this.calculateDistance(customerLocation, w.location);
      // Score favors closer warehouses but considers stock levels
      const score = (w.availableStock / requiredQuantity) / (distance + 1);
      return { id: w.id, score };
    });

    return scored.sort((a, b) => b.score - a.score)[0]?.id || null;
  }

  private static calculateDistance(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number }
  ): number {
    // Simplified Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(b.lat - a.lat);
    const dLon = this.toRad(b.lng - a.lng);
    const lat1 = this.toRad(a.lat);
    const lat2 = this.toRad(b.lat);

    const a2 = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));

    return R * c;
  }

  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

// Export
export const warehouseManager = new WarehouseManager();
export { Warehouse, WarehouseStock, StockTransfer };
