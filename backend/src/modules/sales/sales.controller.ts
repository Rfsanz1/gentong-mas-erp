import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, Inject, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { SalesService } from './sales.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { CanAccessGuard } from '../../core/guards/can-access.guard.js';
import { CanAccess } from '../../core/decorators/can-access.decorator.js';
import { Public } from '../../core/decorators/public.decorator.js';
import {
  CreateOrderDto,
  UpdateOrderDto,
  ConfirmOrderDto,
  UpdatePengirimanDto,
} from './dto/sales.dto.js';
const R200 = { status: 200, description: 'Berhasil' } as const;
const R201 = { status: 201, description: 'Berhasil dibuat' } as const;
const R401 = { status: 401, description: 'Tidak terautentikasi — JWT tidak valid atau tidak ada' } as const;
const R403 = { status: 403, description: 'Tidak diizinkan untuk role ini' } as const;
const R404 = { status: 404, description: 'Data tidak ditemukan' } as const;

@ApiTags('sales')
@ApiBearerAuth('JWT')
@Controller('sales')
@UseGuards(JwtAuthGuard, CanAccessGuard)
@CanAccess({ roles: ['Super Admin', 'Owner', 'Admin', 'Sales'] })
export class SalesController {
  constructor(@Inject(SalesService) private readonly svc: SalesService) {}

  @ApiOperation({ summary: 'Ringkasan penjualan', description: 'Total order, omzet, grafik tren per periode.' })
  @ApiQuery({ name: 'from', required: false, description: 'Tanggal mulai (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', required: false, description: 'Tanggal akhir (YYYY-MM-DD)' })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R403)
  @Get('summary')
  getSummary(@Query() q: any) { return this.svc.getSalesSummary(q); }

  @ApiOperation({ summary: 'Daftar nama sales', description: 'List nama sales dari data user.' })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('list')
  getSalesList() { return this.svc.getSalesList(); }

  @ApiOperation({ summary: 'Daftar order penjualan' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, description: 'Filter status order' })
  @ApiQuery({ name: 'search', required: false, description: 'Cari nama customer / nomor order' })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R403)
  @Get('orders')
  getOrders(@Query() q: any) { return this.svc.getOrders(q); }

  @ApiOperation({ summary: 'Detail order penjualan' })
  @ApiParam({ name: 'id', description: 'ID order (integer)', example: 1 })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Get('orders/:id')
  getOrder(@Param('id') id: string) { return this.svc.getOrder(Number(id)); }

  @ApiOperation({ summary: 'Buat order penjualan baru' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse(R201) @ApiResponse(R401) @ApiResponse(R403)
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @Post('orders')
  createOrder(@Body() dto: CreateOrderDto) { return this.svc.createOrder(dto); }

  @ApiOperation({ summary: 'Update order penjualan' })
  @ApiParam({ name: 'id', description: 'ID order', example: 1 })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Put('orders/:id')
  updateOrder(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.svc.updateOrder(Number(id), dto);
  }

  @ApiOperation({ summary: 'Batalkan order', description: 'Soft delete order penjualan.' })
  @ApiParam({ name: 'id', description: 'ID order', example: 1 })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Delete('orders/:id')
  deleteOrder(@Param('id') id: string) { return this.svc.deleteOrder(Number(id)); }

  @ApiOperation({ summary: 'Update status pengiriman' })
  @ApiParam({ name: 'id', description: 'ID order', example: 1 })
  @ApiBody({ type: UpdatePengirimanDto })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Patch('orders/:id/pengiriman')
  updatePengiriman(@Param('id') id: string, @Body() dto: UpdatePengirimanDto) {
    return this.svc.updatePengiriman(Number(id), dto);
  }

  @ApiOperation({
    summary: 'Konfirmasi pengiriman → StockMovement OUT',
    description:
      'Mengkonfirmasi pengiriman order. Memicu StockMovement OUT untuk setiap item. Kirim warehouseId untuk deduct stok.',
  })
  @ApiParam({ name: 'id', description: 'ID order', example: 1 })
  @ApiBody({ type: ConfirmOrderDto })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Post('orders/:id/confirm-delivery')
  confirmDelivery(@Param('id') id: string, @Body() dto: ConfirmOrderDto) {
    return this.svc.confirmOrderDelivery(Number(id), dto.warehouseId, dto.note);
  }

  @ApiOperation({ summary: 'Upload bukti transfer', description: 'Simpan gambar bukti bayar dalam format base64.' })
  @ApiParam({ name: 'id', description: 'ID order', example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['base64'],
      properties: { base64: { type: 'string', description: 'Gambar base64 encoded', example: 'data:image/png;base64,...' } },
    },
  })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Post('orders/:id/bukti-transfer')
  uploadBukti(@Param('id') id: string, @Body('base64') base64: string) {
    return this.svc.uploadBuktiTransfer(Number(id), base64);
  }

  @ApiOperation({ summary: 'Kirim notifikasi WhatsApp ke customer' })
  @ApiParam({ name: 'id', description: 'ID order', example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { phone: { type: 'string', example: '08123456789' }, message: { type: 'string', example: 'Pesanan Anda sedang diproses.' } },
    },
  })
  @ApiResponse(R200) @ApiResponse(R401)
  @Post('orders/:id/whatsapp')
  sendWa(@Param('id') id: string, @Body() dto: any) {
    return this.svc.sendWhatsAppNotification({ ...dto, id });
  }

  @ApiOperation({ summary: 'Daftar faktur penjualan' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R403)
  @Get('faktur')
  getSales(@Query() q: any) { return this.svc.getSales(q); }

  @ApiOperation({ summary: 'Ambil lokasi customer (publik via token)', description: 'Endpoint publik — tidak perlu JWT.' })
  @ApiParam({ name: 'token', description: 'Token unik pengiriman' })
  @ApiResponse(R200)
  @Public()
  @Get('customer-location/:token')
  getCustomerLoc(@Param('token') token: string) {
    return this.svc.getCustomerLocation(token);
  }

  @ApiOperation({ summary: 'Simpan lokasi customer (publik via token)' })
  @ApiParam({ name: 'token', description: 'Token unik pengiriman' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['lat', 'lng'],
      properties: {
        lat: { type: 'string', example: '-6.2088' },
        lng: { type: 'string', example: '106.8456' },
      },
    },
  })
  @ApiResponse(R200)
  @Public()
  @Post('customer-location/:token')
  saveCustomerLoc(@Param('token') token: string, @Body() dto: { lat: string; lng: string }) {
    return this.svc.saveCustomerLocation(token, dto.lat, dto.lng);
  }
}
