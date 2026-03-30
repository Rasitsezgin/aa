import { Injectable } from '@nestjs/common';

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number | null;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

interface CircuitBreakerConfig {
  failureThreshold: number;      // Kaç hata sonrası açılır
  resetTimeoutMs: number;        // Açıkken ne kadar beklenir
  halfOpenMaxCalls: number;      // Yarı açıkken kaç çağrı izin verilir
  successThreshold: number;      // Yarı açıkten kapanmak için başarı sayısı
}

/**
 * Circuit Breaker Pattern
 * Bağlantı kopunca servisi geçici olarak devre dışı bırakır
 * Otomatik recovery ile tekrar deneme yapar
 */
@Injectable()
export class CircuitBreakerService {
  private states: Map<string, CircuitBreakerState> = new Map();
  
  private configs: Map<string, CircuitBreakerConfig> = new Map();
  
  // Default config per service type
  private defaultConfigs: Record<string, CircuitBreakerConfig> = {
    'marketplace-api': {
      failureThreshold: 5,
      resetTimeoutMs: 30000,      // 30 saniye bekle
      halfOpenMaxCalls: 3,
      successThreshold: 2,
    },
    'payment-gateway': {
      failureThreshold: 3,
      resetTimeoutMs: 60000,      // 1 dakika bekle
      halfOpenMaxCalls: 2,
      successThreshold: 1,
    },
    'email-service': {
      failureThreshold: 10,
      resetTimeoutMs: 120000,     // 2 dakika bekle
      halfOpenMaxCalls: 5,
      successThreshold: 3,
    },
    'ai-service': {
      failureThreshold: 5,
      resetTimeoutMs: 30000,
      halfOpenMaxCalls: 2,
      successThreshold: 1,
    },
  };

  constructor() {
    // Periyodik temizlik
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Circuit breaker ile fonksiyon çalıştır
   */
  async execute<T>(
    serviceName: string,
    operation: () => Promise<T>,
    fallback?: () => T | Promise<T>,
  ): Promise<T> {
    const state = this.getState(serviceName);
    const config = this.getConfig(serviceName);

    // OPEN durumundayız - hata fırlat veya fallback dön
    if (state.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - (state.lastFailureTime || 0);
      
      if (timeSinceLastFailure < config.resetTimeoutMs) {
        // Hala açık, fallback veya hata
        if (fallback) {
          console.log(`[CircuitBreaker] ${serviceName} is OPEN, using fallback`);
          return fallback();
        }
        throw new Error(`Service ${serviceName} is unavailable (Circuit Open)`);
      }
      
      // Zaman doldu, yarı açık geç
      state.state = 'HALF_OPEN';
      state.failures = 0;
      console.log(`[CircuitBreaker] ${serviceName} transitioning to HALF_OPEN`);
    }

    // HALF_OPEN durumunda çağrı limiti kontrol et
    if (state.state === 'HALF_OPEN') {
      state.failures++; // Geçici olarak sayacı kullan
      if (state.failures > config.halfOpenMaxCalls) {
        throw new Error(`Service ${serviceName} is in HALF_OPEN state, call limit reached`);
      }
    }

    try {
      // Operasyonu çalıştır
      const result = await operation();
      
      // Başarılı - durumu güncelle
      this.onSuccess(serviceName, config);
      
      return result;
    } catch (error) {
      // Başarısız - durumu güncelle
      this.onFailure(serviceName, config);
      
      // Fallback varsa dene
      if (fallback) {
        console.log(`[CircuitBreaker] ${serviceName} failed, using fallback`);
        return fallback();
      }
      
      throw error;
    }
  }

  /**
   * Servis durumunu kontrol et
   */
  getStatus(serviceName: string): { state: string; healthy: boolean; failures: number } {
    const state = this.getState(serviceName);
    return {
      state: state.state,
      healthy: state.state === 'CLOSED',
      failures: state.failures,
    };
  }

  /**
   * Tüm servis durumları
   */
  getAllStatuses(): Record<string, { state: string; healthy: boolean; failures: number }> {
    const result: any = {};
    for (const [name, state] of this.states) {
      result[name] = {
        state: state.state,
        healthy: state.state === 'CLOSED',
        failures: state.failures,
      };
    }
    return result;
  }

  /**
   * Manuel reset
   */
  reset(serviceName: string): void {
    this.states.set(serviceName, {
      failures: 0,
      lastFailureTime: null,
      state: 'CLOSED',
    });
    console.log(`[CircuitBreaker] ${serviceName} manually reset to CLOSED`);
  }

  private getState(serviceName: string): CircuitBreakerState {
    if (!this.states.has(serviceName)) {
      this.states.set(serviceName, {
        failures: 0,
        lastFailureTime: null,
        state: 'CLOSED',
      });
    }
    return this.states.get(serviceName)!;
  }

  private getConfig(serviceName: string): CircuitBreakerConfig {
    // Service type'ı bul (örn: trendyol-api → marketplace-api)
    const serviceType = Object.keys(this.defaultConfigs).find(type => 
      serviceName.includes(type) || serviceName.toLowerCase().includes(type)
    ) || 'marketplace-api';
    
    return this.configs.get(serviceName) || this.defaultConfigs[serviceType] || this.defaultConfigs['marketplace-api'];
  }

  private onSuccess(serviceName: string, config: CircuitBreakerConfig): void {
    const state = this.getState(serviceName);
    
    if (state.state === 'HALF_OPEN') {
      state.failures = Math.max(0, state.failures - 1); // Başarı sayısını artır mantığı
      
      // Yeterli başarı varsa kapat
      if (state.failures <= config.halfOpenMaxCalls - config.successThreshold) {
        state.state = 'CLOSED';
        state.failures = 0;
        state.lastFailureTime = null;
        console.log(`[CircuitBreaker] ${serviceName} is now CLOSED`);
      }
    } else if (state.state === 'CLOSED') {
      // Başarılı çağrı, failure sayısını azalt (gradual recovery)
      if (state.failures > 0) {
        state.failures = Math.max(0, state.failures - 1);
      }
    }
  }

  private onFailure(serviceName: string, config: CircuitBreakerConfig): void {
    const state = this.getState(serviceName);
    
    state.failures++;
    state.lastFailureTime = Date.now();
    
    if (state.state === 'HALF_OPEN') {
      // Yarı açıkken hata - tekrar aç
      state.state = 'OPEN';
      console.log(`[CircuitBreaker] ${serviceName} is now OPEN (half-open failure)`);
    } else if (state.state === 'CLOSED' && state.failures >= config.failureThreshold) {
      // Threshold aşıldı, aç
      state.state = 'OPEN';
      console.log(`[CircuitBreaker] ${serviceName} is now OPEN (${state.failures} failures)`);
    }
  }

  private cleanup(): void {
    // Uzun süredir açık olanları temizle
    const now = Date.now();
    for (const [name, state] of this.states) {
      if (state.state === 'OPEN' && state.lastFailureTime) {
        const config = this.getConfig(name);
        if (now - state.lastFailureTime > config.resetTimeoutMs * 2) {
          // Çok uzun süre açık kaldı, otomatik kapatmayı dene
          state.state = 'HALF_OPEN';
          state.failures = 0;
          console.log(`[CircuitBreaker] ${name} auto-transitioning to HALF_OPEN after long OPEN`);
        }
      }
    }
  }
}

/**
 * Decorator for automatic circuit breaker
 */
export function WithCircuitBreaker(
  serviceName: string,
  fallback?: () => any,
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const circuitBreaker = new CircuitBreakerService();

    descriptor.value = async function (...args: any[]) {
      return circuitBreaker.execute(
        serviceName,
        () => originalMethod.apply(this, args),
        fallback,
      );
    };

    return descriptor;
  };
}
