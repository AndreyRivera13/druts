import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo pedido' })
  create(@Request() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, dto);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Mis pedidos' })
  myOrders(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.ordersService.findByUser(req.user.userId, +page, +limit);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Todos los pedidos (admin)' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findAll(+page, +limit, status);
  }

  @Get('daily-sales')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Ventas diarias (admin)' })
  dailySales(@Query('days') days = 30) {
    return this.ordersService.getDailySales(+days);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de pedido' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.ordersService.findOne(id, { userId: req.user.userId, role: req.user.role });
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar estado del pedido (admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Request() req,
    @Body('trackingCode') trackingCode?: string,
  ) {
    return this.ordersService.updateStatus(
      id,
      status,
      trackingCode,
      { userId: req.user.userId, role: req.user.role },
    );
  }
}
