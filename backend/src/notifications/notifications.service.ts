import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private config: ConfigService) {}

  async sendWhatsApp(phone: string, message: string): Promise<void> {
    const token = this.config.get('WHATSAPP_TOKEN');
    const phoneId = this.config.get('WHATSAPP_PHONE_ID');

    if (!token || !phoneId) {
      this.logger.warn('WhatsApp no configurado. Mensaje simulado:', { phone, message });
      return;
    }

    try {
      await axios.post(
        `https://graph.facebook.com/v17.0/${phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phone.replace(/\D/g, ''),
          type: 'text',
          text: { body: message },
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
      );
    } catch (error) {
      this.logger.error('Error enviando WhatsApp:', error.message);
    }
  }

  async sendOrderConfirmation(order: {
    orderNumber: string;
    customerName: string;
    phone: string;
    total: number;
    paymentMethod: string;
  }): Promise<void> {
    const message =
      `✅ *Pedido confirmado* #${order.orderNumber}\n\n` +
      `Hola ${order.customerName}!\n` +
      `Tu pedido ha sido recibido exitosamente.\n\n` +
      `💰 Total: $${Number(order.total).toLocaleString('es-CO')}\n` +
      `💳 Pago: ${order.paymentMethod}\n\n` +
      `Te notificaremos cuando tu pedido sea despachado. ¡Gracias por tu compra! 👟`;

    await this.sendWhatsApp(order.phone, message);
  }

  async sendShippingUpdate(order: {
    orderNumber: string;
    customerName: string;
    phone: string;
    trackingCode: string;
    status: string;
  }): Promise<void> {
    const statusMessages: Record<string, string> = {
      preparing: '📦 Tu pedido está siendo preparado',
      shipped: '🚚 Tu pedido ha sido despachado',
      delivered: '✅ Tu pedido fue entregado',
    };

    const message =
      `${statusMessages[order.status] || '📋 Actualización de pedido'}\n\n` +
      `Pedido #${order.orderNumber}\n` +
      `Código de seguimiento: ${order.trackingCode}\n\n` +
      `¿Tienes alguna pregunta? Responde a este mensaje.`;

    await this.sendWhatsApp(order.phone, message);
  }

  async sendPromotion(phones: string[], promoMessage: string): Promise<void> {
    const promises = phones.map(phone => this.sendWhatsApp(phone, promoMessage));
    await Promise.allSettled(promises);
    this.logger.log(`Promoción enviada a ${phones.length} números`);
  }
}
