import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getSummary() {
    const [users, roles, notifications, permissions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.role.count(),
      this.prisma.notification.count(),
      this.prisma.permission.count(),
    ]);

    return {
      users,
      roles,
      notifications,
      permissions,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  async getAdminSummary() {
    const [users, roles, notifications, permissions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.role.count(),
      this.prisma.notification.count({ where: { readAt: null } }),
      this.prisma.permission.count(),
    ]);

    return {
      totalUsers: users,
      totalRoles: roles,
      unreadNotifications: notifications,
      totalPermissions: permissions,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  async getSalesSummary() {
    const [notifications] = await Promise.all([
      this.prisma.notification.count({ where: { readAt: null } }),
    ]);

    return {
      unreadNotifications: notifications,
      uptime: process.uptime(),
    };
  }

  async getGudangSummary() {
    const [notifications] = await Promise.all([
      this.prisma.notification.count({ where: { readAt: null } }),
    ]);

    return {
      unreadNotifications: notifications,
      uptime: process.uptime(),
    };
  }

  async getPosSummary() {
    const [notifications] = await Promise.all([
      this.prisma.notification.count({ where: { readAt: null } }),
    ]);

    return {
      unreadNotifications: notifications,
      uptime: process.uptime(),
    };
  }

  async getDriverSummary() {
    const [notifications] = await Promise.all([
      this.prisma.notification.count({ where: { readAt: null } }),
    ]);

    return {
      unreadNotifications: notifications,
      uptime: process.uptime(),
    };
  }
}
