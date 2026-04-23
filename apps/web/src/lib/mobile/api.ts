// Mobile App API
// React Native / Mobile app support with optimized endpoints

interface MobileDevice {
  id: string;
  userId: string;
  tenantId: string;
  platform: 'ios' | 'android';
  deviceModel: string;
  osVersion: string;
  appVersion: string;
  pushToken?: string;
  lastActiveAt: Date;
  createdAt: Date;
  isActive: boolean;
  settings: {
    notifications: {
      orders: boolean;
      promotions: boolean;
      system: boolean;
    };
    biometricAuth: boolean;
    darkMode: boolean;
    language: string;
  };
}

interface MobileSession {
  id: string;
  deviceId: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
  ipAddress?: string;
  location?: {
    lat: number;
    lng: number;
    accuracy: number;
  };
}

interface OfflineAction {
  id: string;
  deviceId: string;
  userId: string;
  tenantId: string;
  action: string;
  data: Record<string, unknown>;
  status: 'pending' | 'synced' | 'failed';
  retryCount: number;
  createdAt: Date;
  syncedAt?: Date;
  error?: string;
}

interface SyncConfig {
  entity: string;
  syncMode: 'full' | 'incremental';
  lastSyncAt?: Date;
  filters?: Record<string, unknown>;
  fields?: string[];
  batchSize: number;
}

// Mobile API Manager
export class MobileAPIManager {
  private devices: Map<string, MobileDevice> = new Map();
  private sessions: Map<string, MobileSession> = new Map();
  private offlineActions: Map<string, OfflineAction[]> = new Map();
  private syncConfigs: Map<string, SyncConfig[]> = new Map();

  // Register device
  registerDevice(config: Omit<MobileDevice, 'id' | 'createdAt' | 'lastActiveAt' | 'isActive'>): MobileDevice {
    const device: MobileDevice = {
      ...config,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      lastActiveAt: new Date(),
      isActive: true,
    };

    this.devices.set(device.id, device);
    return device;
  }

  // Create session
  createSession(
    deviceId: string,
    userId: string,
    tenantId: string
  ): MobileSession {
    const session: MobileSession = {
      id: crypto.randomUUID(),
      deviceId,
      userId,
      token: this.generateToken(),
      refreshToken: this.generateToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
      lastActivityAt: new Date(),
    };

    this.sessions.set(session.id, session);

    // Update device last active
    const device = this.devices.get(deviceId);
    if (device) {
      device.lastActiveAt = new Date();
    }

    return session;
  }

  // Refresh session
  refreshSession(refreshToken: string): MobileSession | null {
    for (const session of this.sessions.values()) {
      if (session.refreshToken === refreshToken) {
        if (session.expiresAt < new Date()) {
          return null; // Expired
        }

        session.token = this.generateToken();
        session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        session.lastActivityAt = new Date();

        return session;
      }
    }
    return null;
  }

  // Validate session
  validateSession(token: string): MobileSession | null {
    for (const session of this.sessions.values()) {
      if (session.token === token) {
        if (session.expiresAt < new Date()) {
          return null;
        }

        session.lastActivityAt = new Date();
        return session;
      }
    }
    return null;
  }

  // Revoke session
  revokeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  // Revoke all sessions for user
  revokeAllUserSessions(userId: string): number {
    let count = 0;
    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(id);
        count++;
      }
    }
    return count;
  }

  // Queue offline action
  queueOfflineAction(
    deviceId: string,
    action: Omit<OfflineAction, 'id' | 'deviceId' | 'status' | 'retryCount' | 'createdAt'>
  ): OfflineAction {
    const offlineAction: OfflineAction = {
      ...action,
      id: crypto.randomUUID(),
      deviceId,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date(),
    };

    const actions = this.offlineActions.get(deviceId) || [];
    actions.push(offlineAction);
    this.offlineActions.set(deviceId, actions);

    return offlineAction;
  }

  // Sync offline actions
  async syncOfflineActions(deviceId: string): Promise<{
    synced: number;
    failed: number;
    pending: number;
  }> {
    const actions = this.offlineActions.get(deviceId) || [];
    let synced = 0;
    let failed = 0;

    for (const action of actions) {
      if (action.status === 'pending') {
        try {
          await this.executeOfflineAction(action);
          action.status = 'synced';
          action.syncedAt = new Date();
          synced++;
        } catch (error) {
          action.retryCount++;
          action.error = String(error);

          if (action.retryCount >= 3) {
            action.status = 'failed';
            failed++;
          }
        }
      }
    }

    return {
      synced,
      failed,
      pending: actions.filter(a => a.status === 'pending').length,
    };
  }

  // Get data for sync (optimized for mobile)
  async getSyncData(
    tenantId: string,
    config: SyncConfig
  ): Promise<{
    data: unknown[];
    hasMore: boolean;
    nextCursor?: string;
    totalCount: number;
  }> {
    // In production, this would:
    // 1. Query data optimized for mobile (select only needed fields)
    // 2. Apply incremental sync filters
    // 3. Compress and paginate results

    const batchSize = config.batchSize || 100;

    // Mock sync data
    const data = Array.from({ length: batchSize }, (_, i) => ({
      id: `item-${i}`,
      updatedAt: new Date().toISOString(),
      ...config.filters,
    }));

    return {
      data,
      hasMore: data.length === batchSize,
      nextCursor: data.length === batchSize ? 'next-page' : undefined,
      totalCount: data.length,
    };
  }

  // Get optimized API response for mobile
  async getOptimizedResponse(
    endpoint: string,
    options: {
      tenantId: string;
      userId: string;
      fields?: string[];
      compress?: boolean;
      cacheKey?: string;
    }
  ): Promise<{
    data: unknown;
    cacheStatus?: 'hit' | 'miss';
    compressed: boolean;
    size: number;
  }> {
    // In production:
    // 1. Check cache
    // 2. Query minimal data
    // 3. Filter fields if specified
    // 4. Compress if requested
    // 5. Return optimized payload

    const data = await this.fetchData(endpoint, options);

    // Filter fields if specified
    let filteredData = data;
    if (options.fields && Array.isArray(data)) {
      filteredData = data.map(item => {
        const filtered: Record<string, unknown> = {};
        for (const field of options.fields!) {
          if (field in item) {
            filtered[field] = item[field];
          }
        }
        return filtered;
      });
    }

    // Compress if large
    const jsonString = JSON.stringify(filteredData);
    const compressed = options.compress && jsonString.length > 10000;

    return {
      data: filteredData,
      cacheStatus: 'miss',
      compressed,
      size: jsonString.length,
    };
  }

  // Upload from mobile (with image optimization)
  async uploadFromMobile(
    deviceId: string,
    file: {
      name: string;
      type: string;
      size: number;
      data: Buffer;
    },
    options: {
      optimizeImages?: boolean;
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    } = {}
  ): Promise<{
    url: string;
    originalSize: number;
    optimizedSize?: number;
    dimensions?: { width: number; height: number };
  }> {
    // In production, this would:
    // 1. Optimize image if needed
    // 2. Upload to CDN
    // 3. Return optimized URL

    return {
      url: `https://cdn.example.com/${file.name}`,
      originalSize: file.size,
      optimizedSize: options.optimizeImages ? file.size * 0.6 : undefined,
    };
  }

  // Get push notification config
  getPushConfig(deviceId: string): {
    enabled: boolean;
    token?: string;
    provider: 'fcm' | 'apns';
    topics: string[];
  } | null {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    return {
      enabled: device.isActive && device.settings.notifications.orders,
      token: device.pushToken,
      provider: device.platform === 'ios' ? 'apns' : 'fcm',
      topics: [
        `tenant-${device.tenantId}`,
        `user-${device.userId}`,
        'all-users',
      ],
    };
  }

  // Update push token
  updatePushToken(deviceId: string, pushToken: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.pushToken = pushToken;
      device.lastActiveAt = new Date();
    }
  }

  // Update device settings
  updateDeviceSettings(
    deviceId: string,
    settings: Partial<MobileDevice['settings']>
  ): MobileDevice | null {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    device.settings = { ...device.settings, ...settings };
    return device;
  }

  // Get device analytics
  getDeviceAnalytics(tenantId: string, period: { from: Date; to: Date }): {
    totalDevices: number;
    activeDevices: number;
    byPlatform: { ios: number; android: number };
    byAppVersion: Record<string, number>;
    topDevices: Array<{ model: string; count: number }>;
    sessions: {
      total: number;
      averageDuration: number;
    };
  } {
    const devices = Array.from(this.devices.values()).filter(
      d => d.tenantId === tenantId && d.createdAt >= period.from && d.createdAt <= period.to
    );

    const sessions = Array.from(this.sessions.values()).filter(
      s => s.createdAt >= period.from && s.createdAt <= period.to
    );

    const byPlatform = { ios: 0, android: 0 };
    const byAppVersion: Record<string, number> = {};
    const byModel: Record<string, number> = {};

    for (const device of devices) {
      byPlatform[device.platform]++;
      byAppVersion[device.appVersion] = (byAppVersion[device.appVersion] || 0) + 1;
      byModel[device.deviceModel] = (byModel[device.deviceModel] || 0) + 1;
    }

    const topDevices = Object.entries(byModel)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const activeDevices = devices.filter(d => d.isActive).length;

    return {
      totalDevices: devices.length,
      activeDevices,
      byPlatform,
      byAppVersion,
      topDevices,
      sessions: {
        total: sessions.length,
        averageDuration: sessions.length > 0 ? 300 : 0, // Mock 5 min average
      },
    };
  }

  // Deep linking
  generateDeepLink(path: string, params?: Record<string, string>): string {
    const baseUrl = 'pazaryonetimi://';
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    return `${baseUrl}${path}${queryString}`;
  }

  // Parse deep link
  parseDeepLink(url: string): {
    path: string;
    params: Record<string, string>;
  } | null {
    try {
      const parsed = new URL(url);
      const params: Record<string, string> = {};
      
      parsed.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      return {
        path: parsed.pathname,
        params,
      };
    } catch {
      return null;
    }
  }

  // Private methods
  private generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async executeOfflineAction(action: OfflineAction): Promise<void> {
    // In production, this would execute the queued action
    console.log(`Executing offline action: ${action.action}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock random failure for testing
    if (Math.random() < 0.1) {
      throw new Error('Network error');
    }
  }

  private async fetchData(
    endpoint: string,
    options: { tenantId: string; userId: string }
  ): Promise<unknown[]> {
    // Mock data based on endpoint
    switch (endpoint) {
      case '/products':
        return Array.from({ length: 50 }, (_, i) => ({
          id: `prod-${i}`,
          name: `Product ${i}`,
          price: Math.floor(Math.random() * 1000),
          stock: Math.floor(Math.random() * 100),
        }));

      case '/orders':
        return Array.from({ length: 30 }, (_, i) => ({
          id: `order-${i}`,
          total: Math.floor(Math.random() * 5000),
          status: ['pending', 'processing', 'shipped'][Math.floor(Math.random() * 3)],
          date: new Date().toISOString(),
        }));

      default:
        return [];
    }
  }
}

// Mobile-specific API endpoints
export const MOBILE_ENDPOINTS = {
  // Optimized for mobile
  'GET /mobile/v1/products': {
    fields: ['id', 'name', 'price', 'imageUrl', 'stock'],
    cache: true,
    compress: true,
  },
  'GET /mobile/v1/orders': {
    fields: ['id', 'total', 'status', 'createdAt', 'itemCount'],
    cache: false,
    compress: true,
  },
  'GET /mobile/v1/dashboard': {
    fields: ['kpis', 'charts', 'alerts'],
    cache: true,
    ttl: 300, // 5 minutes
  },
  'POST /mobile/v1/sync': {
    batch: true,
    compress: true,
  },
  'POST /mobile/v1/offline-queue': {
    batch: true,
    queue: true,
  },
};

// Export singleton
export const mobileAPIManager = new MobileAPIManager();

export { MobileDevice, MobileSession, OfflineAction, SyncConfig };
