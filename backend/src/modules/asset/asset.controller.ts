import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AssetService } from './asset.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetController {
  constructor(private readonly svc: AssetService) {}

  @Get()                          getAssets(@Query() q: any)                         { return this.svc.getAssets(q); }
  @Get('register')                getRegister(@Query('asOf') d?: string)             { return this.svc.getAssetRegister(d ? new Date(d) : undefined); }
  @Get('kategori')                getKategori()                                      { return this.svc.getKategori(); }
  @Get(':id')                     getAsset(@Param('id') id: string)                  { return this.svc.getAsset(id); }
  @Post()                         createAsset(@Body() dto: any)                      { return this.svc.createAsset(dto); }
  @Put(':id')                     updateAsset(@Param('id') id: string, @Body() d: any) { return this.svc.updateAsset(id, d); }
  @Get(':id/schedule')            getSchedule(@Param('id') id: string)               { return this.svc.getDepreciationSchedule(id); }
  @Post(':id/dispose')            dispose(@Param('id') id: string, @Body() dto: any) {
    return this.svc.disposeAsset(id, new Date(dto.tanggalDisposal), Number(dto.nilaiDisposal), dto.note);
  }
  @Post('depreciation/run')       runDepreciation(@Body() dto: { bulan: number; tahun: number }) {
    return this.svc.runMonthlyDepreciation(dto.bulan, dto.tahun);
  }
  @Post('depreciation/calculate') calcDepreciation(@Body() dto: { assetId: string; bulan: number; tahun: number }) {
    return this.svc.calculateDepreciation(dto.assetId, dto.bulan, dto.tahun);
  }
}
