export interface CreateSmsDto {
  name?: string;
  /** Phone numbers in international format, comma-separated (e.g. "33645332637,33667656608") */
  recipients: string;
  /** Sender name: 3-11 chars, start with letter or max 3 digits */
  sender?: string;
  /** Message content, max 160 characters */
  message: string;
  /** Unix timestamp at which to send the message */
  sendAt?: number;
  /** Custom identifier */
  identifier?: string;
  country?: string;
  /** URL for delivery status webhooks (WebHookContactSmsState) */
  webhookUrl?: string;
}

export interface Campagnesms {
  id?: number;
  name?: string;
  /** -3: OTP, -2: BAT, -1: Draft, 0: Pending, 1: In progress, 2: Finished, 3: Break */
  state: CampagnesmsStateEnum;
  recipients: string;
  sender: string;
  message: string;
  identifier: string;
  timezone: string;
  sendAt: string;
  nbSms: number;
  nbTel: number;
  finishedAt: string;
}

export enum CampagnesmsStateEnum {
  OTP = -3,
  BAT = -2,
  DRAFT = -1,
  PENDING = 0,
  IN_PROGRESS = 1,
  FINISHED = 2,
  BREAK = 3,
}

export enum ContactsmsStateEnum {
  PENDING = 0,
  IN_PROGRESS = 1,
  FINISHED = 2,
  FAILED = 4,
  EXPIRED = 5,
  EXCLUDED = 6,
  FILTERED = 7,
}

export interface WebHookContactSmsState {
  event: string;
  id_message: number;
  statut: ContactsmsStateEnum;
  numero: string;
}

export interface SendSmsResponse {
  campagneId: number;
}

export interface SmsListParams {
  page?: number;
  limit?: number;
}

export interface SmsGetParams {
  withRecipients?: number;
  page?: number;
  limit?: number;
}
