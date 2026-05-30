import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Injectable()
export class HrService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getEmployees(query: any) {
    const { search, departemen, status, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (departemen) where.departemen = departemen;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({ where, skip, take: Number(limit), orderBy: { name: 'asc' } }),
      this.prisma.employee.count({ where }),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async getEmployee(id: string) {
    const e = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        payrolls: { take: 12, orderBy: { createdAt: 'desc' } },
        attendances: { take: 30, orderBy: { tanggal: 'desc' } },
      },
    });
    if (!e) throw new NotFoundException('Karyawan tidak ditemukan');
    return e;
  }

  async createEmployee(dto: any) { return this.prisma.employee.create({ data: dto }); }
  async updateEmployee(id: string, dto: any) { return this.prisma.employee.update({ where: { id }, data: dto }); }
  async deleteEmployee(id: string) { return this.prisma.employee.update({ where: { id }, data: { status: 'nonaktif' } }); }

  async getPayrolls(query: any) {
    const { employeeId, status, periode, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (periode) where.periode = { contains: periode };
    const [data, total] = await Promise.all([
      this.prisma.payroll.findMany({ where, skip, take: Number(limit), include: { employee: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.payroll.count({ where }),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async createPayroll(dto: any) {
    const { gapok, tunjangan = 0, potongan = 0, ...rest } = dto;
    const netto = Number(gapok) + Number(tunjangan) - Number(potongan);
    return this.prisma.payroll.create({ data: { ...rest, gapok: Number(gapok), tunjangan: Number(tunjangan), potongan: Number(potongan), netto } });
  }

  async updatePayroll(id: string, dto: any) { return this.prisma.payroll.update({ where: { id }, data: dto }); }

  async getAttendances(query: any) {
    const { employeeId, tanggal, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (tanggal) where.tanggal = { gte: new Date(tanggal) };
    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({ where, skip, take: Number(limit), include: { employee: true }, orderBy: { tanggal: 'desc' } }),
      this.prisma.attendance.count({ where }),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async createAttendance(dto: any) { return this.prisma.attendance.create({ data: dto }); }

  async getStats() {
    const [total, aktif, cuti] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.employee.count({ where: { status: 'aktif' } }),
      this.prisma.employee.count({ where: { status: 'cuti' } }),
    ]);
    const totalGaji = await this.prisma.payroll.aggregate({ _sum: { netto: true }, where: { status: 'confirmed' } });
    return { total, aktif, cuti, nonaktif: total - aktif - cuti, totalGaji: totalGaji._sum.netto ?? 0 };
  }
}
