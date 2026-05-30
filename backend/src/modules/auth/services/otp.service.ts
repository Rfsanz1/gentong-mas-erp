import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import * as nodemailer from 'nodemailer';

const OTP_TTL_MINUTES = 5;

@Injectable()
export class OtpService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly prisma: PrismaService) {
    const host = process.env.SMTP_HOST;
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  generate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async saveAndSend(userId: string): Promise<void> {
    const code = this.generate();
    const expiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { otpCode: code, otpExpiry: expiry },
    });

    if (this.transporter) {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM ?? 'noreply@erp.com',
        to: user.email,
        subject: 'Kode verifikasi Gentong Mas ERP',
        text: `Kode OTP Anda: ${code}\nBerlaku selama ${OTP_TTL_MINUTES} menit.`,
        html: `<p>Kode OTP Anda: <strong>${code}</strong></p><p>Berlaku selama ${OTP_TTL_MINUTES} menit.</p>`,
      });
    } else {
      // No SMTP configured — log code for development
      console.log(`[OTP DEV] userId=${userId} code=${code}`);
    }
  }

  async verify(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.otpCode || !user.otpExpiry) return false;
    if (new Date() > user.otpExpiry) return false;
    if (user.otpCode !== code) return false;

    // Consume code immediately (one-time use)
    await this.prisma.user.update({
      where: { id: userId },
      data: { otpCode: null, otpExpiry: null },
    });
    return true;
  }
}
