import { Controller, Get, Post, Put, Delete, Param, Body, Query, Inject, UseGuards } from '@nestjs/common';
import { HrService } from './hr.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';

@Controller('hr')
@UseGuards(JwtAuthGuard)
export class HrController {
  constructor(@Inject(HrService) private readonly svc: HrService) {}

  @Get('stats') getStats() { return this.svc.getStats(); }
  @Get('employees') getEmployees(@Query() q: any) { return this.svc.getEmployees(q); }
  @Get('employees/:id') getEmployee(@Param('id') id: string) { return this.svc.getEmployee(id); }
  @Post('employees') createEmployee(@Body() dto: any) { return this.svc.createEmployee(dto); }
  @Put('employees/:id') updateEmployee(@Param('id') id: string, @Body() dto: any) { return this.svc.updateEmployee(id, dto); }
  @Delete('employees/:id') deleteEmployee(@Param('id') id: string) { return this.svc.deleteEmployee(id); }
  @Get('payrolls') getPayrolls(@Query() q: any) { return this.svc.getPayrolls(q); }
  @Post('payrolls') createPayroll(@Body() dto: any) { return this.svc.createPayroll(dto); }
  @Put('payrolls/:id') updatePayroll(@Param('id') id: string, @Body() dto: any) { return this.svc.updatePayroll(id, dto); }
  @Get('attendances') getAttendances(@Query() q: any) { return this.svc.getAttendances(q); }
  @Post('attendances') createAttendance(@Body() dto: any) { return this.svc.createAttendance(dto); }
}
