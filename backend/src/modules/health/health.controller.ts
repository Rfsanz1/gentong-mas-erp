import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../core/decorators/public.decorator.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @ApiOperation({ summary: 'Health check — no auth required' })
  @Public()
  @Get()
  status() {
    return {
      status: 'ok',
      service: 'erp-modern-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
