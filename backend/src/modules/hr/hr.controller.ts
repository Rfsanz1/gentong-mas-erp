import { Controller, Get, Post, Put, Delete, Param, Body, Query, Inject, UseGuards } from '@nestjs/common';
import { HrService } from './hr.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';

@Controller('hr')
@UseGuards(JwtAuthGuard)
export class HrController {
  constructor(@Inject(HrService) private readonly svc: HrService) {}

  // ─── Stats ────────────────────────────────────────────────────────────
  @Get('stats') getStats() { return this.svc.getStats(); }

  // ─── Employees ────────────────────────────────────────────────────────
  @Get('employees') getEmployees(@Query() q: any) { return this.svc.getEmployees(q); }
  @Get('employees/:id') getEmployee(@Param('id') id: string) { return this.svc.getEmployee(id); }
  @Post('employees') createEmployee(@Body() dto: any) { return this.svc.createEmployee(dto); }
  @Put('employees/:id') updateEmployee(@Param('id') id: string, @Body() dto: any) { return this.svc.updateEmployee(id, dto); }
  @Delete('employees/:id') deleteEmployee(@Param('id') id: string) { return this.svc.deleteEmployee(id); }

  // ─── Departments ──────────────────────────────────────────────────────
  @Get('departments') getDepartments(@Query() q: any) { return this.svc.getDepartments(q); }
  @Post('departments') createDepartment(@Body() dto: any) { return this.svc.createDepartment(dto); }
  @Put('departments/:id') updateDepartment(@Param('id') id: string, @Body() dto: any) { return this.svc.updateDepartment(id, dto); }

  // ─── Positions ────────────────────────────────────────────────────────
  @Get('positions') getPositions(@Query() q: any) { return this.svc.getPositions(q); }
  @Post('positions') createPosition(@Body() dto: any) { return this.svc.createPosition(dto); }
  @Put('positions/:id') updatePosition(@Param('id') id: string, @Body() dto: any) { return this.svc.updatePosition(id, dto); }

  // ─── Attendances ──────────────────────────────────────────────────────
  @Get('attendances') getAttendances(@Query() q: any) { return this.svc.getAttendances(q); }
  @Post('attendances') createAttendance(@Body() dto: any) { return this.svc.createAttendance(dto); }
  @Put('attendances/:id') updateAttendance(@Param('id') id: string, @Body() dto: any) { return this.svc.updateAttendance(id, dto); }

  // ─── Leaves ───────────────────────────────────────────────────────────
  @Get('leaves') getLeaves(@Query() q: any) { return this.svc.getLeaves(q); }
  @Post('leaves') createLeave(@Body() dto: any) { return this.svc.createLeave(dto); }
  @Post('leaves/:id/approve') approveLeave(@Param('id') id: string) { return this.svc.approveLeave(id); }
  @Post('leaves/:id/reject') rejectLeave(@Param('id') id: string) { return this.svc.rejectLeave(id); }

  // ─── Trainings ────────────────────────────────────────────────────────
  @Get('trainings') getTrainings(@Query() q: any) { return this.svc.getTrainings(q); }
  @Post('trainings') createTraining(@Body() dto: any) { return this.svc.createTraining(dto); }
  @Put('trainings/:id') updateTraining(@Param('id') id: string, @Body() dto: any) { return this.svc.updateTraining(id, dto); }

  // ─── Loans ────────────────────────────────────────────────────────────
  @Get('loans') getLoans(@Query() q: any) { return this.svc.getLoans(q); }
  @Post('loans') createLoan(@Body() dto: any) { return this.svc.createLoan(dto); }
  @Post('loans/:id/approve') approveLoan(@Param('id') id: string) { return this.svc.approveLoan(id); }

  // ─── BPJS ─────────────────────────────────────────────────────────────
  @Get('bpjs') getBpjs(@Query() q: any) { return this.svc.getBpjsSummary(q); }

  // ─── Appraisals ───────────────────────────────────────────────────────
  @Get('appraisals') getAppraisals(@Query() q: any) { return this.svc.getAppraisals(q); }
  @Post('appraisals') createAppraisal(@Body() dto: any) { return this.svc.createAppraisal(dto); }
  @Put('appraisals/:id') updateAppraisal(@Param('id') id: string, @Body() dto: any) { return this.svc.updateAppraisal(id, dto); }

  // ─── Settings ─────────────────────────────────────────────────────────
  @Get('settings') getSettings() { return this.svc.getSettings(); }
  @Put('settings') updateSettings(@Body() dto: any) { return this.svc.updateSettings(dto); }

  // ─── Payrolls (legacy + new) ──────────────────────────────────────────
  @Get('payrolls') getPayrolls(@Query() q: any) { return this.svc.getPayrolls(q); }
  @Post('payrolls') createPayroll(@Body() dto: any) { return this.svc.createPayroll(dto); }
  @Put('payrolls/:id') updatePayroll(@Param('id') id: string, @Body() dto: any) { return this.svc.updatePayroll(id, dto); }

  // Payroll stats dashboard
  @Get('payrolls/stats') getPayrollStats() { return this.svc.getPayrollStats(); }

  // Payroll periods
  @Get('payrolls/periods') getPeriods(@Query() q: any) { return this.svc.getPeriods(q); }
  @Post('payrolls/periods') createPeriod(@Body() dto: any) { return this.svc.createPeriod(dto); }
  @Post('payrolls/periods/:id/approve') approvePeriod(@Param('id') id: string) { return this.svc.approvePeriod(id); }

  // Payslips
  @Get('payrolls/slips') getSlips(@Query() q: any) { return this.svc.getSlips(q); }
  @Get('payrolls/slips/:id') getSlip(@Param('id') id: string) { return this.svc.getSlip(id); }

  // Batch processing
  @Post('payrolls/batch') processBatch(@Body() dto: any) { return this.svc.processBatch(dto); }

  // Salary components
  @Get('payrolls/components') getComponents(@Query() q: any) { return this.svc.getComponents(q); }
  @Post('payrolls/components') createComponent(@Body() dto: any) { return this.svc.createComponent(dto); }
  @Put('payrolls/components/:id') updateComponent(@Param('id') id: string, @Body() dto: any) { return this.svc.updateComponent(id, dto); }
  @Delete('payrolls/components/:id') deleteComponent(@Param('id') id: string) { return this.svc.deleteComponent(id); }

  // History
  @Get('payrolls/history') getHistory(@Query() q: any) { return this.svc.getHistory(q); }

  // Bank export
  @Post('payrolls/bank-export/preview') previewBankExport(@Body() dto: any) { return this.svc.previewBankExport(dto); }
  @Post('payrolls/bank-export') exportBank(@Body() dto: any) { return this.svc.exportBank(dto); }

  // Reports
  @Get('payrolls/reports') getPayrollReports(@Query() q: any) { return this.svc.getPayrollReports(q); }
}
