import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { buildCorsOrigin, shouldEnableSwagger } from './common/cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api/v1', {
    exclude: ['health', '/'],
  });

  app.enableCors({
    origin: buildCorsOrigin(process.env.FRONTEND_URL, process.env.NODE_ENV, logger),
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

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  if (shouldEnableSwagger(process.env.NODE_ENV, process.env.ENABLE_SWAGGER)) {
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
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Servidor corriendo en http://localhost:${port}`);
  if (shouldEnableSwagger(process.env.NODE_ENV, process.env.ENABLE_SWAGGER)) {
    logger.log(`Documentación Swagger: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
