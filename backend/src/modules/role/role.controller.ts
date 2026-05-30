import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class RoleController {
  constructor(@Inject(RoleService) private readonly roleService: RoleService) {}

  @Get()
  async getRoles() {
    return this.roleService.findAll();
  }

  @Get('permissions')
  async getPermissions() {
    return this.roleService.findPermissions();
  }
}
