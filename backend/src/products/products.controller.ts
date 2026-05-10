import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, UploadedFiles, UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Catálogo de productos con filtros' })
  findAll(@Query() filters: FilterProductsDto) {
    return this.productsService.findAll(filters);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Productos destacados' })
  getFeatured(@Query('limit') limit = 8) {
    return this.productsService.getFeatured(+limit);
  }

  @Get('best-sellers')
  @ApiOperation({ summary: 'Más vendidos' })
  getBestSellers(@Query('limit') limit = 10) {
    return this.productsService.getBestSellers(+limit);
  }

  @Get('slow-moving')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Productos de baja rotación (admin)' })
  getSlowMoving(@Query('limit') limit = 10) {
    return this.productsService.getSlowMoving(+limit);
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Variantes con stock bajo (admin)' })
  getLowStock() {
    return this.productsService.getLowStockVariants();
  }

  @Get('out-of-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Variantes agotadas (admin)' })
  getOutOfStock() {
    return this.productsService.getOutOfStockVariants();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Buscar producto por slug (SEO)' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de producto' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear producto (admin)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar producto (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar producto (admin)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Put(':id/variants/:variantId/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar stock de variante (admin)' })
  updateStock(
    @Param('variantId') variantId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.productsService.updateVariantStock(variantId, quantity);
  }
}
