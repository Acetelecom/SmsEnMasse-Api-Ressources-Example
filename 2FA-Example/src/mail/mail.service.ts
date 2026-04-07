import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SmsDeliveryReportMailOptions } from '../types/mail.types';
import { ContactsmsStateEnum } from '../types/sms.types';

const STATUT_LABELS: Record<number, string> = {
  [ContactsmsStateEnum.PENDING]: 'Pending',
  [ContactsmsStateEnum.IN_PROGRESS]: 'In progress',
  [ContactsmsStateEnum.FINISHED]: 'Delivered',
  [ContactsmsStateEnum.FAILED]: 'Failed',
  [ContactsmsStateEnum.EXPIRED]: 'Expired',
  [ContactsmsStateEnum.EXCLUDED]: 'Excluded',
  [ContactsmsStateEnum.FILTERED]: 'Filtered',
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter = nodemailer.createTransport({ sendmail: true });

  async sendDeliveryReport(options: SmsDeliveryReportMailOptions): Promise<void> {
    const statutLabel = STATUT_LABELS[options.statut] ?? `Unknown (${options.statut})`;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@smsenmasse.fr',
      to: options.to,
      subject: `[SMS Report] +${options.numero} — ${statutLabel}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">SMS Delivery Report — SmsEnMasse</h2>
          <p>A delivery status update was received via webhook:</p>
          <table border="1" cellpadding="10" cellspacing="0"
            style="border-collapse: collapse; width: 100%; border-color: #e0e0e0;">
            <tr><td style="background:#f8f9fa;"><strong>Event</strong></td><td>${options.event}</td></tr>
            <tr><td style="background:#f8f9fa;"><strong>Message ID</strong></td><td>${options.id_message}</td></tr>
            <tr><td style="background:#f8f9fa;"><strong>Phone</strong></td><td>+${options.numero}</td></tr>
            <tr><td style="background:#f8f9fa;"><strong>Status</strong></td><td>${statutLabel} (${options.statut})</td></tr>
            <tr><td style="background:#f8f9fa;"><strong>Received at</strong></td><td>${options.receivedAt}</td></tr>
          </table>
        </div>
      `,
    });

    this.logger.log(`Delivery report sent to ${options.to}`);
  }
}
