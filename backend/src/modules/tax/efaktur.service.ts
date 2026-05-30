import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { EFakturStatus } from '@prisma/client';

export interface EFakturCSVRow {
  FK: string;
  KD_JENIS_TRANSAKSI: string;
  FG_PENGGANTI: string;
  NOMOR_FAKTUR: string;
  MASA_PAJAK: string;
  TAHUN_PAJAK: string;
  TANGGAL_FAKTUR: string;
  NPWP: string;
  NAMA: string;
  ALAMAT_LENGKAP: string;
  JUMLAH_DPP: string;
  JUMLAH_PPN: string;
  JUMLAH_PPNBM: string;
  IS_CREDITABLE: string;
}

@Injectable()
export class EFakturService {
  constructor(private prisma: PrismaService) {}

  async findAll(periode?: string) {
    const where: any = {};
    if (periode) {
      const [year, month] = periode.split('-').map(Number);
      where.tanggal = {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      };
    }
    return this.prisma.eFaktur.findMany({
      where,
      include: { tax: true },
      orderBy: { tanggal: 'desc' },
    });
  }

  async findOne(id: string) {
    const ef = await this.prisma.eFaktur.findUnique({ where: { id }, include: { tax: true } });
    if (!ef) throw new NotFoundException(`E-Faktur ID ${id} tidak ditemukan`);
    return ef;
  }

  async generateNomorFaktur(): Promise<string> {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const last = await this.prisma.eFaktur.findFirst({ orderBy: { createdAt: 'desc' } });

    let seq = 1;
    if (last) {
      const parts = last.nomorFaktur.split('.');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    const seqStr = String(seq).padStart(8, '0');
    const seqFront = seqStr.slice(0, 3);
    const seqMid = seqStr.slice(3, 6);
    return `${seqFront}.${seqMid}-${yy}.${seqStr}`;
  }

  async createEFaktur(data: {
    referenceId?: string;
    npwpPembeli?: string;
    namaPembeli?: string;
    nilaiDPP: number;
    nilaiPPN: number;
    taxId?: string;
    tanggal?: Date;
  }) {
    const nomorFaktur = await this.generateNomorFaktur();
    return this.prisma.eFaktur.create({
      data: {
        nomorFaktur,
        tanggal: data.tanggal ?? new Date(),
        referenceId: data.referenceId,
        npwpPembeli: data.npwpPembeli,
        namaPembeli: data.namaPembeli,
        nilaiDPP: data.nilaiDPP,
        nilaiPPN: data.nilaiPPN,
        taxId: data.taxId,
        status: EFakturStatus.DRAFT,
      },
      include: { tax: true },
    });
  }

  async createFromSaleInvoice(saleId: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: { customer: true },
    });
    if (!sale) throw new NotFoundException(`Invoice ${saleId} tidak ditemukan`);

    const dpp = Number(sale.totalHarga) - Number(sale.diskon);
    const ppn = Number(sale.pajak);

    if (ppn <= 0) throw new BadRequestException('Invoice ini tidak memiliki PPN');

    return this.createEFaktur({
      referenceId: saleId,
      npwpPembeli: sale.customer?.npwp ?? '',
      namaPembeli: sale.customer?.name ?? sale.salesName ?? 'Umum',
      nilaiDPP: dpp,
      nilaiPPN: ppn,
      tanggal: sale.tanggal,
    });
  }

  async updateStatus(id: string, status: EFakturStatus) {
    await this.findOne(id);
    return this.prisma.eFaktur.update({ where: { id }, data: { status } });
  }

  async exportCSV(periode: string): Promise<string> {
    const efakturs = await this.findAll(periode);
    if (efakturs.length === 0) throw new BadRequestException(`Tidak ada e-Faktur untuk periode ${periode}`);

    const header = [
      'FK', 'KD_JENIS_TRANSAKSI', 'FG_PENGGANTI', 'NOMOR_FAKTUR',
      'MASA_PAJAK', 'TAHUN_PAJAK', 'TANGGAL_FAKTUR',
      'NPWP', 'NAMA', 'ALAMAT_LENGKAP',
      'JUMLAH_DPP', 'JUMLAH_PPN', 'JUMLAH_PPNBM', 'IS_CREDITABLE',
    ].join(',');

    const rows = efakturs.map((ef) => {
      const tgl = new Date(ef.tanggal);
      const masa = String(tgl.getMonth() + 1).padStart(2, '0');
      const tahun = String(tgl.getFullYear());
      const tanggalFmt = `${String(tgl.getDate()).padStart(2, '0')}/${masa}/${tahun}`;
      const npwp = (ef.npwpPembeli ?? '').replace(/\D/g, '').padEnd(15, '0');

      return [
        'FK',
        '01',
        '0',
        ef.nomorFaktur,
        masa,
        tahun,
        tanggalFmt,
        npwp,
        `"${ef.namaPembeli ?? ''}"`,
        '""',
        String(Math.round(Number(ef.nilaiDPP))),
        String(Math.round(Number(ef.nilaiPPN))),
        '0',
        '1',
      ].join(',');
    });

    return [header, ...rows].join('\n');
  }

  async getRekapPPN(periode: string) {
    const [year, month] = periode.split('-').map(Number);
    if (!year || !month) throw new BadRequestException('Format periode harus YYYY-MM');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const [masukan, keluaran] = await Promise.all([
      this.prisma.taxLine.findMany({
        where: {
          tipe: 'PAID',
          createdAt: { gte: startDate, lt: endDate },
          tax: { tipe: 'PPN' },
        },
        include: { tax: true },
      }),
      this.prisma.taxLine.findMany({
        where: {
          tipe: 'COLLECTED',
          createdAt: { gte: startDate, lt: endDate },
          tax: { tipe: 'PPN' },
        },
        include: { tax: true },
      }),
    ]);

    const totalMasukan = masukan.reduce((s, l) => s + Number(l.taxAmount), 0);
    const totalKeluaran = keluaran.reduce((s, l) => s + Number(l.taxAmount), 0);
    const kurangLebih = totalKeluaran - totalMasukan;

    return {
      periode,
      ppnMasukan: { items: masukan, total: totalMasukan },
      ppnKeluaran: { items: keluaran, total: totalKeluaran },
      kurangLebih,
      status: kurangLebih > 0 ? 'KURANG_BAYAR' : kurangLebih < 0 ? 'LEBIH_BAYAR' : 'NIHIL',
    };
  }

  async remove(id: string) {
    const ef = await this.findOne(id);
    if (ef.status !== EFakturStatus.DRAFT) {
      throw new BadRequestException('Hanya e-Faktur berstatus DRAFT yang dapat dihapus');
    }
    return this.prisma.eFaktur.delete({ where: { id } });
  }
}
