// Unified Checkout
// Multi-channel checkout with payment orchestration

import { EventEmitter } from 'events';

type CheckoutStatus = 'draft' | 'active' | 'payment_pending' | 'completed' | 'cancelled' | 'failed';
type PaymentMethod = 'card' | 'bank_transfer' | 'paypal' | 'wallet' | 'bnpl' | 'crypto' | 'cod';

interface CheckoutSession {
  id: string;
  tenantId: string;
  customerId: string;
  cartId: string;
  status: CheckoutStatus;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    currency: string;
    name: string;
    image?: string;
  }>;
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  payment?: {
    method: PaymentMethod;
    provider?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    transactionId?: string;
    metadata?: Record<string, unknown>;
  };
  metadata: {
    source: 'web' | 'mobile' | 'pos' | 'api';
    utm?: Record<string, string>;
    customFields?: Record<string, unknown>;
  };
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

interface PaymentProvider {
  id: string;
  name: string;
  methods: PaymentMethod[];
  config: Record<string, string>;
  supportedCurrencies: string[];
  sandbox: boolean;
}

interface ShippingOption {
  id: string;
  name: string;
  carrier: string;
  service: string;
  price: number;
  currency: string;
  estimatedDays: { min: number; max: number };
  tracking: boolean;
}

// Unified Checkout Manager
export class UnifiedCheckout extends EventEmitter {
  private sessions: Map<string, CheckoutSession> = new Map();
  private providers: Map<string, PaymentProvider> = new Map();

  // Create checkout session
  createSession(
    tenantId: string,
    customerId: string,
    cart: {
      items: CheckoutSession['items'];
      currency: string;
    },
    options: {
      source: CheckoutSession['metadata']['source'];
      expiresInMinutes?: number;
    }
  ): CheckoutSession {
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const session: CheckoutSession = {
      id: crypto.randomUUID(),
      tenantId,
      customerId,
      cartId: crypto.randomUUID(),
      status: 'draft',
      items: cart.items,
      totals: {
        subtotal,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: subtotal,
        currency: cart.currency,
      },
      metadata: {
        source: options.source,
      },
      expiresAt: new Date(Date.now() + (options.expiresInMinutes || 30) * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(session.id, session);
    this.emit('sessionCreated', session);
    return session;
  }

  // Update shipping address
  updateShippingAddress(
    sessionId: string,
    address: CheckoutSession['shippingAddress']
  ): CheckoutSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.shippingAddress = address;
    session.status = 'active';
    session.updatedAt = new Date();

    // Recalculate shipping
    this.calculateShipping(session);

    this.emit('shippingUpdated', session);
    return session;
  }

  // Get shipping options
  async getShippingOptions(
    sessionId: string
  ): Promise<ShippingOption[]> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    if (!session.shippingAddress) throw new Error('Shipping address required');

    // Mock shipping options
    return [
      {
        id: 'standard',
        name: 'Standard Shipping',
        carrier: 'UPS',
        service: 'Ground',
        price: 15,
        currency: session.totals.currency,
        estimatedDays: { min: 3, max: 5 },
        tracking: true,
      },
      {
        id: 'express',
        name: 'Express Shipping',
        carrier: 'FedEx',
        service: '2Day',
        price: 35,
        currency: session.totals.currency,
        estimatedDays: { min: 1, max: 2 },
        tracking: true,
      },
    ];
  }

  // Select shipping option
  selectShippingOption(sessionId: string, optionId: string): CheckoutSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Calculate new totals
    const shipping = optionId === 'express' ? 35 : 15;
    session.totals.shipping = shipping;
    session.totals.total = session.totals.subtotal + shipping + session.totals.tax - session.totals.discount;
    session.updatedAt = new Date();

    this.emit('shippingSelected', { session, optionId });
    return session;
  }

  // Get available payment methods
  getPaymentMethods(
    sessionId: string,
    options: {
      country?: string;
      currency?: string;
    } = {}
  ): Array<{
    method: PaymentMethod;
    providers: string[];
    icon: string;
    name: string;
  }> {
    const methods: Array<{
      method: PaymentMethod;
      name: string;
      icon: string;
      providers: string[];
    }> = [
      { method: 'card', name: 'Credit Card', icon: 'credit-card', providers: ['stripe', 'adyen'] },
      { method: 'paypal', name: 'PayPal', icon: 'paypal', providers: ['paypal'] },
      { method: 'wallet', name: 'Digital Wallet', icon: 'wallet', providers: ['apple_pay', 'google_pay'] },
      { method: 'bnpl', name: 'Buy Now Pay Later', icon: 'installments', providers: ['klarna', 'afterpay'] },
    ];

    return methods;
  }

  // Initiate payment
  async initiatePayment(
    sessionId: string,
    method: PaymentMethod,
    providerId: string
  ): Promise<{
    clientSecret?: string;
    redirectUrl?: string;
    paymentIntentId: string;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.payment = {
      method,
      provider: providerId,
      status: 'pending',
    };
    session.status = 'payment_pending';
    session.updatedAt = new Date();

    this.emit('paymentInitiated', session);

    // Mock payment initiation
    return {
      clientSecret: 'pi_' + crypto.randomUUID().replace(/-/g, ''),
      paymentIntentId: 'pi_' + Date.now(),
    };
  }

  // Confirm payment
  async confirmPayment(
    sessionId: string,
    paymentResult: {
      success: boolean;
      transactionId?: string;
      error?: string;
    }
  ): Promise<CheckoutSession> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    if (paymentResult.success) {
      session.payment!.status = 'completed';
      session.payment!.transactionId = paymentResult.transactionId;
      session.status = 'completed';
      session.completedAt = new Date();

      this.emit('paymentCompleted', session);
      this.emit('orderCreated', session);
    } else {
      session.payment!.status = 'failed';
      session.status = 'failed';

      this.emit('paymentFailed', { session, error: paymentResult.error });
    }

    session.updatedAt = new Date();
    return session;
  }

  // Apply discount/coupon
  applyDiscount(sessionId: string, code: string): CheckoutSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Mock discount validation
    const discount = 10; // 10 currency units

    session.totals.discount = discount;
    session.totals.total = session.totals.subtotal + session.totals.shipping + session.totals.tax - discount;
    session.updatedAt = new Date();

    this.emit('discountApplied', { session, code });
    return session;
  }

  // Abandoned cart recovery
  async checkAbandonedSessions(): Promise<{
    abandoned: CheckoutSession[];
    notified: number;
  }> {
    const now = new Date();
    const abandoned: CheckoutSession[] = [];
    let notified = 0;

    for (const session of this.sessions.values()) {
      if (session.status === 'draft' || session.status === 'active') {
        const age = now.getTime() - session.createdAt.getTime();
        
        // Abandoned if older than 1 hour
        if (age > 60 * 60 * 1000) {
          abandoned.push(session);
          notified++;
          
          this.emit('cartAbandoned', session);
        }
      }
    }

    return { abandoned, notified };
  }

  // Get session
  getSession(sessionId: string): CheckoutSession | null {
    return this.sessions.get(sessionId) || null;
  }

  // Private methods
  private calculateShipping(session: CheckoutSession): void {
    // Mock shipping calculation based on address and items
    const baseRate = 15;
    session.totals.shipping = baseRate;
    session.totals.total = session.totals.subtotal + baseRate + session.totals.tax - session.totals.discount;
  }
}

// Export singleton
export const unifiedCheckout = new UnifiedCheckout();

export { CheckoutSession, PaymentMethod, PaymentProvider, ShippingOption };
