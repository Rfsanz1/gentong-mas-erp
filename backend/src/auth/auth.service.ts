// backend/src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { PrismaService } from './prisma.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { User } from '@prisma/client';

// 12 rounds is the recommended balance between security and performance
const BCRYPT_SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 5;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export interface GoogleLoginInput {
  email: string;
  name?: string;
  googleId: string;
}

export interface AuthResponse {
  accessToken: string;
  user: Omit<User, 'password'>;
  requiresOtp?: boolean;
  requiresTenantSelect?: boolean;
  companies?: Array<{ id: string; name: string; logoUrl: string | null }>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Helper: generate tokens ─────────────────────────────────────────────

  private signAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  }

  private signRefreshToken(payload: Pick<JwtPayload, 'sub'>): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
  }

  /**
   * Stores a hashed refresh token in the DB and returns the raw token
   * so it can be placed in a httpOnly cookie.
   */
  private async saveRefreshToken(userId: string): Promise<string> {
    const rawToken = this.signRefreshToken({ sub: userId });
    const hashed = await bcrypt.hash(rawToken, BCRYPT_SALT_ROUNDS);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashed,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      },
    });

    return rawToken;
  }

  // ─── Validate user credentials (used by LocalStrategy) ───────────────────

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    // Remove password from the returned object
    const { password: _pw, ...rest } = user;
    return rest;
  }

  // ─── Email/password login ─────────────────────────────────────────────────

  async login(user: Omit<User, 'password'>): Promise<AuthResponse> {
    // Fetch all companies this user belongs to
    const tenants = await this.prisma.userTenant.findMany({
      where: { userId: user.id },
      include: { company: true },
    });

    const companies = tenants.map((t) => ({
      id: t.company.id,
      name: t.company.name,
      logoUrl: t.company.logoUrl,
    }));

    // If 2FA is enabled, return early — client must go to /otp
    if (user.is2FAEnabled) {
      return {
        accessToken: '',
        user,
        requiresOtp: true,
        companies,
      };
    }

    // If user belongs to multiple companies, they must pick one
    if (companies.length > 1) {
      return {
        accessToken: '',
        user,
        requiresTenantSelect: true,
        companies,
      };
    }

    // Single company: auto-select it and issue tokens
    const companyId = companies[0]?.id;
    const role = tenants[0]?.role;

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      companyId,
      role,
    };

    return {
      accessToken: this.signAccessToken(payload),
      user,
      companies,
    };
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────

  async googleLogin(input: GoogleLoginInput): Promise<Omit<User, 'password'>> {
    const { email, name, googleId } = input;

    // Find by googleId first, then fall back to email
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (user) {
      // Link Google ID if account existed but wasn't linked yet
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }
    } else {
      // First time Google login — create a new user
      user = await this.prisma.user.create({
        data: { email, name, googleId },
      });
    }

    const { password: _pw, ...rest } = user;
    return rest;
  }

  // ─── OTP ──────────────────────────────────────────────────────────────────

  async sendOtp(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Invalidate previous unused OTPs for this user
    await this.prisma.otpCode.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });

    // Generate a 6-digit numeric OTP
    const code = Math.floor(100_000 + Math.random() * 900_000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.prisma.otpCode.create({
      data: { userId, code, expiresAt },
    });

    // Send via SMTP
    const transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: parseInt(this.configService.getOrThrow<string>('SMTP_PORT'), 10),
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        pass: this.configService.getOrThrow<string>('SMTP_PASS'),
      },
    });

    await transporter.sendMail({
      from: `"Gentong Mas ERP" <${this.configService.getOrThrow('SMTP_USER')}>`,
      to: user.email,
      subject: 'Your verification code',
      html: `
        <h2>Gentong Mas ERP</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing:4px">${code}</h1>
        <p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
      `,
    });

    return { message: 'OTP sent to your email' };
  }

  async verifyOtp(
    userId: string,
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        used: false,
        expiresAt: { gt: new Date() }, // Not yet expired
      },
      include: { user: true },
    });

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Mark OTP as used (single-use)
    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    const payload: JwtPayload = {
      sub: userId,
      email: otp.user.email,
    };

    const accessToken = this.signAccessToken(payload);
    const refreshToken = await this.saveRefreshToken(userId);

    return { accessToken, refreshToken };
  }

  // ─── Select tenant ────────────────────────────────────────────────────────

  async selectTenant(
    userId: string,
    companyId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Validate that this user actually belongs to the requested company
    const tenant = await this.prisma.userTenant.findUnique({
      where: { userId_companyId: { userId, companyId } },
      include: { user: true },
    });

    if (!tenant) {
      throw new UnauthorizedException('You do not have access to this company');
    }

    const payload: JwtPayload = {
      sub: userId,
      email: tenant.user.email,
      companyId,
      role: tenant.role,
    };

    const accessToken = this.signAccessToken(payload);
    const refreshToken = await this.saveRefreshToken(userId);

    return { accessToken, refreshToken };
  }

  // ─── Refresh token ────────────────────────────────────────────────────────

  async refreshToken(
    rawToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify the JWT signature and expiry
    let payload: Pick<JwtPayload, 'sub'>;
    try {
      payload = this.jwtService.verify<Pick<JwtPayload, 'sub'>>(rawToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find all valid refresh tokens for this user and check against the raw token
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        expiresAt: { gt: new Date() },
      },
    });

    // Find the matching stored hash
    let matchedToken: (typeof storedTokens)[0] | undefined;
    for (const stored of storedTokens) {
      const matches = await bcrypt.compare(rawToken, stored.token);
      if (matches) {
        matchedToken = stored;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Refresh token not found or expired');
    }

    // Rotate: delete the old token and issue a new one
    await this.prisma.refreshToken.delete({ where: { id: matchedToken.id } });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: payload.sub },
    });

    const accessToken = this.signAccessToken({
      sub: user.id,
      email: user.email,
    });
    const newRefreshToken = await this.saveRefreshToken(user.id);

    return { accessToken, refreshToken: newRefreshToken };
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async logout(rawToken: string): Promise<{ message: string }> {
    // Remove the specific refresh token (other sessions remain active)
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { expiresAt: { gt: new Date() } },
    });

    for (const stored of storedTokens) {
      const matches = await bcrypt.compare(rawToken, stored.token);
      if (matches) {
        await this.prisma.refreshToken.delete({ where: { id: stored.id } });
        break;
      }
    }

    return { message: 'Logged out successfully' };
  }
}
