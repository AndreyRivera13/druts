import {
  Controller, Get, Patch, Body, Param, UseGuards, Request, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Listar todos los usuarios (admin)' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.usersService.findAll(+page, +limit);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Ver perfil del usuario autenticado' })
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Actualizar perfil' })
  updateProfile(@Request() req, @Body() dto: any) {
    return this.usersService.update(req.user.userId, dto);
  }

  @Get('top-customers')
  @Roles('admin')
  @ApiOperation({ summary: 'Clientes frecuentes (admin)' })
  topCustomers(@Query('limit') limit = 10) {
    return this.usersService.getTopCustomers(+limit);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Ver usuario por ID (admin)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
