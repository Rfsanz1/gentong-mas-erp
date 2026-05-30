import { Controller, Get, Post, Put, Patch, Param, Body, Query, Inject, UseGuards, Request } from '@nestjs/common';
import { PosService } from './pos.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';

@Controller('pos')
export class PosController {
  constructor(@Inject(PosService) private readonly svc: PosService) {}

  @Post('auth/login') login(@Body() dto: any) { return this.svc.login(dto.username, dto.password); }

  @Get('dashboard') @UseGuards(JwtAuthGuard) getDashboard() { return this.svc.getDashboard(); }
  @Get('products') getProducts(@Query() q: any) { return this.svc.getProducts(q); }
  @Post('products') @UseGuards(JwtAuthGuard) createProduct(@Body() dto: any) { return this.svc.createProduct(dto); }
  @Put('products/:id') @UseGuards(JwtAuthGuard) updateProduct(@Param('id') id: string, @Body() dto: any) { return this.svc.updateProduct(id, dto); }
  @Patch('products/:id') @UseGuards(JwtAuthGuard) patchProduct(@Param('id') id: string, @Body() dto: any) { return this.svc.updateProduct(id, dto); }
  @Get('categories') getCategories() { return this.svc.getCategories(); }
  @Get('sales') @UseGuards(JwtAuthGuard) getSales(@Query() q: any) { return this.svc.getSales(q); }
  @Post('sales') createSale(@Body() dto: any) { return this.svc.createSale(dto); }

  // ─── Transactions (alias untuk sales) ─────────────────────────────────────
  @Get('transactions') @UseGuards(JwtAuthGuard)
  getTransactions(@Query() q: any) { return this.svc.getSales(q); }

  @Post('transactions')
  createTransaction(@Body() dto: any) { return this.svc.createSale(dto); }

  // ─── Sessions ─────────────────────────────────────────────────────────────
  @Get('sessions') @UseGuards(JwtAuthGuard)
  getSessions(@Query() q: any) { return this.svc.getSessions(q); }

  @Get('sessions/active') @UseGuards(JwtAuthGuard)
  getActiveSession(@Request() req: any) { return this.svc.getActiveSession(req.user); }

  @Post('sessions') @UseGuards(JwtAuthGuard)
  openSession(@Body() dto: any, @Request() req: any) { return this.svc.openSession(dto, req.user); }

  @Get('sessions/:id') @UseGuards(JwtAuthGuard)
  getSession(@Param('id') id: string) { return this.svc.getSession(id); }

  @Post('sessions/:id/close') @UseGuards(JwtAuthGuard)
  closeSession(@Param('id') id: string, @Body() dto: any) { return this.svc.closeSession(id, dto); }

  // ─── Reports ──────────────────────────────────────────────────────────────
  @Get('reports/today') @UseGuards(JwtAuthGuard)
  getTodayReport() { return this.svc.getTodayReport(); }
}
