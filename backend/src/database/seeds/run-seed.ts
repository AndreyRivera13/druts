import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { Product, Gender } from '../../products/entities/product.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { ProductImage } from '../../products/entities/product-image.entity';
import { Coupon, DiscountType } from '../../coupons/entities/coupon.entity';

/**
 * Seed DRUTS — Cuero · Calzado hombre
 * Productos reales DRUTS con fotos propias servidas desde frontend/public/druts/.
 */
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Iniciando seed DRUTS...');

  await dataSource.query('TRUNCATE TABLE "cart_items", "order_items", "orders", "product_images", "product_variants", "products", "categories", "brands", "coupons", "users" RESTART IDENTITY CASCADE');
  console.log('🧹 Tablas limpiadas');

  // ═════════════════════════════════════════════════════════════════════
  // CATEGORÍAS — calzado clásico hombre
  // ═════════════════════════════════════════════════════════════════════
  const categoryRepo = dataSource.getRepository(Category);
  const cats = await categoryRepo.save([
    { name: 'Sneakers',   slug: 'sneakers',   description: 'Sneakers de cuero genuino con líneas limpias y suela vulcanizada', isActive: true, sortOrder: 1 },
    { name: 'Botas',      slug: 'botas',      description: 'Chukka, desert y botines de cuero para ocasiones donde importa la presencia', isActive: true, sortOrder: 2 },
    { name: 'Casuales',   slug: 'casuales',   description: 'Calzado urbano para el día a día con la marca distintiva DRUTS', isActive: true, sortOrder: 3 },
    { name: 'Premium',    slug: 'premium',    description: 'Línea full grain — el cuero más fino, ediciones limitadas', isActive: true, sortOrder: 4 },
    { name: 'Lifestyle',  slug: 'lifestyle',  description: 'Combinables con cualquier outfit, listos para el viaje y la oficina', isActive: true, sortOrder: 5 },
  ]);
  console.log('✅ 5 categorías creadas');
  const [SNEAKERS, BOTAS, CASUALES, PREMIUM, LIFESTYLE] = cats;

  // ═════════════════════════════════════════════════════════════════════
  // MARCA — Solo DRUTS (marca propia)
  // ═════════════════════════════════════════════════════════════════════
  const brandRepo = dataSource.getRepository(Brand);
  const [DRUTS] = await brandRepo.save([
    { name: 'DRUTS', slug: 'druts', country: 'Colombia', isActive: true,
      description: 'Cuero · Calzado hombre. Marca colombiana de marroquinería curada con detalle artesanal.' },
  ]);
  console.log('✅ Marca DRUTS creada');

  // ═════════════════════════════════════════════════════════════════════
  // USUARIOS DEMO
  // ═════════════════════════════════════════════════════════════════════
  const userRepo = dataSource.getRepository(User);
  await userRepo.save(userRepo.create({
    name: 'Administrador', email: 'admin@druts.co', password: 'Admin123!',
    role: UserRole.ADMIN, phone: '3001234567', city: 'Cúcuta', isActive: true,
  }));
  await userRepo.save(userRepo.create({
    name: 'Juan Pérez', email: 'cliente@druts.co', password: 'Cliente123!',
    role: UserRole.CUSTOMER, phone: '3109876543', city: 'Bogotá', isActive: true,
  }));
  console.log('✅ Usuarios demo (admin@druts.co / Admin123!  -  cliente@druts.co / Cliente123!)');

  // ═════════════════════════════════════════════════════════════════════
  // PRODUCTOS DRUTS — fotos reales en /druts/
  // ═════════════════════════════════════════════════════════════════════
  const productRepo = dataSource.getRepository(Product);
  const variantRepo = dataSource.getRepository(ProductVariant);
  const imageRepo = dataSource.getRepository(ProductImage);

  // helper: imágenes locales servidas desde Next.js (public/druts/)
  const img = (file: string) => `/druts/${file}`;

  const NAVY     = { name: 'Marino',    hex: '#1F2A44' };
  const CHOCO    = { name: 'Chocolate', hex: '#3E2A1F' };
  const CAMEL    = { name: 'Camel',     hex: '#B07845' };
  const COGNAC   = { name: 'Cognac',    hex: '#8B4513' };
  const NEGRO    = { name: 'Negro',     hex: '#1A1A1A' };
  const BLANCO   = { name: 'Hueso',     hex: '#F5F0E1' };

  const SIZES_MEN = ['38','39','40','41','42','43','44'];

  const productsData: Array<{
    name: string; description: string;
    price: number; salePrice?: number;
    cat: Category;
    isFeatured: boolean;
    totalSold: number; rating: number; reviewCount: number;
    material: string;
    colors: Array<{ name: string; hex: string }>;
    sizes: string[];
    images: string[];
  }> = [
    {
      name: 'Drake — Sneaker Cuero Marino',
      description:
        'Sneaker de cuero genuino color marino con suela blanca de goma vulcanizada. ' +
        'Punta limpia, paneles cosidos y el sello DRUTS al lateral. Hecho a mano en Colombia ' +
        'con cuero full grain seleccionado.',
      price: 329000, salePrice: undefined,
      cat: SNEAKERS,
      isFeatured: true,
      totalSold: 184, rating: 4.8, reviewCount: 64,
      material: 'Cuero genuino full grain',
      colors: [NAVY, NEGRO, CHOCO],
      sizes: SIZES_MEN,
      images: ['sneaker-navy-1.png', 'sneaker-navy-2.png'],
    },
    {
      name: 'Marina — Sneaker Premium Marino',
      description:
        'Edición premium del clásico Drake. Cuero más suave, plantilla acolchada con espuma de memoria ' +
        'y costuras dobles para mayor durabilidad. Los detalles importan.',
      price: 379000, salePrice: 339000,
      cat: PREMIUM,
      isFeatured: true,
      totalSold: 96, rating: 4.9, reviewCount: 28,
      material: 'Cuero premium full grain',
      colors: [NAVY, NEGRO],
      sizes: SIZES_MEN,
      images: ['sneaker-navy-2.png', 'sneaker-navy-1.png'],
    },
    {
      name: 'Cocoa — Sneaker Cuero Chocolate',
      description:
        'El sneaker DRUTS en color chocolate profundo. Cuero suave al tacto, suela blanca contrastada ' +
        'y silueta atemporal. Para los que prefieren tonos cálidos sin renunciar al estilo.',
      price: 329000, salePrice: 289000,
      cat: SNEAKERS,
      isFeatured: true,
      totalSold: 142, rating: 4.7, reviewCount: 47,
      material: 'Cuero genuino',
      colors: [CHOCO, NEGRO, CAMEL],
      sizes: SIZES_MEN,
      images: ['sneaker-chocolate.png'],
    },
    {
      name: 'Sahara — Bota Chukka Camel',
      description:
        'Bota chukka clásica en cuero camel con suela tipo crepe color natural. ' +
        'Cordones encerados, forro acolchado y pull-tab al talón. ' +
        'Perfecta para combinar con denim o chinos.',
      price: 419000,
      cat: BOTAS,
      isFeatured: true,
      totalSold: 218, rating: 4.9, reviewCount: 89,
      material: 'Cuero genuino · Suela crepe',
      colors: [CAMEL, COGNAC, CHOCO],
      sizes: SIZES_MEN,
      images: ['chukka-camel-1.png', 'chukka-camel-2.png'],
    },
    {
      name: 'Wilder — Bota Chukka Cognac',
      description:
        'Variante cognac de la Sahara, con un tono más rojizo que envejece magníficamente con el uso. ' +
        'Construcción Goodyear-welt para reparabilidad y durabilidad excepcional.',
      price: 419000, salePrice: 369000,
      cat: BOTAS,
      isFeatured: true,
      totalSold: 124, rating: 4.8, reviewCount: 51,
      material: 'Cuero genuino · Construcción Goodyear-welt',
      colors: [COGNAC, CAMEL, NEGRO],
      sizes: SIZES_MEN,
      images: ['chukka-camel-1.png', 'chukka-camel-2.png'],
    },
    {
      name: 'Tierra — Sneaker Cuero Casual',
      description:
        'Sneaker casual hombre en cuero pulido con líneas minimalistas. ' +
        'Hecho para vestir todos los días — desde el café de la mañana hasta cenas con amigos.',
      price: 299000,
      cat: CASUALES,
      isFeatured: false,
      totalSold: 76, rating: 4.6, reviewCount: 22,
      material: 'Cuero pulido',
      colors: [CHOCO, NEGRO, BLANCO],
      sizes: SIZES_MEN,
      images: ['sneaker-chocolate.png'],
    },
    {
      name: 'Norte — Sneaker Lifestyle Marino',
      description:
        'Línea lifestyle DRUTS. Cuero ligero, suela ultra-flexible y máxima comodidad para ' +
        'quienes pasan el día caminando la ciudad.',
      price: 309000,
      cat: LIFESTYLE,
      isFeatured: false,
      totalSold: 58, rating: 4.5, reviewCount: 17,
      material: 'Cuero suave',
      colors: [NAVY, NEGRO],
      sizes: SIZES_MEN,
      images: ['sneaker-navy-1.png', 'sneaker-navy-2.png'],
    },
    {
      name: 'Andes — Bota Chukka Edición Premium',
      description:
        'Edición premium de la chukka DRUTS. Cuero italiano envejecido a mano, ' +
        'suela de goma natural y caja de regalo. Producción limitada.',
      price: 549000, salePrice: 489000,
      cat: PREMIUM,
      isFeatured: true,
      totalSold: 34, rating: 5.0, reviewCount: 12,
      material: 'Cuero italiano · Edición limitada',
      colors: [CAMEL, COGNAC],
      sizes: SIZES_MEN,
      images: ['chukka-camel-2.png', 'chukka-camel-1.png'],
    },
  ];

  for (const pd of productsData) {
    const slug = pd.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).slice(2, 7);

    const product = await productRepo.save(productRepo.create({
      name: pd.name,
      slug,
      description: pd.description,
      price: pd.price,
      salePrice: pd.salePrice,
      category: pd.cat,
      brand: DRUTS,
      gender: Gender.MALE,
      material: pd.material,
      isFeatured: pd.isFeatured,
      isActive: true,
      totalSold: pd.totalSold,
      rating: pd.rating as any,
      reviewCount: pd.reviewCount,
    }));

    for (const color of pd.colors) {
      for (const size of pd.sizes) {
        await variantRepo.save(variantRepo.create({
          product,
          size,
          color: color.name,
          colorHex: color.hex,
          stock: Math.floor(Math.random() * 12) + 3,
          lowStockThreshold: 3,
          sku: `DRUTS-${pd.name.replace(/[^A-Za-z]/g,'').toUpperCase().slice(0,5)}-${color.name.replace(/\s/g,'').slice(0,3).toUpperCase()}-${size}`,
        }));
      }
    }

    for (let i = 0; i < pd.images.length; i++) {
      await imageRepo.save(imageRepo.create({
        product,
        url: img(pd.images[i]),
        isPrimary: i === 0,
        sortOrder: i,
        altText: pd.name,
      }));
    }
  }
  console.log(`✅ ${productsData.length} productos DRUTS creados con variantes e imágenes`);

  // ═════════════════════════════════════════════════════════════════════
  // CUPONES
  // ═════════════════════════════════════════════════════════════════════
  const couponRepo = dataSource.getRepository(Coupon);
  await couponRepo.save([
    {
      code: 'BIENVENIDO10',
      description: '10% en tu primera compra',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      maximumDiscount: 50000,
      isActive: true,
    },
    {
      code: 'DRUTS25',
      description: '$25.000 de descuento en compras desde $300.000',
      discountType: DiscountType.FIXED,
      discountValue: 25000,
      minimumPurchase: 300000,
      isActive: true,
    },
    {
      code: 'CUERO20',
      description: '20% en toda la línea Premium — 7 días',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      maximumDiscount: 100000,
      maxUsages: 100,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ]);
  console.log('✅ Cupones: BIENVENIDO10, DRUTS25, CUERO20');

  console.log('\n🎉 Seed DRUTS completado');
  console.log('━'.repeat(55));
  console.log('📧 Admin   → admin@druts.co     / Admin123!');
  console.log('📧 Cliente → cliente@druts.co   / Cliente123!');
  console.log('━'.repeat(55));

  await app.close();
}

seed().catch(err => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
