// Returns Management (RMA - Return Merchandise Authorization)
// Handle product returns, exchanges, and refunds

import { prisma } from '@/lib/prisma';
import { addJob } from '@/lib/queue';

type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'received' | 'inspecting' | 'completed' | 'refunded';
type ReturnReason = 'defective' | 'wrong_item' | 'not_as_described' | 'customer_remorse' | 'damaged' | 'other';
type ReturnType = 'refund' | 'exchange' | 'store_credit' | 'repair';

interface RMA {
  id: string;
  tenantId: string;
  orderId: string;
  customerId: string;
  rmaNumber: string;
  status: ReturnStatus;
  type: ReturnType;
  reason: ReturnReason;
  reasonDescription?: string;
  items: RMAItem[];
  shippingLabel?: string;
  trackingNumber?: string;
  receivedAt?: Date;
  inspectedAt?: Date;
  completedAt?: Date;
  refundAmount?: number;
  refundMethod?: 'original' | 'store_credit' | 'bank_transfer';
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface RMAItem {
  id: string;
  rmaId: string;
  orderItemId: string;
  productId: string;
  quantity: number;
  condition: 'unopened' | 'opened' | 'used' | 'damaged';
  returnReason: ReturnReason;
  restockingFee: number; // Percentage
  refundAmount: number;
  images: string[];
}

// RMA Manager
export class RMAManager {
  // Create RMA request
  async createRMA(
    tenantId: string,
    data: {
      orderId: string;
      customerId: string;
      type: ReturnType;
      reason: ReturnReason;
      reasonDescription?: string;
      items: Array<{
        orderItemId: string;
        productId: string;
        quantity: number;
        condition: RMAItem['condition'];
        reason: ReturnReason;
        images?: string[];
      }>;
    }
  ): Promise<RMA> {
    // Validate order exists and is eligible for return
    const order = await this.validateOrderForReturn(data.orderId, tenantId);
    if (!order) {
      throw new Error('Order not found or not eligible for return');
    }

    // Check return window (e.g., 30 days)
    const orderAge = Date.now() - order.orderDate.getTime();
    const returnWindow = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    if (orderAge > returnWindow) {
      throw new Error('Return window has expired');
    }

    // Generate RMA number
    const rmaNumber = await this.generateRMANumber(tenantId);

    // Calculate refund amounts
    const itemsWithRefund = await Promise.all(
      data.items.map(async (item) => {
        const orderItem = await this.getOrderItem(item.orderItemId);
        if (!orderItem) throw new Error('Order item not found');

        // Calculate restocking fee based on condition
        const restockingFee = this.calculateRestockingFee(item.condition);
        
        // Calculate refund amount
        const itemTotal = orderItem.unitPrice * item.quantity;
        const refundAmount = itemTotal * (1 - restockingFee / 100);

        return {
          ...item,
          restockingFee,
          refundAmount,
        };
      })
    );

    const rma: RMA = {
      id: crypto.randomUUID(),
      tenantId,
      orderId: data.orderId,
      customerId: data.customerId,
      rmaNumber,
      status: 'pending',
      type: data.type,
      reason: data.reason,
      reasonDescription: data.reasonDescription,
      items: itemsWithRefund.map(item => ({
        id: crypto.randomUUID(),
        rmaId: '', // Will be set
        ...item,
        images: item.images || [],
      })),
      notes: [`RMA created on ${new Date().toISOString()}`],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database
    // await prisma.rMA.create({ data: rma });

    // Send notification to customer
    await this.notifyCustomerRMACreated(rma);

    return rma;
  }

  // Approve RMA
  async approveRMA(rmaId: string, approvedBy: string): Promise<RMA> {
    const rma = await this.getRMA(rmaId);
    if (!rma || rma.status !== 'pending') {
      throw new Error('RMA not found or cannot be approved');
    }

    rma.status = 'approved';
    rma.notes.push(`Approved by ${approvedBy} on ${new Date().toISOString()}`);
    rma.updatedAt = new Date();

    // Generate shipping label
    const shippingLabel = await this.generateShippingLabel(rma);
    rma.shippingLabel = shippingLabel;

    // Update in database
    // await prisma.rMA.update({ ... });

    // Send approval email with shipping label
    await this.notifyCustomerRMAApproved(rma);

    return rma;
  }

  // Reject RMA
  async rejectRMA(rmaId: string, rejectedBy: string, reason: string): Promise<RMA> {
    const rma = await this.getRMA(rmaId);
    if (!rma || rma.status !== 'pending') {
      throw new Error('RMA not found or cannot be rejected');
    }

    rma.status = 'rejected';
    rma.notes.push(`Rejected by ${rejectedBy} on ${new Date().toISOString()}: ${reason}`);
    rma.updatedAt = new Date();

    // Update in database
    // await prisma.rMA.update({ ... });

    // Send rejection email
    await this.notifyCustomerRMARejected(rma, reason);

    return rma;
  }

  // Mark as received
  async markReceived(rmaId: string, trackingNumber?: string): Promise<RMA> {
    const rma = await this.getRMA(rmaId);
    if (!rma || rma.status !== 'approved') {
      throw new Error('RMA not found or not in approved status');
    }

    rma.status = 'received';
    rma.trackingNumber = trackingNumber;
    rma.receivedAt = new Date();
    rma.notes.push(`Items received on ${new Date().toISOString()}`);
    rma.updatedAt = new Date();

    // Update in database
    // await prisma.rMA.update({ ... });

    return rma;
  }

  // Complete inspection
  async completeInspection(
    rmaId: string,
    inspectionResults: Array<{
      itemId: string;
      accepted: boolean;
      condition: RMAItem['condition'];
      notes?: string;
    }>
  ): Promise<RMA> {
    const rma = await this.getRMA(rmaId);
    if (!rma || rma.status !== 'received') {
      throw new Error('RMA not found or not in received status');
    }

    // Update items based on inspection
    for (const result of inspectionResults) {
      const item = rma.items.find(i => i.id === result.itemId);
      if (item) {
        item.condition = result.condition;
        
        // Recalculate refund if condition changed
        if (result.condition !== item.condition) {
          item.restockingFee = this.calculateRestockingFee(result.condition);
          item.refundAmount = item.refundAmount * (1 - item.restockingFee / 100);
        }
      }
    }

    // Calculate total refund
    const acceptedItems = inspectionResults.filter(r => r.accepted);
    const totalRefund = acceptedItems.reduce((sum, result) => {
      const item = rma.items.find(i => i.id === result.itemId);
      return sum + (item?.refundAmount || 0);
    }, 0);

    rma.refundAmount = totalRefund;
    rma.status = 'inspecting';
    rma.inspectedAt = new Date();
    rma.notes.push(`Inspection completed on ${new Date().toISOString()}`);
    rma.updatedAt = new Date();

    // Update in database
    // await prisma.rMA.update({ ... });

    return rma;
  }

  // Complete RMA (process refund/exchange)
  async completeRMA(rmaId: string): Promise<RMA> {
    const rma = await this.getRMA(rmaId);
    if (!rma || rma.status !== 'inspecting') {
      throw new Error('RMA not found or not ready for completion');
    }

    // Process based on type
    switch (rma.type) {
      case 'refund':
        await this.processRefund(rma);
        break;
      case 'exchange':
        await this.processExchange(rma);
        break;
      case 'store_credit':
        await this.processStoreCredit(rma);
        break;
      case 'repair':
        await this.processRepair(rma);
        break;
    }

    rma.status = 'completed';
    rma.completedAt = new Date();
    rma.notes.push(`RMA completed on ${new Date().toISOString()}`);
    rma.updatedAt = new Date();

    // Update in database
    // await prisma.rMA.update({ ... });

    // Update product stock (restock accepted items)
    await this.restockItems(rma);

    return rma;
  }

  // Get RMA statistics
  async getStatistics(tenantId: string, period: { from: Date; to: Date }): Promise<{
    totalReturns: number;
    byStatus: Record<ReturnStatus, number>;
    byReason: Record<ReturnReason, number>;
    totalRefundAmount: number;
    averageProcessingDays: number;
    returnRate: number;
  }> {
    // Would fetch from database
    return {
      totalReturns: 0,
      byStatus: {
        pending: 0,
        approved: 0,
        rejected: 0,
        received: 0,
        inspecting: 0,
        completed: 0,
        refunded: 0,
      },
      byReason: {
        defective: 0,
        wrong_item: 0,
        not_as_described: 0,
        customer_remorse: 0,
        damaged: 0,
        other: 0,
      },
      totalRefundAmount: 0,
      averageProcessingDays: 0,
      returnRate: 0,
    };
  }

  // Private helper methods
  private async validateOrderForReturn(orderId: string, tenantId: string) {
    return await prisma.order.findFirst({
      where: { id: orderId, tenantId },
      select: { id: true, orderDate: true, status: true },
    });
  }

  private async getOrderItem(itemId: string) {
    // Would fetch from database
    return null;
  }

  private async getRMA(id: string): Promise<RMA | null> {
    // Would fetch from database
    return null;
  }

  private async generateRMANumber(tenantId: string): Promise<string> {
    const prefix = 'RMA';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${date}-${random}`;
  }

  private calculateRestockingFee(condition: RMAItem['condition']): number {
    switch (condition) {
      case 'unopened':
        return 0;
      case 'opened':
        return 10;
      case 'used':
        return 20;
      case 'damaged':
        return 50;
      default:
        return 0;
    }
  }

  private async generateShippingLabel(rma: RMA): Promise<string> {
    // Would integrate with shipping provider
    return 'https://shipping.example.com/label/' + rma.id;
  }

  private async processRefund(rma: RMA): Promise<void> {
    // Queue refund processing
    await addJob('payment.refund', {
      tenantId: rma.tenantId,
      orderId: rma.orderId,
      amount: rma.refundAmount,
      reason: `RMA ${rma.rmaNumber}`,
    });

    rma.status = 'refunded';
  }

  private async processExchange(rma: RMA): Promise<void> {
    // Create exchange order
    // Would implement exchange logic
    console.log('Processing exchange for RMA:', rma.id);
  }

  private async processStoreCredit(rma: RMA): Promise<void> {
    // Add store credit to customer account
    // Would implement store credit logic
    console.log('Processing store credit for RMA:', rma.id);
  }

  private async processRepair(rma: RMA): Promise<void> {
    // Send for repair
    // Would implement repair workflow
    console.log('Processing repair for RMA:', rma.id);
  }

  private async restockItems(rma: RMA): Promise<void> {
    for (const item of rma.items) {
      if (item.condition !== 'damaged') {
        // Restock to inventory
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  }

  private async notifyCustomerRMACreated(rma: RMA): Promise<void> {
    await addJob('email.send', {
      tenantId: rma.tenantId,
      payload: {
        template: 'rma_created',
        to: '', // Would fetch from customer
        subject: `Return Request Received - ${rma.rmaNumber}`,
        data: { rmaNumber: rma.rmaNumber, status: rma.status },
      },
    });
  }

  private async notifyCustomerRMAApproved(rma: RMA): Promise<void> {
    await addJob('email.send', {
      tenantId: rma.tenantId,
      payload: {
        template: 'rma_approved',
        to: '', // Would fetch from customer
        subject: `Return Approved - ${rma.rmaNumber}`,
        data: { rmaNumber: rma.rmaNumber, shippingLabel: rma.shippingLabel },
      },
    });
  }

  private async notifyCustomerRMARejected(rma: RMA, reason: string): Promise<void> {
    await addJob('email.send', {
      tenantId: rma.tenantId,
      payload: {
        template: 'rma_rejected',
        to: '', // Would fetch from customer
        subject: `Return Request Rejected - ${rma.rmaNumber}`,
        data: { rmaNumber: rma.rmaNumber, reason },
      },
    });
  }
}

// Export
export const rmaManager = new RMAManager();
export { RMA, RMAItem, ReturnStatus, ReturnReason, ReturnType };
