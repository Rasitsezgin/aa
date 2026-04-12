import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';
import { initSentry } from './common/sentry';

// Initialize Sentry for error tracking
initSentry();

async function bootstrap() {
  const logger = new Logger('Worker');

  logger.log('🚀 Starting Worker Service...');

  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Graceful shutdown handling
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.log(`Received ${signal}, closing worker gracefully...`);
      await app.close();
      logger.log('Worker closed');
      process.exit(0);
    });
  });

  logger.log('✅ Worker service is running and processing jobs...');
  logger.log('📊 Queues: reports, sync, emails, scheduled-tasks');
}

bootstrap().catch((error) => {
  console.error('Worker bootstrap error:', error);
  process.exit(1);
});
