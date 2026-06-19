import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AdminService } from './src/modules/admin/admin.service';

async function bootstrap() {
  try {
    console.log('Bootstrapping app...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const adminService = app.get(AdminService);
    
    console.log('Testing getUsers...');
    const users = await adminService.getUsers({ limit: 1 });
    console.log('Users:', users.users.length);

    console.log('Testing getCustomers...');
    const customers = await adminService.getCustomers({ page: 1, limit: 1 });
    console.log('Customers:', customers.customers.length);

    await app.close();
    console.log('Success!');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}
bootstrap();
