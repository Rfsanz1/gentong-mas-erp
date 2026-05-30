import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  async getAssets(query: any) {
    const { search, kategori, status, branchId, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (search) where.OR = [{ nama: { contains: search, mode: 'insensitive' } }, { kode: { contains: search, mode: 'insensitive' } }];
    if (kategori) where.kategori = kategori;
    if (status) where.status = status;
    if (branchId) where.branchId = branchId;

    const [data, total] = await Promise.all([
      this.prisma.fixedAsset.findMany({
        where, skip, take: Number(limit),
        include: { depreciations: { orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }], take: 1 } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.fixedAsset.count({ where }),
    ]);

    const enriched = data.map(a => {
      const lastDep = a.depreciations[0];
      const nilaiBuku = lastDep ? Number(lastDep.nilaiBuku) : Number(a.nilaiPerolehan);
      return { ...a, nilaiBuku, akumDepresiasi: Number(a.nilaiPerolehan) - nilaiBuku };
    });

    return { data: enriched, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async getAsset(id: string) {
    const a = await this.prisma.fixedAsset.findUnique({
      where: { id },
      include: { depreciations: { orderBy: [{ tahun: 'asc' }, { bulan: 'asc' }] } },
    });
    if (!a) throw new NotFoundException('Aset tidak ditemukan');
    const nilaiBuku = a.depreciations.length > 0
      ? Number(a.depreciations[a.depreciations.length - 1].nilaiBuku)
      : Number(a.nilaiPerolehan);
    return { ...a, nilaiBuku, akumDepresiasi: Number(a.nilaiPerolehan) - nilaiBuku };
  }

  async createAsset(dto: any) {
    const asset = await this.prisma.fixedAsset.create({ data: dto });
    // Jurnal perolehan aset
    try {
      if (dto.accountAssetId) {
        await this.prisma.journal.create({
          data: {
            nomor: `JNL-ASSET-${Date.now()}`,
            tanggal: new Date(dto.tanggalPerolehan),
            deskripsi: `Perolehan Aset: ${dto.nama}`,
            status: 'POSTED',
            lines: {
              create: [
                { accountId: dto.accountAssetId, debit: Number(dto.nilaiPerolehan), kredit: 0, deskripsi: `Aset Tetap: ${dto.nama}` },
                { accountId: await this.findOrCreateAccountId('1000', 'Kas/Bank', 'ASSET'), debit: 0, kredit: Number(dto.nilaiPerolehan), deskripsi: 'Kas/Bank' },
              ],
            },
          },
        });
      }
    } catch { /* journal optional */ }
    return asset;
  }

  async updateAsset(id: string, dto: any) {
    return this.prisma.fixedAsset.update({ where: { id }, data: dto });
  }

  // ─── DEPRESIASI MANUAL ────────────────────────────────────────────────────
  async calculateDepreciation(assetId: string, bulan: number, tahun: number) {
    const asset = await this.prisma.fixedAsset.findUnique({
      where: { id: assetId },
      include: { depreciations: { orderBy: [{ tahun: 'asc' }, { bulan: 'asc' }] } },
    });
    if (!asset) throw new NotFoundException('Aset tidak ditemukan');
    if (asset.status !== 'ACTIVE') throw new BadRequestException('Aset tidak aktif');

    const nilaiPerolehan = Number(asset.nilaiPerolehan);
    const nilaiResidu    = Number(asset.nilaiResidu);
    const umurBulan      = asset.umurEkonomi;

    const prevDep = asset.depreciations[asset.depreciations.length - 1];
    const prevNilaiBuku   = prevDep ? Number(prevDep.nilaiBuku)   : nilaiPerolehan;
    const prevAkumDep     = prevDep ? Number(prevDep.akumDepresiasi) : 0;

    if (prevNilaiBuku <= nilaiResidu) return null;

    let beban = 0;
    if (asset.metodeDepresiasi === 'STRAIGHT_LINE') {
      beban = (nilaiPerolehan - nilaiResidu) / umurBulan;
    } else {
      const rate = 2 / umurBulan;
      beban = prevNilaiBuku * rate;
    }
    beban = Math.round(Math.min(beban, prevNilaiBuku - nilaiResidu));

    const akumDepresiasi = prevAkumDep + beban;
    const nilaiBuku = nilaiPerolehan - akumDepresiasi;

    return { beban, akumDepresiasi, nilaiBuku, bulan, tahun };
  }

  // ─── RUN MONTHLY DEPRECIATION ─────────────────────────────────────────────
  async runMonthlyDepreciation(bulan: number, tahun: number) {
    const assets = await this.prisma.fixedAsset.findMany({ where: { status: 'ACTIVE' } });
    const results: any[] = [];

    for (const asset of assets) {
      const calc = await this.calculateDepreciation(asset.id, bulan, tahun);
      if (!calc || calc.beban <= 0) continue;

      const dep = await this.prisma.assetDepreciation.upsert({
        where: { assetId_bulan_tahun: { assetId: asset.id, bulan, tahun } },
        create: {
          assetId: asset.id, bulan, tahun,
          bebanDepresiasi: calc.beban,
          akumDepresiasi: calc.akumDepresiasi,
          nilaiBuku: calc.nilaiBuku,
        },
        update: {
          bebanDepresiasi: calc.beban,
          akumDepresiasi: calc.akumDepresiasi,
          nilaiBuku: calc.nilaiBuku,
        },
      });

      // Auto journal
      try {
        if (asset.accountDepreciasiId && asset.accountAkumDepId) {
          const journal = await this.prisma.journal.create({
            data: {
              nomor: `JNL-DEP-${asset.kode}-${tahun}${String(bulan).padStart(2, '0')}`,
              tanggal: new Date(tahun, bulan - 1, 28),
              deskripsi: `Depresiasi ${asset.nama} ${bulan}/${tahun}`,
              status: 'POSTED',
              lines: {
                create: [
                  { accountId: asset.accountDepreciasiId, debit: calc.beban, kredit: 0, deskripsi: `Beban Depresiasi - ${asset.nama}` },
                  { accountId: asset.accountAkumDepId, debit: 0, kredit: calc.beban, deskripsi: `Akum. Depresiasi - ${asset.nama}` },
                ],
              },
            },
          });
          await this.prisma.assetDepreciation.update({ where: { id: dep.id }, data: { journalId: journal.id } });
        }
      } catch { /* journal optional */ }

      results.push({ asset: asset.nama, kode: asset.kode, ...calc });
    }

    return { processed: results.length, results };
  }

  // ─── DISPOSAL ────────────────────────────────────────────────────────────
  async disposeAsset(assetId: string, tanggalDisposal: Date, nilaiDisposal: number, note?: string) {
    const asset = await this.getAsset(assetId);
    if (asset.status !== 'ACTIVE') throw new BadRequestException('Aset sudah dilepas');

    const akumDep  = Number(asset.akumDepresiasi);
    const nilaiBuku = Number(asset.nilaiBuku);
    const gainLoss  = nilaiDisposal - nilaiBuku;

    try {
      const lines: any[] = [
        { accountId: await this.findOrCreateAccountId('1001', 'Akumulasi Depresiasi', 'ASSET'), debit: akumDep, kredit: 0, deskripsi: 'Hapus Akumulasi Depresiasi' },
        { accountId: await this.findOrCreateAccountId('1000', 'Kas/Bank', 'ASSET'), debit: nilaiDisposal, kredit: 0, deskripsi: 'Penerimaan dari Disposal' },
        { accountId: asset.accountAssetId ?? await this.findOrCreateAccountId('1100', 'Aset Tetap', 'ASSET'), debit: 0, kredit: Number(asset.nilaiPerolehan), deskripsi: `Hapus Aset: ${asset.nama}` },
      ];
      if (gainLoss > 0) {
        lines.push({ accountId: await this.findOrCreateAccountId('8001', 'Keuntungan Disposal Aset', 'REVENUE'), debit: 0, kredit: gainLoss, deskripsi: 'Gain Disposal Aset' });
      } else if (gainLoss < 0) {
        lines.push({ accountId: await this.findOrCreateAccountId('9001', 'Kerugian Disposal Aset', 'EXPENSE'), debit: Math.abs(gainLoss), kredit: 0, deskripsi: 'Loss Disposal Aset' });
      }
      await this.prisma.journal.create({
        data: {
          nomor: `JNL-DISP-${asset.kode}-${Date.now()}`,
          tanggal: tanggalDisposal, deskripsi: `Disposal Aset: ${asset.nama}`, status: 'POSTED',
          lines: { create: lines },
        },
      });
    } catch { /* journal optional */ }

    const newStatus = nilaiDisposal > 0 ? 'SOLD' : 'DISPOSED';
    await this.prisma.fixedAsset.update({ where: { id: assetId }, data: { status: newStatus, note } });
    return { gainLoss, nilaiBuku, nilaiDisposal, status: newStatus };
  }

  // ─── DEPRECIATION SCHEDULE ───────────────────────────────────────────────
  async getDepreciationSchedule(assetId: string) {
    const asset = await this.prisma.fixedAsset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Aset tidak ditemukan');

    const nilaiPerolehan = Number(asset.nilaiPerolehan);
    const nilaiResidu    = Number(asset.nilaiResidu);
    const umurBulan      = asset.umurEkonomi;
    const startDate      = new Date(asset.tanggalPerolehan);

    const schedule: any[] = [];
    let nilaiBuku = nilaiPerolehan;
    let akumDep = 0;

    for (let i = 0; i < umurBulan; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 1);
      if (nilaiBuku <= nilaiResidu) break;

      let beban = 0;
      if (asset.metodeDepresiasi === 'STRAIGHT_LINE') {
        beban = (nilaiPerolehan - nilaiResidu) / umurBulan;
      } else {
        beban = nilaiBuku * (2 / umurBulan);
      }
      beban = Math.min(Math.round(beban), nilaiBuku - nilaiResidu);
      akumDep += beban;
      nilaiBuku -= beban;

      schedule.push({ periode: `${d.getMonth() + 1}/${d.getFullYear()}`, bulan: d.getMonth() + 1, tahun: d.getFullYear(), bebanDepresiasi: beban, akumDepresiasi: akumDep, nilaiBuku });
    }

    return { asset, schedule };
  }

  // ─── ASSET REGISTER ──────────────────────────────────────────────────────
  async getAssetRegister(asOfDate?: Date) {
    const asOf = asOfDate ?? new Date();
    const assets = await this.prisma.fixedAsset.findMany({
      where: { status: 'ACTIVE' },
      include: { depreciations: { orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }], take: 1 } },
      orderBy: { tanggalPerolehan: 'asc' },
    });

    return assets.map(a => {
      const lastDep = a.depreciations[0];
      const nilaiBuku = lastDep ? Number(lastDep.nilaiBuku) : Number(a.nilaiPerolehan);
      return {
        kode: a.kode, nama: a.nama, kategori: a.kategori,
        tanggalPerolehan: a.tanggalPerolehan,
        nilaiPerolehan: Number(a.nilaiPerolehan),
        nilaiResidu: Number(a.nilaiResidu),
        akumDepresiasi: Number(a.nilaiPerolehan) - nilaiBuku,
        nilaiBuku,
        umurEkonomi: a.umurEkonomi,
        metode: a.metodeDepresiasi,
      };
    });
  }

  async getKategori() {
    const assets = await this.prisma.fixedAsset.findMany({ select: { kategori: true }, distinct: ['kategori'] });
    return assets.map(a => a.kategori);
  }

  private async findOrCreateAccountId(code: string, name: string, type: string): Promise<string> {
    const acc = await this.prisma.account.findFirst({ where: { code } });
    if (acc) return acc.id;
    const created = await this.prisma.account.create({ data: { code, name, type: type as any } });
    return created.id;
  }
}
