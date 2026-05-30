import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { NotificationGateway } from './notification.gateway.js';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
  ) {}

  async findAll(recipient: string) {
    return this.prisma.notification.findMany({
      where: { recipient },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date(), status: 'read' },
    });
  }

  async create(recipient: string, title: string, message: string) {
    const notification = await this.prisma.notification.create({
      data: { recipient, title, message, status: 'pending' },
    });
    this.notificationGateway.broadcastNotification({ recipient, title, message });
    return notification;
  }

  async sendWhatsApp(target: string, message: string) {
    if (!process.env.FONNTE_TOKEN) return { skipped: true, reason: 'FONNTE_TOKEN tidak dikonfigurasi' };
    try {
      const resp = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { Authorization: process.env.FONNTE_TOKEN },
        body: JSON.stringify({ target, message }),
      });
      const result: any = await resp.json();
      await this.prisma.notification.create({
        data: {
          recipient: target,
          title: 'WhatsApp',
          message,
          status: result.status ? 'sent' : 'failed',
        },
      });
      return result;
    } catch (e: any) {
      return { error: e.message };
    }
  }
}
