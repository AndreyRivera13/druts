import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductVariant) private variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductImage) private imageRepo: Repository<ProductImage>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const slug = this.generateSlug(dto.name);
    const product = this.productRepo.create({ ...dto, slug });
    return this.productRepo.save(product);
  }

  async findAll(filters: FilterProductsDto) {
    const {
      page = 1, limit = 12, search, categoryId, brandId,
      gender, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'DESC',
    } = filters;

    const qb = this.productRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.brand', 'brand')
      .leftJoinAndSelect('p.variants', 'variants')
      .leftJoinAndSelect('p.images', 'images')
      .where('p.isActive = :active', { active: true });

    if (search) qb.andWhere('LOWER(p.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
    if (categoryId) qb.andWhere('category.id = :categoryId', { categoryId });
    if (brandId) qb.andWhere('brand.id = :brandId', { brandId });
    if (gender) qb.andWhere('p.gender = :gender', { gender });
    if (minPrice) qb.andWhere('p.price >= :minPrice', { minPrice });
    if (maxPrice) qb.andWhere('p.price <= :maxPrice', { maxPrice });

    const validSortFields = ['price', 'createdAt', 'totalSold', 'rating', 'name'];
    const field = validSortFields.includes(sortBy) ? `p.${sortBy}` : 'p.createdAt';
    qb.orderBy(field, sortOrder as 'ASC' | 'DESC');

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'brand', 'variants', 'images'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    await this.productRepo.increment({ id }, 'viewCount', 1);
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { slug, isActive: true },
      relations: ['category', 'brand', 'variants', 'images'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    if (dto.name && dto.name !== product.name) {
      (product as any).slug = this.generateSlug(dto.name);
    }
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false;
    await this.productRepo.save(product);
  }

  async getFeatured(limit = 8): Promise<Product[]> {
    return this.productRepo.find({
      where: { isFeatured: true, isActive: true },
      take: limit,
      order: { totalSold: 'DESC' },
    });
  }

  async getBestSellers(limit = 10): Promise<Product[]> {
    return this.productRepo.find({
      where: { isActive: true },
      order: { totalSold: 'DESC' },
      take: limit,
    });
  }

  async getSlowMoving(limit = 10): Promise<Product[]> {
    return this.productRepo.find({
      where: { isActive: true },
      order: { totalSold: 'ASC', createdAt: 'ASC' },
      take: limit,
    });
  }

  async addVariant(productId: string, dto: Partial<ProductVariant>): Promise<ProductVariant> {
    const product = await this.findOne(productId);
    const variant = this.variantRepo.create({ ...dto, product });
    return this.variantRepo.save(variant);
  }

  async updateVariantStock(variantId: string, quantity: number): Promise<ProductVariant> {
    const variant = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Variante no encontrada');
    variant.stock = quantity;
    return this.variantRepo.save(variant);
  }

  async getLowStockVariants() {
    return this.variantRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.product', 'product')
      .where('v.stock <= v.lowStockThreshold')
      .andWhere('v.stock > 0')
      .getMany();
  }

  async getOutOfStockVariants() {
    return this.variantRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.product', 'product')
      .where('v.stock = 0')
      .getMany();
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);
  }
}
