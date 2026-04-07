export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
}

export interface OtpEntry {
  code: string;
  phone: string;
  expiresAt: number;
  campaignId?: number;
}

export interface AuthToken {
  token: string;
  phone: string;
}

export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

export interface LoginEvent {
  phone: string;
  timestamp: string;
  ip: string;
  campaignId?: number;
}

export interface SendOtpResponse {
  message: string;
}
