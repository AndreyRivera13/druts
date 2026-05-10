import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Get() findAll() { return this.brandsService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.brandsService.findOne(id); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') @ApiBearerAuth()
  create(@Body() dto: any) { return this.brandsService.create(dto); }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: any) { return this.brandsService.update(id, dto); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') @ApiBearerAuth()
  remove(@Param('id') id: string) { return this.brandsService.remove(id); }
}
