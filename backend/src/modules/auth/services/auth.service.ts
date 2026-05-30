import {
  Inject,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import { OtpService } from './otp.service.js';
import * as bcrypt from 'bcryptjs';
import type { Profile } from 'passport-google-oauth20';

// Roles allowed to access the admin dashboard
const ADMIN_ROLES = new Set(['admin', 'owner', 'super admin', 'system']);

// Maps role names to their respective frontend application URLs
const ROLE_APP_MAP: Record<string, string> = {
  admin: 'http://localhost:3000',
  owner: 'http://localhost:3000',
  'super admin': 'http://localhost:3000',
  system: 'http://localhost:3000',
  sales: 'http://localhost:3002',
  'sales manager': 'http://localhost:3002',
  gudang: 'http://localhost:3003',
  'staff gudang': 'http://localhost:3003',
  kasir: 'http://localhost:3004',
  driver: 'http://localhost:3005',
};

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  companyId?: string;
}

@Injectable()
export class AuthService {
  static resolveAppRedirect(role: string): string {
    return ROLE_APP_MAP[role.toLowerCase()] ?? 'http://localhost:3000';
  }

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(OtpService) private readonly otpService: OtpService,
  ) {}

  // ─── Internal helpers ──────────────────────────────────────────────────────

  private buildTokens(payload: JwtPayload) {
    const secret = process.env.JWT_SECRET || 'change-this-secret';
    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });
    const refreshToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      {
        secret: process.env.JWT_REFRESH_SECRET || secret,
        expiresIn: '7d',
      },
    );
    return { accessToken, refreshToken };
  }

  private async loadUserWithRole(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
        companies: { include: { company: true } },
      },
    });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');
    return user;
  }

  private formatUser(user: Awaited<ReturnType<typeof this.loadUserWithRole>>) {
    const roleName = user.role?.name ?? 'user';
    const permissions =
      user.role?.permissions?.map((rp) => rp.permission.name) ?? [];
    const companies = user.companies.map((uc) => ({
      id: uc.company.id,
      name: uc.company.nama,
      logoUrl: uc.company.logo,
    }));
    return { roleName, permissions, companies };
  }

  // ─── Validate email + password ─────────────────────────────────────────────

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
        companies: { include: { company: true } },
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    return user;
  }

  // ─── Login (email + password) ──────────────────────────────────────────────

  async login(email: string, password: string, requiredRoles?: string[]) {
    const user = await this.validateUser(email, password);
    const roleName = user.role?.name ?? 'user';
    const permissions =
      user.role?.permissions?.map((rp) => rp.permission.name) ?? [];
    const companies = user.companies.map((uc) => ({
      id: uc.company.id,
      name: uc.company.nama,
      logoUrl: uc.company.logo,
    }));

    // Role restriction — if caller specifies required roles, enforce here
    if (requiredRoles && requiredRoles.length > 0) {
      const lower = roleName.toLowerCase();
      const hasRole = requiredRoles.some((r) => r.toLowerCase() === lower);
      if (!hasRole) throw new ForbiddenException('Akses ditolak untuk role ini');
    }

    // 2FA: if enabled, return partial state — client must complete OTP
    if (user.is2FAEnabled) {
      await this.otpService.saveAndSend(user.id);
      return {
        requiresOtp: true,
        userId: user.id,
        message: 'Kode OTP telah dikirim ke email Anda',
      };
    }

    // Multi-tenant: if the user belongs to multiple companies, let them choose
    if (companies.length > 1) {
      return {
        requiresTenantSelection: true,
        userId: user.id,
        companies,
      };
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: [roleName],
      permissions,
      companyId: companies[0]?.id,
    };

    const { accessToken, refreshToken } = this.buildTokens(payload);
    const appRedirect = AuthService.resolveAppRedirect(roleName);

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName,
        roles: [roleName],
        permissions,
        is2FAEnabled: user.is2FAEnabled,
      },
      appRedirect,
    };
  }

  // ─── OTP: send ──────────────────────────────────────────────────────────────

  async sendOtp(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');
    await this.otpService.saveAndSend(userId);
  }

  // ─── OTP: verify & issue full token ───────────────────────────────────────

  async verifyOtp(userId: string, code: string) {
    const ok = await this.otpService.verify(userId, code);
    if (!ok) throw new BadRequestException('Kode OTP tidak valid atau sudah kedaluwarsa');

    const user = await this.loadUserWithRole(userId);
    const { roleName, permissions, companies } = this.formatUser(user);

    // After OTP, check if multi-tenant selection is still needed
    if (companies.length > 1) {
      return {
        requiresTenantSelection: true,
        userId: user.id,
        companies,
      };
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: [roleName],
      permissions,
      companyId: companies[0]?.id,
    };

    const { accessToken, refreshToken } = this.buildTokens(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName,
        roles: [roleName],
        permissions,
        is2FAEnabled: user.is2FAEnabled,
      },
    };
  }

  // ─── Tenant selection ──────────────────────────────────────────────────────

  async selectTenant(userId: string, companyId: string) {
    const membership = await this.prisma.userCompany.findUnique({
      where: { userId_companyId: { userId, companyId } },
      include: { company: true },
    });
    if (!membership) throw new ForbiddenException('Akses ke perusahaan ini ditolak');

    const user = await this.loadUserWithRole(userId);
    const { roleName, permissions } = this.formatUser(user);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: [roleName],
      permissions,
      companyId,
    };

    const { accessToken, refreshToken } = this.buildTokens(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName,
        roles: [roleName],
        permissions,
        is2FAEnabled: user.is2FAEnabled,
      },
      companyId,
    };
  }

  // ─── Refresh token ─────────────────────────────────────────────────────────

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string; email: string }>(token, {
        secret:
          process.env.JWT_REFRESH_SECRET ||
          process.env.JWT_SECRET ||
          'change-this-secret',
      });

      const user = await this.loadUserWithRole(payload.sub);
      const { roleName, permissions } = this.formatUser(user);
      const secret = process.env.JWT_SECRET || 'change-this-secret';

      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, roles: [roleName], permissions },
        { secret, expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
      );

      return { accessToken, refreshToken: token };
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid');
    }
  }

  // ─── Google OAuth ──────────────────────────────────────────────────────────

  async validateGoogleUser(profile: Profile) {
    const email = profile.emails?.[0]?.value;
    if (!email) throw new BadRequestException('Email Google tidak tersedia');

    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: profile.id }, { email }] },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
        companies: { include: { company: true } },
      },
    });

    if (!user) {
      // Find default role (user / staff)
      const defaultRole = await this.prisma.role.findFirst({
        where: { name: { in: ['user', 'staff', 'sales'] } },
      });
      if (!defaultRole) throw new BadRequestException('Tidak ada role default tersedia');

      user = await this.prisma.user.create({
        data: {
          email,
          name: profile.displayName ?? email.split('@')[0],
          password: '',
          googleId: profile.id,
          roleId: defaultRole.id,
        },
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
          companies: { include: { company: true } },
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.id },
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
          companies: { include: { company: true } },
        },
      });
    }

    const roleName = user.role?.name ?? 'user';
    const permissions =
      user.role?.permissions?.map((rp) => rp.permission.name) ?? [];
    const companies = user.companies.map((uc) => ({
      id: uc.company.id,
      name: uc.company.nama,
      logoUrl: uc.company.logo,
    }));

    if (companies.length > 1) {
      return { requiresTenantSelection: true, userId: user.id, companies };
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: [roleName],
      permissions,
      companyId: companies[0]?.id,
    };

    const { accessToken, refreshToken } = this.buildTokens(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName,
        roles: [roleName],
        permissions,
        is2FAEnabled: user.is2FAEnabled,
      },
    };
  }

  // ─── Role check helper (for ADMIN / SYSTEM restriction) ───────────────────

  static isAdminRole(role: string): boolean {
    return ADMIN_ROLES.has(role.toLowerCase());
  }
}
