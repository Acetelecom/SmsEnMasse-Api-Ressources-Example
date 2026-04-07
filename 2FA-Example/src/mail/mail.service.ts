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

  async sendDeliveryReport(options: SmsDeliveryReportMailOptions): Promise<void> {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user;

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured — skipping delivery report email');
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const statutLabel = STATUT_LABELS[options.statut] ?? `Unknown (${options.statut})`;

    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">SMS Delivery Report — SmsEnMasse</h2>
        <p>A delivery status update was received via webhook:</p>
        <table border="1" cellpadding="10" cellspacing="0"
          style="border-collapse: collapse; width: 100%; border-color: #e0e0e0;">
          <tr>
            <td style="background:#f8f9fa;"><strong>Event</strong></td>
            <td>${options.event}</td>
          </tr>
          <tr>
            <td style="background:#f8f9fa;"><strong>Message ID</strong></td>
            <td>${options.id_message}</td>
          </tr>
          <tr>
            <td style="background:#f8f9fa;"><strong>Phone</strong></td>
            <td>+${options.numero}</td>
          </tr>
          <tr>
            <td style="background:#f8f9fa;"><strong>Status</strong></td>
            <td>${statutLabel} (${options.statut})</td>
          </tr>
          <tr>
            <td style="background:#f8f9fa;"><strong>Received at</strong></td>
            <td>${options.receivedAt}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #888; font-size: 12px;">
          Sent by <a href="https://www.smsenmasse.fr">SmsEnMasse</a> example application.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"SmsEnMasse Example" <${from}>`,
      to: options.to,
      subject: `[SMS Report] +${options.numero} — ${statutLabel} — ${options.receivedAt}`,
      html,
    });

    this.logger.log(`Delivery report sent to ${options.to}`);
  }
}
