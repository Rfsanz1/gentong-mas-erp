import { Controller, Get, Post, Put, Delete, Param, Body, Query, Inject, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service.js';
import { CostingService } from './stock/costing.service.js';
import { LandedCostService } from './stock/landed-cost.service.js';
import { ValuationService } from './stock/valuation.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
  CostingFIFODto,
  CostingFIFOCommitDto,
  CostingAverageDto,
  RevaluateStockDto,
  CreateLotDto,
  CreateLandedCostDto,
  ApplyLandedCostsDto,
} from './dto/inventory.dto.js';
const R200 = { status: 200, description: 'Berhasil' } as const;
const R201 = { status: 201, description: 'Berhasil dibuat' } as const;
const R401 = { status: 401, description: 'Tidak terautentikasi — JWT tidak valid atau tidak ada' } as const;
const R404 = { status: 404, description: 'Data tidak ditemukan' } as const;

@ApiTags('inventory')
@ApiBearerAuth('JWT')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(
    @Inject(InventoryService) private readonly svc: InventoryService,
    @Inject(CostingService) private readonly costing: CostingService,
    @Inject(LandedCostService) private readonly landedCost: LandedCostService,
    @Inject(ValuationService) private readonly valuation: ValuationService,
  ) {}

  // ─── STATS ────────────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Statistik inventori', description: 'Total produk, nilai stok, produk stok rendah, dsb.' })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('stats')
  getStats() { return this.svc.getStats(); }

  // ─── PRODUCTS ─────────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Daftar produk', description: 'Mendukung filter sku, name, categoryId, serta pagination.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, description: 'Cari berdasarkan nama / SKU' })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('products')
  getProducts(@Query() q: any) { return this.svc.getProducts(q); }

  @ApiOperation({ summary: 'Detail produk' })
  @ApiParam({ name: 'id', description: 'UUID produk' })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Get('products/:id')
  getProduct(@Param('id') id: string) { return this.svc.getProduct(id); }

  @ApiOperation({ summary: 'Tambah produk baru' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse(R201) @ApiResponse(R401)
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @Post('products')
  createProduct(@Body() dto: CreateProductDto) { return this.svc.createProduct(dto); }

  @ApiOperation({ summary: 'Update produk' })
  @ApiParam({ name: 'id', description: 'UUID produk' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Put('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.svc.updateProduct(id, dto);
  }

  @ApiOperation({ summary: 'Hapus produk' })
  @ApiParam({ name: 'id', description: 'UUID produk' })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) { return this.svc.deleteProduct(id); }

  // ─── STOCK ────────────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Update stok produk', description: 'Tambah (in) atau kurang (out) stok di gudang.' })
  @ApiParam({ name: 'id', description: 'UUID produk' })
  @ApiBody({ type: UpdateStockDto })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Post('products/:id/stok')
  updateStok(@Param('id') id: string, @Body() dto: UpdateStockDto) {
    return this.svc.updateStok(id, dto.qty, dto.type, dto.note);
  }

  @ApiOperation({ summary: 'Riwayat pergerakan stok' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'productId', required: false }) @ApiQuery({ name: 'warehouseId', required: false })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('stock-movements')
  getMovements(@Query() q: any) { return this.svc.getStockMovements(q); }

  // ─── STOCK OPNAME ─────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Daftar stock opname' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('stock-opnames')
  getOpnames(@Query() q: any) { return this.svc.getStockOpnames(q); }

  @ApiOperation({ summary: 'Buat stock opname baru' })
  @ApiResponse(R201) @ApiResponse(R401)
  @Post('stock-opnames')
  createOpname(@Body() dto: any) { return this.svc.createStockOpname(dto); }

  // ─── MASTER DATA ──────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Daftar gudang' })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('warehouses')
  getWarehouses() { return this.svc.getWarehouses(); }

  @ApiOperation({ summary: 'Daftar kategori produk' })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('categories')
  getCategories() { return this.svc.getCategories(); }

  @ApiOperation({ summary: 'Daftar merek produk' })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('brands')
  getBrands() { return this.svc.getBrands(); }

  @ApiOperation({ summary: 'Daftar satuan produk' })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('units')
  getUnits() { return this.svc.getUnits(); }

  // ─── COSTING ──────────────────────────────────────────────────────────────
  @ApiOperation({
    summary: 'Kalkulasi FIFO (preview)',
    description: 'Hitung estimasi HPP metode FIFO tanpa mengubah data stok.',
  })
  @ApiBody({ type: CostingFIFODto })
  @ApiResponse(R200) @ApiResponse(R401)
  @Post('costing/fifo/calculate')
  calculateFIFO(@Body() dto: CostingFIFODto) {
    return this.costing.calculateFIFO(dto.productId, dto.qty);
  }

  @ApiOperation({
    summary: 'Commit FIFO',
    description: 'Terapkan FIFO dan kurangi lot stok secara permanen.',
  })
  @ApiBody({ type: CostingFIFOCommitDto })
  @ApiResponse(R200) @ApiResponse(R401)
  @Post('costing/fifo/commit')
  commitFIFO(@Body() dto: CostingFIFOCommitDto) {
    return this.costing.commitFIFO(dto.productId, dto.qty, dto.referenceId);
  }

  @ApiOperation({
    summary: 'Update harga pokok rata-rata',
    description: 'Recalculate average cost setelah penerimaan barang.',
  })
  @ApiBody({ type: CostingAverageDto })
  @ApiResponse(R200) @ApiResponse(R401)
  @Post('costing/average')
  updateAverageCost(@Body() dto: CostingAverageDto) {
    return this.costing.calculateAverageCost(dto.productId, dto.qtyMasuk, dto.unitCost);
  }

  @ApiOperation({ summary: 'Revaluasi stok', description: 'Set harga pokok baru untuk produk.' })
  @ApiBody({ type: RevaluateStockDto })
  @ApiResponse(R200) @ApiResponse(R401)
  @Post('costing/revaluate')
  revaluate(@Body() dto: RevaluateStockDto) {
    return this.costing.revaluateStock(dto.productId, dto.newCost, dto.note);
  }

  @ApiOperation({ summary: 'Buat lot stok baru', description: 'Tambah lot untuk tracking FIFO / expiry date.' })
  @ApiBody({ type: CreateLotDto })
  @ApiResponse(R201) @ApiResponse(R401)
  @Post('costing/lots')
  createLot(@Body() dto: CreateLotDto) {
    return this.costing.createLot({
      ...dto,
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
    });
  }

  // ─── LANDED COST ──────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Daftar landed cost' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('landed-costs')
  getLandedCosts(@Query() q: any) { return this.landedCost.findAll(q); }

  @ApiOperation({ summary: 'Detail landed cost' })
  @ApiParam({ name: 'id', description: 'UUID landed cost' })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Get('landed-costs/:id')
  getLandedCost(@Param('id') id: string) { return this.landedCost.findOne(id); }

  @ApiOperation({ summary: 'Buat draft landed cost', description: 'Catat biaya tambahan (angkut, bea, dll) untuk satu PO.' })
  @ApiBody({ type: CreateLandedCostDto })
  @ApiResponse(R201) @ApiResponse(R401)
  @Post('landed-costs')
  createLandedCost(@Body() dto: CreateLandedCostDto) {
    return this.landedCost.createDraft(dto);
  }

  @ApiOperation({
    summary: 'Terapkan landed costs ke PO',
    description: 'Alokasikan biaya ke tiap item PO sesuai metode split.',
  })
  @ApiBody({ type: ApplyLandedCostsDto })
  @ApiResponse(R200) @ApiResponse(R401)
  @Post('landed-costs/apply')
  applyLandedCosts(@Body() dto: ApplyLandedCostsDto) {
    return this.landedCost.applyLandedCost(dto.purchaseId, dto.costs);
  }

  @ApiOperation({ summary: 'Validasi landed cost' })
  @ApiParam({ name: 'id', description: 'UUID landed cost' })
  @ApiResponse(R200) @ApiResponse(R401)
  @Post('landed-costs/:id/validate')
  validateLandedCost(@Param('id') id: string) {
    return this.landedCost.validate(id);
  }

  // ─── VALUATION ────────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Statistik valuasi stok' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('valuation/stats')
  getValuationStats(@Query('warehouseId') warehouseId?: string) {
    return this.valuation.getValuationStats(warehouseId);
  }

  @ApiOperation({ summary: 'Nilai stok per tanggal' })
  @ApiQuery({ name: 'date', required: false, description: 'ISO date, default: hari ini' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('valuation/stock')
  getStockValuation(@Query('date') date?: string, @Query('warehouseId') warehouseId?: string) {
    return this.valuation.getStockValuation(date ? new Date(date) : undefined, warehouseId);
  }

  @ApiOperation({ summary: 'Laporan aging stok', description: 'Identifikasi stok yang sudah lama tidak bergerak.' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('valuation/aging')
  getStockAging(@Query('warehouseId') warehouseId?: string) {
    return this.valuation.getStockAgingReport(warehouseId);
  }

  @ApiOperation({ summary: 'Laporan slow-moving items' })
  @ApiQuery({ name: 'days', required: false, description: 'Threshold hari tidak bergerak (default: 90)' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('valuation/slow-moving')
  getSlowMoving(@Query('days') days?: string, @Query('warehouseId') warehouseId?: string) {
    return this.valuation.getSlowMovingItems(days ? Number(days) : 90, warehouseId);
  }

  @ApiOperation({ summary: 'Daftar lot stok' })
  @ApiQuery({ name: 'productId', required: false })
  @ApiResponse(R200) @ApiResponse(R401)
  @Get('valuation/lots')
  getStockLots(@Query() q: any) { return this.valuation.getStockLots(q); }

  @ApiOperation({ summary: 'Riwayat valuasi produk' })
  @ApiParam({ name: 'productId', description: 'UUID produk' })
  @ApiResponse(R200) @ApiResponse(R401) @ApiResponse(R404)
  @Get('valuation/history/:productId')
  getValuationHistory(@Param('productId') productId: string) {
    return this.valuation.getValuationHistory(productId);
  }
}
