import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { SmsService } from '../sms/sms.service';
import { OtpEntry, AuthToken, LoginEvent, SendOtpResponse } from '../types/auth.types';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpStore = new Map<string, OtpEntry>();
  private readonly loginHistory: LoginEvent[] = [];

  constructor(private readonly smsService: SmsService) {}

  async sendOtp(phone: string): Promise<SendOtpResponse> {
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }

    const normalized = this.normalizePhone(phone);
    const code = this.generateOtp();
    const expiresAt = Date.now() + OTP_TTL_MS;

    // webhookUrl tells SmsEnMasse where to POST delivery status updates.
    // Must be a publicly accessible URL (use ngrok or similar for local dev).
    const webhookBaseUrl = process.env.WEBHOOK_BASE_URL;
    const webhookUrl = webhookBaseUrl ? `${webhookBaseUrl}/api/webhook/sms` : undefined;

    const result = await this.smsService.sendSms({
      recipients: normalized,
      message: `Your verification code is: ${code} (valid 5 min)`,
      sender: 'VerifySMS',
      name: 'OTP Login',
      webhookUrl,
    });

    this.otpStore.set(normalized, { code, phone: normalized, expiresAt, campaignId: result.campagneId });
    this.logger.log(`OTP stored for ${normalized}, expires at ${new Date(expiresAt).toISOString()}`);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(phone: string, code: string, ip: string): Promise<AuthToken> {
    if (!phone || !code) {
      throw new BadRequestException('Phone and code are required');
    }

    const normalized = this.normalizePhone(phone);
    const entry = this.otpStore.get(normalized);

    if (!entry) {
      throw new UnauthorizedException('No OTP found for this phone number. Please request a new code.');
    }

    if (Date.now() > entry.expiresAt) {
      this.otpStore.delete(normalized);
      throw new UnauthorizedException('OTP has expired. Please request a new code.');
    }

    if (entry.code !== code.trim()) {
      throw new UnauthorizedException('Invalid verification code.');
    }

    this.otpStore.delete(normalized);

    const jwtSecret = process.env.JWT_SECRET || 'fallback-dev-secret';
    const token = jwt.sign({ sub: normalized }, jwtSecret, { expiresIn: '1h' });

    const event: LoginEvent = { phone: normalized, timestamp: new Date().toISOString(), ip, campaignId: entry.campaignId };
    this.loginHistory.push(event);

    return { token, phone: normalized };
  }

  getLoginHistory(): LoginEvent[] {
    return this.loginHistory;
  }

  private generateOtp(): string {
    return String(crypto.randomInt(100000, 999999));
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }
}
