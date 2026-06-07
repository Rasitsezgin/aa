import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { TenantContextService } from './tenant-context.service';

interface TenantRequest extends Request {
  user?: { id?: string; tenantId?: string };
}

/**
 * HTTP isteklerini AsyncLocalStorage tenant bağlamında çalıştırır.
 * TenantInterceptor header'ı set ettikten sonra bu interceptor devreye girer.
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<TenantRequest>();
    const raw = request.headers['x-tenant-id'];
    const tenantId = Array.isArray(raw) ? raw[0] : raw;

    if (!tenantId || typeof tenantId !== 'string') {
      return next.handle();
    }

    const userId = request.user?.id;

    return new Observable((observer) => {
      this.tenantContext.run({ tenantId, userId }, () => {
        const subscription = next.handle().subscribe({
          next: (value) => observer.next(value),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
        return () => subscription.unsubscribe();
      });
    });
  }
}
