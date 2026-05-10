import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('whatsapp')
  @ApiOperation({ summary: 'Enviar mensaje WhatsApp manual (admin)' })
  sendWhatsApp(@Body('phone') phone: string, @Body('message') message: string) {
    return this.notificationsService.sendWhatsApp(phone, message);
  }

  @Post('promotion')
  @ApiOperation({ summary: 'Enviar promoción masiva por WhatsApp (admin)' })
  sendPromotion(@Body('phones') phones: string[], @Body('message') message: string) {
    return this.notificationsService.sendPromotion(phones, message);
  }
}
