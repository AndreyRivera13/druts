import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { MovementType } from './entities/inventory-movement.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('alerts')
  @ApiOperation({ summary: 'Alertas: stock bajo y agotado' })
  getAlerts() { return this.inventoryService.getAlerts(); }

  @Get('movements')
  @ApiOperation({ summary: 'Historial de movimientos de inventario' })
  getAllMovements(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.inventoryService.getAllMovements(+page, +limit);
  }

  @Get('movements/:variantId')
  @ApiOperation({ summary: 'Movimientos de una variante específica' })
  getMovements(@Param('variantId') variantId: string, @Query('limit') limit = 50) {
    return this.inventoryService.getMovements(variantId, +limit);
  }

  @Post('movement')
  @ApiOperation({ summary: 'Registrar movimiento de inventario (entrada/salida/ajuste)' })
  registerMovement(
    @Request() req,
    @Body() dto: {
      variantId: string;
      type: MovementType;
      quantity: number;
      reason?: string;
      referenceId?: string;
    },
  ) {
    return this.inventoryService.registerMovement({ ...dto, userId: req.user.userId });
  }
}
