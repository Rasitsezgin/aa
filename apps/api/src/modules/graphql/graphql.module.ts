// GraphQL Module for PazarYönetimi
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

// Resolvers
import { ProductsResolver } from './resolvers/products.resolver';
import { OrdersResolver } from './resolvers/orders.resolver';
import { AnalyticsResolver } from './resolvers/analytics.resolver';
import { IntegrationsResolver } from './resolvers/integrations.resolver';

// Services
import { ProductsService } from './services/products.service';
import { OrdersService } from './services/orders.service';
import { AnalyticsService } from './services/analytics.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/modules/graphql/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req, res }) => ({ req, res }),
      formatError: (error) => {
        // Sanitize errors in production
        if (process.env.NODE_ENV === 'production') {
          return {
            message: error.message,
            code: error.extensions?.code,
          };
        }
        return error;
      },
    }),
  ],
  providers: [
    // Resolvers
    ProductsResolver,
    OrdersResolver,
    AnalyticsResolver,
    IntegrationsResolver,
    // Services
    ProductsService,
    OrdersService,
    AnalyticsService,
  ],
  exports: [GraphQLModule],
})
export class GraphqlApiModule {}
