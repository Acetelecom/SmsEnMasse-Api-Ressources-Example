import { ContactsmsStateEnum } from './sms.types';

export interface SmsDeliveryReportMailOptions {
  to: string;
  event: string;
  id_message: number;
  statut: ContactsmsStateEnum;
  numero: string;
  receivedAt: string;
}
