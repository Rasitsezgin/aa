import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsService } from '../../modules/metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context
      .switchToHttp()
      .getRequest<{ method: string; route?: { path: string }; url: string }>();
    const method: string = req.method;
    const route: string = req.route?.path || req.url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context
            .switchToHttp()
            .getResponse<{ statusCode: number }>();
          const duration = (Date.now() - startTime) / 1000;
          const statusCode: string = String(res.statusCode);

          this.metricsService.httpRequestDuration
            .labels(method, route, statusCode)
            .observe(duration);
          this.metricsService.httpRequestTotal
            .labels(method, route, statusCode)
            .inc();
        },
        error: (err: unknown) => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode: string = String(
            (err as { status?: number })?.status ?? 500,
          );

          this.metricsService.httpRequestDuration
            .labels(method, route, statusCode)
            .observe(duration);
          this.metricsService.httpRequestTotal
            .labels(method, route, statusCode)
            .inc();
        },
      }),
    );
  }
}
