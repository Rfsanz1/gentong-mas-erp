import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import * as bcrypt from 'bcryptjs';

// Maps role names to their respective frontend application URLs
const ROLE_APP_MAP: Record<string, string> = {
  admin: 'http://localhost:3000',
  owner: 'http://localhost:3000',
  'super admin': 'http://localhost:3000',
  sales: 'http://localhost:3002',
  'sales manager': 'http://localhost:3002',
  gudang: 'http://localhost:3003',
  'staff gudang': 'http://localhost:3003',
  kasir: 'http://localhost:3004',
  driver: 'http://localhost:3005',
};

@Injectable()
export class AuthService {
  static resolveAppRedirect(role: string): string {
    return ROLE_APP_MAP[role.toLowerCase()] ?? 'http://localhost:3000';
  }

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    const roleName = user.role?.name ?? 'user';
    const permissions = user.role?.permissions?.map((rp) => rp.permission.name) ?? [];

    return { ...user, roles: [roleName], permissions };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const secret = process.env.JWT_SECRET || 'change-this-secret';

    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, roles: user.roles, permissions: user.permissions },
      { secret, expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { secret: process.env.JWT_REFRESH_SECRET || secret, expiresIn: '7d' },
    );

    const role = user.roles[0]?.toLowerCase() ?? '';
    const appRedirect = AuthService.resolveAppRedirect(role);

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        roles: user.roles,
        permissions: user.permissions,
      },
      appRedirect,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'change-this-secret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      });

      if (!user) throw new UnauthorizedException('User tidak ditemukan');

      const roleName = user.role?.name ?? 'user';
      const permissions = user.role?.permissions?.map((rp) => rp.permission.name) ?? [];
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
}
