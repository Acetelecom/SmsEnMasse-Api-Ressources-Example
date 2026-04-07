import { Controller, Post, Get, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SendOtpRequest, VerifyOtpRequest, SendOtpResponse, VerifyOtpResponse, LoginEvent } from '../types/auth.types';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Step 1 — Send OTP via SMS */
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() body: SendOtpRequest): Promise<SendOtpResponse> {
    return this.authService.sendOtp(body.phone);
  }

  /** Step 2 — Verify OTP */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: VerifyOtpRequest, @Req() req: Request): Promise<VerifyOtpResponse> {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    return this.authService.verifyOtp(body.phone, body.code, ip);
  }

  /** Login history (in-memory) */
  @Get('history')
  getHistory(): LoginEvent[] {
    return this.authService.getLoginHistory();
  }
}
