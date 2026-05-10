import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Listar cupones (admin)' })
  findAll() {
    return this.couponsService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Crear cupón (admin)' })
  create(@Body() dto: any) {
    return this.couponsService.create(dto);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validar cupón' })
  validate(@Body('code') code: string, @Body('subtotal') subtotal: number) {
    return this.couponsService.validate(code, subtotal);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar cupón (admin)' })
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
