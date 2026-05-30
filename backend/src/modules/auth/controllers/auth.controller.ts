import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import { Public } from '../../../core/decorators/public.decorator.js';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard.js';
import { LoginDto, RefreshTokenDto } from '../dto/auth.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Login',
    description: 'Autentikasi user dan dapatkan access token + refresh token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGci...',
          refreshToken: 'eyJhbGci...',
          token: 'eyJhbGci...',
          user: {
            id: 'uuid',
            name: 'Admin',
            email: 'admin@erp.com',
            role: 'admin',
            roles: ['admin'],
            permissions: ['read:users'],
          },
          appRedirect: 'http://localhost:3000',
        },
        timestamp: '2026-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Kredensial tidak valid' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @ApiOperation({
    summary: 'Refresh token',
    description: 'Perbarui access token menggunakan refresh token yang masih valid.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token berhasil diperbarui',
    schema: {
      example: {
        success: true,
        data: { accessToken: 'eyJhbGci...', refreshToken: 'eyJhbGci...' },
        timestamp: '2026-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 401, description: 'Refresh token tidak valid' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @ApiOperation({
    summary: 'Profil user aktif',
    description: 'Kembalikan data user yang sedang login berdasarkan JWT.',
  })
  @ApiBearerAuth('JWT')
  @ApiResponse({
    status: 200,
    description: 'Data profil berhasil diambil',
  })
  @ApiResponse({ status: 401, description: 'Token tidak valid atau kedaluwarsa' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: any) {
    return user;
  }
}
