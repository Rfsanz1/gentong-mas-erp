import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Injectable()
export class SettingsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getAll() {
    const settings = await this.prisma.appSetting.findMany({ orderBy: { key: 'asc' } });
    return Object.fromEntries(settings.map(s => [s.key, s.value]));
  }

  async update(data: Record<string, string>) {
    const ops = Object.entries(data).map(([key, value]) =>
      this.prisma.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
    );
    await Promise.all(ops);
    return this.getAll();
  }

  async get(key: string) {
    const s = await this.prisma.appSetting.findUnique({ where: { key } });
    return s?.value ?? null;
  }
}
