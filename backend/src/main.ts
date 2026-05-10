import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api/v1', {
    exclude: ['health', '/'],
  });

  const allowedOrigins = (process.env.FRONTEND_URL || '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.includes('*')
      ? true
      : (origin, cb) => {
          if (!origin || allowedOrigins.includes(origin)) cb(null, true);
          else cb(new Error(`Origin ${origin} not allowed by CORS`));
        },
    credentials: true,
  });

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req: any, res: any) =>
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }),
  );
  httpAdapter.get('/', (_req: any, res: any) =>
    res.status(200).json({ name: 'DRUTS API', docs: '/api/docs' }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Calzado API')
    .setDescription('Sistema digital para venta y administración de calzado')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación y autorización')
    .addTag('products', 'Catálogo de productos')
    .addTag('categories', 'Categorías')
    .addTag('brands', 'Marcas')
    .addTag('inventory', 'Gestión de inventario')
    .addTag('orders', 'Pedidos y ventas')
    .addTag('cart', 'Carrito de compras')
    .addTag('coupons', 'Cupones de descuento')
    .addTag('recommendations', 'Recomendaciones IA')
    .addTag('analytics', 'Panel administrativo')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Servidor corriendo en http://localhost:${port}`);
  logger.log(`Documentación Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
