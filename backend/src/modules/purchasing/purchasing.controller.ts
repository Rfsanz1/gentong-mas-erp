import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, Inject, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PurchasingService } from './purchasing.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  CreateGoodsReceiptDto,
  ConfirmGoodsReceiptDto,
  CreateSupplierDto,
  UpdateSupplierDto,
  ChangeStatusDto,
} from './dto/purchasing.dto.js';
const R200 = { status: 200, description: 'Berhasil' } as const;
const R201 = { status: 201, description: 'Berhasil dibuat' } as const;
const R401 = { status: 401, description: 'Tidak terautentikasi — JWT tidak valid atau tidak ada' } as const;
const R404 = { status: 404, description: 'Data tidak ditemukan' } as const;

@ApiTags('purchasing')
@ApiBearerAuth('JWT')
@Controller('purchasing')
@UseGuards(JwtAuthGuard)
export class PurchasingController {
  constructor(@Inject(PurchasingService) private readonly svc: PurchasingService) {}

  // ─── STATS ────────────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Statistik pembelian', description: 'Total PO, nilai pembelian, PO menunggu approve.' })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('stats')
  getStats() { return this.svc.getStats(); }

  // ─── PURCHASE ORDERS ──────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Daftar Purchase Order' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, description: 'Filter status: DRAFT | APPROVED | RECEIVED | CANCELLED' })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('purchase-orders')
  getPOs(@Query() q: any) { return this.svc.getPurchaseOrders(q); }

  @ApiOperation({ summary: 'Detail Purchase Order' })
  @ApiParam({ name: 'id', description: 'UUID Purchase Order' })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Get('purchase-orders/:id')
  getPO(@Param('id') id: string) { return this.svc.getPurchaseOrder(id); }

  @ApiOperation({ summary: 'Buat Purchase Order baru' })
  @ApiBody({ type: CreatePurchaseOrderDto })
  @ApiResponse(R201) @ApiResponse(R401)
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @Post('purchase-orders')
  createPO(@Body() dto: CreatePurchaseOrderDto) { return this.svc.createPurchaseOrder(dto); }

  @ApiOperation({ summary: 'Update Purchase Order', description: 'Hanya bisa diupdate jika masih berstatus DRAFT.' })
  @ApiParam({ name: 'id', description: 'UUID Purchase Order' })
  @ApiBody({ type: UpdatePurchaseOrderDto })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Put('purchase-orders/:id')
  updatePO(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.svc.updatePurchaseOrder(id, dto);
  }

  @ApiOperation({ summary: 'Approve Purchase Order', description: 'Setujui PO sehingga bisa diproses penerimaan barang.' })
  @ApiParam({ name: 'id', description: 'UUID Purchase Order' })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Post('purchase-orders/:id/approve')
  approvePO(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.approvePurchaseOrder(id, user?.userId ?? 'system');
  }

  @ApiOperation({ summary: 'Batalkan Purchase Order' })
  @ApiParam({ name: 'id', description: 'UUID Purchase Order' })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Post('purchase-orders/:id/cancel')
  cancelPO(@Param('id') id: string) { return this.svc.cancelPurchaseOrder(id); }

  @ApiOperation({ summary: 'Ubah status Purchase Order secara manual' })
  @ApiParam({ name: 'id', description: 'UUID Purchase Order' })
  @ApiBody({ type: ChangeStatusDto })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Patch('purchase-orders/:id/status')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    return this.svc.changeStatus(id, dto.status);
  }

  // ─── GOODS RECEIPTS ───────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Daftar Goods Receipt (penerimaan barang)' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'purchaseOrderId', required: false })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('goods-receipts')
  getGRs(@Query() q: any) { return this.svc.getGoodsReceipts(q); }

  @ApiOperation({ summary: 'Buat Goods Receipt baru (status: draft)', description: 'Catat penerimaan barang dari supplier.' })
  @ApiBody({ type: CreateGoodsReceiptDto })
  @ApiResponse(R201) @ApiResponse(R401)
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @Post('goods-receipts')
  createGR(@Body() dto: CreateGoodsReceiptDto) { return this.svc.createGoodsReceipt(dto); }

  @ApiOperation({
    summary: 'Konfirmasi Goods Receipt → StockMovement IN',
    description: 'Konfirmasi penerimaan barang. Memicu StockMovement IN untuk setiap item. Stok gudang akan bertambah.',
  })
  @ApiParam({ name: 'id', description: 'UUID Goods Receipt' })
  @ApiBody({ type: ConfirmGoodsReceiptDto })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Post('goods-receipts/:id/confirm')
  confirmGR(@Param('id') id: string, @Body() dto: ConfirmGoodsReceiptDto) {
    return this.svc.confirmGoodsReceipt(id, dto.warehouseId);
  }

  // ─── SUPPLIERS ────────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Daftar supplier' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false, description: 'Cari nama supplier' })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('suppliers')
  getSuppliers(@Query() q: any) { return this.svc.getSuppliers(q); }

  @ApiOperation({ summary: 'Tambah supplier baru' })
  @ApiBody({ type: CreateSupplierDto })
  @ApiResponse(R201) @ApiResponse(R401)
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @Post('suppliers')
  createSupplier(@Body() dto: CreateSupplierDto) { return this.svc.createSupplier(dto); }

  @ApiOperation({ summary: 'Update data supplier' })
  @ApiParam({ name: 'id', description: 'UUID supplier' })
  @ApiBody({ type: UpdateSupplierDto })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Put('suppliers/:id')
  updateSupplier(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.svc.updateSupplier(id, dto);
  }

  @ApiOperation({ summary: 'Nonaktifkan supplier', description: 'Soft delete supplier.' })
  @ApiParam({ name: 'id', description: 'UUID supplier' })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Delete('suppliers/:id')
  deleteSupplier(@Param('id') id: string) { return this.svc.deleteSupplier(id); }
}
