import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(@InjectRepository(Brand) private repo: Repository<Brand>) {}

  async create(dto: Partial<Brand>): Promise<Brand> {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return this.repo.save(this.repo.create({ ...dto, slug }));
  }

  findAll(): Promise<Brand[]> {
    return this.repo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.repo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Marca no encontrada');
    return brand;
  }

  async update(id: string, dto: Partial<Brand>): Promise<Brand> {
    const brand = await this.findOne(id);
    Object.assign(brand, dto);
    return this.repo.save(brand);
  }

  async remove(id: string): Promise<void> {
    const brand = await this.findOne(id);
    brand.isActive = false;
    await this.repo.save(brand);
  }
}
