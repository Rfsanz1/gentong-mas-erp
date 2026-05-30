import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import { UserService } from './user.service.js';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto.js';

@ApiTags('users')
@ApiBearerAuth('JWT')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(@Inject(UserService) private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Profil user aktif', description: 'Ambil data lengkap user yang sedang login.' })
  @ApiResponse({ status: 200, description: 'Berhasil' })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return this.userService.getCurrentUser(user.userId || user.sub || user.id);
  }

  @ApiOperation({ summary: 'Daftar semua user', description: 'Hanya dapat diakses oleh Admin / Owner / Super Admin.' })
  @ApiResponse({ status: 200, description: 'Berhasil' })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak diizinkan' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'Super Admin', 'Owner')
  @Get()
  async listUsers() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Buat user baru', description: 'Daftarkan user baru dengan role tertentu.' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak diizinkan' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'Super Admin', 'Owner')
  @Post()
  async createUser(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @ApiOperation({ summary: 'Update data user', description: 'Perbarui nama, email, password, atau role user.' })
  @ApiParam({ name: 'id', description: 'UUID user', example: 'uuid-user-id' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Berhasil diperbarui' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak diizinkan' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'Super Admin', 'Owner')
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.update(id, body);
  }

  @ApiOperation({ summary: 'Toggle aktif / nonaktif user' })
  @ApiParam({ name: 'id', description: 'UUID user', example: 'uuid-user-id' })
  @ApiResponse({ status: 200, description: 'Status berhasil diubah' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'Super Admin', 'Owner')
  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    return this.userService.toggleActive(id);
  }

  @ApiOperation({ summary: 'Hapus user', description: 'Soft delete user berdasarkan ID.' })
  @ApiParam({ name: 'id', description: 'UUID user', example: 'uuid-user-id' })
  @ApiResponse({ status: 200, description: 'User berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('admin', 'Super Admin', 'Owner')
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
