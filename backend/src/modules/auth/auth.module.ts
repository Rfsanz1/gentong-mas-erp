import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { OtpService } from './services/otp.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { UserModule } from '../user/user.module.js';
import { PrismaService } from '../../core/prisma/prisma.service.js';

// GoogleStrategy is only registered when both required env vars are present.
// Import lazily so the module file still loads without throwing.
const googleProviders = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ? [
      (await import('./strategies/google.strategy.js')).GoogleStrategy,
    ]
  : [];

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change-this-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, JwtStrategy, PrismaService, ...googleProviders],
  exports: [AuthService],
})
export class AuthModule {}
