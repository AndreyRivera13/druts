import {
  IsString, IsNumber, IsOptional, IsEnum, IsBoolean,
  IsArray, ValidateNested, IsUUID, Min, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../entities/product.entity';

export class CreateVariantDto {
  @IsString() size: string;
  @IsString() color: string;
  @IsOptional() @IsString() colorHex?: string;
  @IsNumber() @Min(0) stock: number;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsNumber() priceAdjustment?: number;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Nike Air Max 270' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 280000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsUUID()
  brandId: string;

  @ApiProperty({ enum: Gender, default: Gender.UNISEX })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  season?: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ type: [CreateVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];
}
