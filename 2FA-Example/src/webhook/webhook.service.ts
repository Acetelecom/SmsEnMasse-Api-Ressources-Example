import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { WebHookContactSmsState } from '../types/sms.types';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly mailService: MailService) {}

  async handleSmsDelivery(payload: WebHookContactSmsState): Promise<void> {
    const receivedAt = new Date().toISOString();

    // Log the full webhook payload received from SmsEnMasse
    console.log('[SmsEnMasse webhook]', JSON.stringify({ ...payload, receivedAt }, null, 2));

    const reportEmail = process.env.REPORT_EMAIL;
    if (reportEmail) {
      await this.mailService
        .sendDeliveryReport({
          to: reportEmail,
          event: payload.event,
          id_message: payload.id_message,
          statut: payload.statut,
          numero: payload.numero,
          receivedAt,
        })
        .catch((err) => this.logger.error('Failed to send delivery report email', err.message));
    }
  }
}
