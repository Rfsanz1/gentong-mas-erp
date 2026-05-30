import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import { Public } from '../../../core/decorators/public.decorator.js';
import { Roles } from '../../../core/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard.js';
import {
  LoginDto,
  RefreshTokenDto,
  SendOtpDto,
  VerifyOtpDto,
  SelectTenantDto,
} from '../dto/auth.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  // ─── Email + Password Login ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Login', description: 'Autentikasi user dan dapatkan token.' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil atau perlu OTP / pilih tenant',
    schema: {
      example: {
        accessToken: 'eyJhbGci...',
        refreshToken: 'eyJhbGci...',
        user: { id: 'uuid', name: 'Admin', email: 'admin@erp.com', role: 'admin' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Kredensial tidak valid' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // ─── OTP: send ────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Kirim OTP', description: 'Kirim kode OTP ke email user.' })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({ status: 200, description: 'OTP terkirim' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('otp/send')
  async sendOtp(@Body() dto: SendOtpDto) {
    await this.authService.sendOtp(dto.userId);
    return { message: 'Kode OTP telah dikirim ke email Anda' };
  }

  // ─── OTP: verify ──────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Verifikasi OTP', description: 'Verifikasi kode OTP dan terbitkan token.' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'OTP valid, token diterbitkan' })
  @ApiResponse({ status: 400, description: 'Kode OTP tidak valid atau kedaluwarsa' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('otp/verify')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.userId, dto.code);
  }

  // ─── Tenant selection ─────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Pilih tenant', description: 'Pilih perusahaan dan terbitkan token berlaku untuk tenant tersebut.' })
  @ApiBody({ type: SelectTenantDto })
  @ApiResponse({ status: 200, description: 'Tenant dipilih, token diterbitkan' })
  @ApiResponse({ status: 403, description: 'Akses ke perusahaan ini ditolak' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('select-tenant')
  async selectTenant(@Body() dto: SelectTenantDto) {
    return this.authService.selectTenant(dto.userId, dto.companyId);
  }

  // ─── Refresh token ────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Refresh token', description: 'Perbarui access token.' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token diperbarui' })
  @ApiResponse({ status: 401, description: 'Refresh token tidak valid' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  // ─── Current user profile ─────────────────────────────────────────────────

  @ApiOperation({ summary: 'Profil user aktif', description: 'Kembalikan data user yang sedang login.' })
  @ApiBearerAuth('JWT')
  @ApiResponse({ status: 200, description: 'Data profil berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Token tidak valid atau kedaluwarsa' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: unknown) {
    return user;
  }

  // ─── Admin-only profile (role restriction example) ─────────────────────────

  @ApiOperation({ summary: 'Profil admin', description: 'Hanya ADMIN atau SYSTEM yang dapat mengakses.' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super admin', 'system', 'owner')
  @Get('me/admin')
  async meAdmin(@CurrentUser() user: unknown) {
    return user;
  }

  // ─── Google OAuth: initiate ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Login dengan Google', description: 'Mulai alur OAuth Google.' })
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport redirects automatically
  }

  // ─── Google OAuth: callback ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Callback Google OAuth', description: 'Endpoint callback dari Google.' })
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @CurrentUser() result: any,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    if (result?.requiresTenantSelection) {
      const params = new URLSearchParams({
        userId: result.userId,
        companies: JSON.stringify(result.companies),
      });
      return res.redirect(`${frontendUrl}/select-tenant?${params}`);
    }

    if (result?.accessToken) {
      const params = new URLSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken ?? '',
      });
      return res.redirect(`${frontendUrl}/auth/callback?${params}`);
    }

    return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
}
