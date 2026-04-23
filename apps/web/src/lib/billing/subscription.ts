// Subscription Management
// Recurring billing, plans, and subscription lifecycle

import { prisma } from '@/lib/prisma';
import { addJob } from '@/lib/queue';

type BillingInterval = 'monthly' | 'quarterly' | 'yearly';
type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'trialing';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  features: string[];
  limits: {
    products: number;
    orders: number;
    users: number;
    storage: number; // MB
    integrations: number;
  };
  isPopular?: boolean;
  trialDays: number;
}

interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  paymentMethodId?: string;
  latestInvoiceId?: string;
  metadata: Record<string, unknown>;
}

interface Invoice {
  id: string;
  subscriptionId: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  createdAt: Date;
  dueDate: Date;
  paidAt?: Date;
  pdfUrl?: string;
  items: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
}

// Predefined plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Başlangıç',
    description: 'Küçük işletmeler için ideal',
    price: 299,
    currency: 'TRY',
    interval: 'monthly',
    features: [
      '1.000 ürün',
      'Sınırsız sipariş',
      '2 kullanıcı',
      'Temel raporlar',
      'E-posta desteği',
      '2 pazaryeri entegrasyonu',
    ],
    limits: {
      products: 1000,
      orders: Infinity,
      users: 2,
      storage: 1024, // 1GB
      integrations: 2,
    },
    trialDays: 14,
  },
  {
    id: 'growth',
    name: 'Büyüme',
    description: 'Büyüyen işletmeler için',
    price: 599,
    currency: 'TRY',
    interval: 'monthly',
    features: [
      '10.000 ürün',
      'Sınırsız sipariş',
      '5 kullanıcı',
      'Gelişmiş raporlar',
      'Öncelikli destek',
      '10 pazaryeri entegrasyonu',
      'AI asistan',
      'Otomatik iş akışları',
    ],
    limits: {
      products: 10000,
      orders: Infinity,
      users: 5,
      storage: 5120, // 5GB
      integrations: 10,
    },
    isPopular: true,
    trialDays: 14,
  },
  {
    id: 'enterprise',
    name: 'Kurumsal',
    description: 'Büyük ölçekli operasyonlar için',
    price: 1499,
    currency: 'TRY',
    interval: 'monthly',
    features: [
      'Sınırsız ürün',
      'Sınırsız sipariş',
      'Sınırsız kullanıcı',
      'Özel raporlar',
      '7/24 telefon desteği',
      'Sınırsız entegrasyon',
      'API erişimi',
      'Özel geliştirme',
      'SLA garantisi',
    ],
    limits: {
      products: Infinity,
      orders: Infinity,
      users: Infinity,
      storage: 51200, // 50GB
      integrations: Infinity,
    },
    trialDays: 30,
  },
];

// Subscription manager
export class SubscriptionManager {
  // Create subscription
  async createSubscription(
    tenantId: string,
    planId: string,
    paymentMethod?: string
  ): Promise<Subscription> {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const now = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + plan.trialDays);

    const subscription: Subscription = {
      id: crypto.randomUUID(),
      tenantId,
      planId,
      status: plan.trialDays > 0 ? 'trialing' : 'active',
      currentPeriodStart: now,
      currentPeriodEnd: this.calculatePeriodEnd(now, plan.interval),
      trialEnd: plan.trialDays > 0 ? trialEnd : undefined,
      cancelAtPeriodEnd: false,
      paymentMethodId: paymentMethod,
      metadata: { planName: plan.name },
    };

    // Save to database
    // await prisma.subscription.create({ data: subscription });

    // Schedule trial end reminder
    if (plan.trialDays > 0) {
      await this.scheduleTrialReminder(subscription.id, trialEnd);
    }

    return subscription;
  }

  // Change plan
  async changePlan(
    subscriptionId: string,
    newPlanId: string,
    proration: boolean = true
  ): Promise<Subscription> {
    const subscription = await this.getSubscription(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const oldPlan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
    const newPlan = SUBSCRIPTION_PLANS.find(p => p.id === newPlanId);
    
    if (!newPlan) {
      throw new Error('New plan not found');
    }

    // Calculate proration if needed
    if (proration && oldPlan) {
      const proratedAmount = this.calculateProration(
        oldPlan,
        newPlan,
        subscription.currentPeriodStart,
        subscription.currentPeriodEnd
      );

      if (proratedAmount > 0) {
        // Charge difference
        await this.createInvoice(subscriptionId, proratedAmount, 'Plan upgrade');
      } else if (proratedAmount < 0) {
        // Credit difference
        await this.addCredit(subscriptionId, Math.abs(proratedAmount));
      }
    }

    // Update subscription
    subscription.planId = newPlanId;
    subscription.metadata = { ...subscription.metadata, changedAt: new Date() };

    // Would update in database
    return subscription;
  }

  // Cancel subscription
  async cancelSubscription(
    subscriptionId: string,
    atPeriodEnd: boolean = true
  ): Promise<void> {
    const subscription = await this.getSubscription(subscriptionId);
    if (!subscription) return;

    if (atPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
      // Would update in database
    } else {
      // Cancel immediately
      subscription.status = 'cancelled';
      subscription.canceledAt = new Date();
      // Would update in database
    }

    // Send confirmation email
    await addJob('email.send', {
      tenantId: subscription.tenantId,
      payload: {
        template: 'subscription_cancelled',
        to: '', // Would fetch from tenant
        subject: atPeriodEnd ? 'Aboneliğiniz iptal edildi' : 'Aboneliğiniz sonlandırıldı',
      },
    });
  }

  // Process renewal
  async processRenewal(subscriptionId: string): Promise<void> {
    const subscription = await this.getSubscription(subscriptionId);
    if (!subscription || subscription.status === 'cancelled') {
      return;
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
    if (!plan) return;

    // Create invoice
    const invoice = await this.createInvoice(
      subscriptionId,
      plan.price,
      `${plan.name} - ${plan.interval} subscription`
    );

    // Attempt payment
    const paymentSuccess = await this.processPayment(invoice);

    if (paymentSuccess) {
      // Extend subscription period
      subscription.currentPeriodStart = new Date();
      subscription.currentPeriodEnd = this.calculatePeriodEnd(
        subscription.currentPeriodStart,
        plan.interval
      );
      subscription.status = 'active';

      // Would update in database
    } else {
      // Mark as past_due
      subscription.status = 'past_due';
      // Would update in database

      // Send dunning email
      await this.sendDunningEmail(subscription);
    }
  }

  // Get usage against limits
  async getUsage(tenantId: string, plan: SubscriptionPlan): Promise<{
    products: { used: number; limit: number; percentage: number };
    users: { used: number; limit: number; percentage: number };
    storage: { used: number; limit: number; percentage: number };
  }> {
    const [productCount, userCount, storageUsed] = await Promise.all([
      prisma.product.count({ where: { tenantId } }),
      // Would count users from membership table
      Promise.resolve(0),
      // Would calculate storage from files
      Promise.resolve(0),
    ]);

    return {
      products: {
        used: productCount,
        limit: plan.limits.products,
        percentage: plan.limits.products === Infinity 
          ? 0 
          : (productCount / plan.limits.products) * 100,
      },
      users: {
        used: userCount,
        limit: plan.limits.users,
        percentage: plan.limits.users === Infinity 
          ? 0 
          : (userCount / plan.limits.users) * 100,
      },
      storage: {
        used: storageUsed,
        limit: plan.limits.storage,
        percentage: plan.limits.storage === Infinity 
          ? 0 
          : (storageUsed / plan.limits.storage) * 100,
      },
    };
  }

  // Check if tenant has feature access
  async hasFeatureAccess(tenantId: string, feature: string): Promise<boolean> {
    const subscription = await this.getTenantSubscription(tenantId);
    if (!subscription) return false;

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
    if (!plan) return false;

    // Check if feature is in plan
    return plan.features.some(f => 
      f.toLowerCase().includes(feature.toLowerCase())
    );
  }

  // Private methods
  private calculatePeriodEnd(start: Date, interval: BillingInterval): Date {
    const end = new Date(start);
    switch (interval) {
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'quarterly':
        end.setMonth(end.getMonth() + 3);
        break;
      case 'yearly':
        end.setFullYear(end.getFullYear() + 1);
        break;
    }
    return end;
  }

  private calculateProration(
    oldPlan: SubscriptionPlan,
    newPlan: SubscriptionPlan,
    periodStart: Date,
    periodEnd: Date
  ): number {
    const now = new Date();
    const totalDays = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);
    const usedDays = (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);
    const remainingDays = totalDays - usedDays;

    const oldDailyRate = oldPlan.price / totalDays;
    const newDailyRate = newPlan.price / totalDays;

    const oldRemainingValue = oldDailyRate * remainingDays;
    const newRemainingValue = newDailyRate * remainingDays;

    return newRemainingValue - oldRemainingValue;
  }

  private async scheduleTrialReminder(subscriptionId: string, trialEnd: Date): Promise<void> {
    const reminderDate = new Date(trialEnd);
    reminderDate.setDate(reminderDate.getDate() - 3); // 3 days before trial ends

    await addJob('subscription.trial_reminder', {
      subscriptionId,
      scheduledFor: reminderDate,
    });
  }

  private async createInvoice(
    subscriptionId: string,
    amount: number,
    description: string
  ): Promise<Invoice> {
    const invoice: Invoice = {
      id: crypto.randomUUID(),
      subscriptionId,
      tenantId: '', // Would fetch from subscription
      amount,
      currency: 'TRY',
      status: 'open',
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      items: [{ description, amount, quantity: 1 }],
    };

    // Would save to database
    return invoice;
  }

  private async processPayment(invoice: Invoice): Promise<boolean> {
    // Would integrate with payment provider
    // For now, simulate success
    return true;
  }

  private async addCredit(subscriptionId: string, amount: number): Promise<void> {
    // Would add credit to tenant account
    console.log(`Added credit ${amount} to subscription ${subscriptionId}`);
  }

  private async sendDunningEmail(subscription: Subscription): Promise<void> {
    await addJob('email.send', {
      tenantId: subscription.tenantId,
      payload: {
        template: 'payment_failed',
        to: '', // Would fetch from tenant
        subject: 'Ödeme başarısız - Lütfen bilgilerinizi güncelleyin',
      },
    });
  }

  private async getSubscription(id: string): Promise<Subscription | null> {
    // Would fetch from database
    return null;
  }

  private async getTenantSubscription(tenantId: string): Promise<Subscription | null> {
    // Would fetch from database
    return null;
  }
}

// Subscription webhook handler
export async function handleStripeWebhook(event: any): Promise<void> {
  const manager = new SubscriptionManager();

  switch (event.type) {
    case 'invoice.payment_succeeded':
      // Handle successful payment
      break;
    case 'invoice.payment_failed':
      // Handle failed payment
      break;
    case 'customer.subscription.deleted':
      // Handle cancellation
      break;
    case 'customer.subscription.updated':
      // Handle plan change
      break;
  }
}

// Export
export const subscriptionManager = new SubscriptionManager();
export { SubscriptionPlan, Subscription, Invoice, BillingInterval };
