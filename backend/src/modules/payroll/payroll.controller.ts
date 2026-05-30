import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PayrollService } from './payroll.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';

@Controller('payroll')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly svc: PayrollService) {}

  // Periods
  @Get('periods')          getPeriods(@Query() q: any)                    { return this.svc.getPeriods(q); }
  @Post('periods')         createPeriod(@Body() dto: any)                 { return this.svc.createPeriod(dto); }
  @Post('periods/:id/calculate') calculate(@Param('id') id: string)      { return this.svc.calculatePayroll(id); }
  @Post('periods/:id/approve')   approve(@Param('id') id: string)        { return this.svc.approvePayroll(id); }
  @Post('periods/:id/process')   process(@Param('id') id: string)        { return this.svc.processPayment(id); }

  // Slips
  @Get('slips')            getSlips(@Query() q: any)                      { return this.svc.getSlips(q); }
  @Get('slips/:id')        getSlip(@Param('id') id: string)               { return this.svc.getSlip(id); }

  // Components
  @Get('components')       getComponents()                                { return this.svc.getComponents(); }
  @Post('components')      createComponent(@Body() dto: any)              { return this.svc.createComponent(dto); }
  @Put('components/:id')   updateComponent(@Param('id') id: string, @Body() dto: any) { return this.svc.updateComponent(id, dto); }

  // BPJS
  @Get('bpjs-config/:empId')    getBPJSConfig(@Param('empId') id: string) { return this.svc.getBPJSConfig(id); }
  @Post('bpjs-config/:empId')   upsertBPJS(@Param('empId') id: string, @Body() dto: any) { return this.svc.upsertBPJSConfig(id, dto); }

  // Reports
  @Get('reports/bpjs/:periodId')  bpjsReport(@Param('periodId') id: string)  { return this.svc.getBPJSReport(id); }
  @Get('reports/pph21/:periodId') pph21Report(@Param('periodId') id: string) { return this.svc.getPPh21Report(id); }
}
