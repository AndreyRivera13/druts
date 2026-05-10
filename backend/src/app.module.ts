import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { CouponsModule } from './coupons/coupons.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const isProd = config.get('NODE_ENV') === 'production';
        const url = config.get<string>('DATABASE_URL');
        const sslEnabled = config.get('DB_SSL') === 'true' || (isProd && !!url);
        const synchronize =
          config.get('DB_SYNC') === 'true' ||
          config.get('NODE_ENV') !== 'production';

        const base = {
          type: 'postgres' as const,
          ssl: sslEnabled ? { rejectUnauthorized: false } : false,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize,
          logging: config.get('NODE_ENV') === 'development',
        };

        if (url) {
          return { ...base, url };
        }

        return {
          ...base,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USER', 'calzado_user'),
          password: config.get<string>('DB_PASSWORD', 'calzado_pass'),
          database: config.get<string>('DB_NAME', 'calzado_db'),
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    InventoryModule,
    OrdersModule,
    CartModule,
    CouponsModule,
    RecommendationsModule,
    AnalyticsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
