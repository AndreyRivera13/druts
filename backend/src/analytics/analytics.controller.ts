import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Resumen del panel administrativo' })
  getDashboard() {
    return this.analyticsService.getDashboardSummary();
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Productos más vendidos' })
  topProducts(@Query('limit') limit = 10) {
    return this.analyticsService.getTopProducts(+limit);
  }

  @Get('sales-by-category')
  @ApiOperation({ summary: 'Ventas por categoría' })
  salesByCategory() {
    return this.analyticsService.getSalesByCategory();
  }

  @Get('sales-by-brand')
  @ApiOperation({ summary: 'Ventas por marca' })
  salesByBrand() {
    return this.analyticsService.getSalesByBrand();
  }

  @Get('monthly-sales')
  @ApiOperation({ summary: 'Ventas mensuales del año' })
  monthlySales(@Query('year') year?: number) {
    return this.analyticsService.getMonthlySales(year ? +year : undefined);
  }

  @Get('sales-by-size')
  @ApiOperation({ summary: 'Ventas por talla' })
  salesBySize() {
    return this.analyticsService.getSalesBySize();
  }

  @Get('top-customers')
  @ApiOperation({ summary: 'Clientes frecuentes' })
  topCustomers(@Query('limit') limit = 10) {
    return this.analyticsService.getTopCustomers(+limit);
  }
}
