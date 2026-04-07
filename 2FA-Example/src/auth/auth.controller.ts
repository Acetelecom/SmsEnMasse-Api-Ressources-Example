import { Controller, Post, Get, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SendOtpRequest, VerifyOtpRequest, SendOtpResponse, AuthToken, LoginEvent } from '../types/auth.types';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Step 1 — Request an OTP code sent by SMS to the given phone number.
   */
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() body: SendOtpRequest): Promise<SendOtpResponse> {
    return this.authService.sendOtp(body.phone);
  }

  /**
   * Step 2 — Verify the OTP code received by SMS.
   * Returns a JWT token on success and triggers a login report email.
   */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: VerifyOtpRequest, @Req() req: Request): Promise<AuthToken> {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    return this.authService.verifyOtp(body.phone, body.code, ip);
  }

  /**
   * Returns the in-memory login history (all successful 2FA logins since server start).
   */
  @Get('history')
  getHistory(): LoginEvent[] {
    return this.authService.getLoginHistory();
  }
}
