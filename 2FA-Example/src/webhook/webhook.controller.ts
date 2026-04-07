import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebHookContactSmsState } from '../types/sms.types';

@Controller('api/webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Endpoint called by SmsEnMasse when a message delivery status changes.
   * Payload: WebHookContactSmsState
   * Configure this URL via webhookUrl in CreateSmsDto.
   */
  @Post('sms')
  @HttpCode(HttpStatus.OK)
  async handleSmsWebhook(@Body() payload: WebHookContactSmsState): Promise<{ received: boolean }> {
    this.logger.log(`Webhook received — message #${payload.id_message}, statut: ${payload.statut}`);
    await this.webhookService.handleSmsDelivery(payload);
    return { received: true };
  }
}
