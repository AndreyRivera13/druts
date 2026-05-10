import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Ver carrito del usuario' })
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('add')
  @ApiOperation({ summary: 'Agregar producto al carrito' })
  addItem(
    @Request() req,
    @Body('productId') productId: string,
    @Body('variantId') variantId: string,
    @Body('quantity') quantity = 1,
  ) {
    return this.cartService.addItem(req.user.userId, productId, variantId, quantity);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Actualizar cantidad de item' })
  updateItem(
    @Request() req,
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateItem(req.user.userId, id, quantity);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Eliminar item del carrito' })
  removeItem(@Request() req, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.userId, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Vaciar carrito' })
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}
