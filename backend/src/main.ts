import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './core/interceptors/response.interceptor.js';
import { GlobalExceptionFilter } from './core/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // ─── Global Exception Filter ─────────────────────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) { callback(null, true); return; }
      const allowed =
        origin.startsWith('http://localhost:') ||
        origin.endsWith('.replit.dev') ||
        origin.endsWith('.repl.co') ||
        origin.endsWith('.replit.app') ||
        origin.endsWith('.replit.com');
      if (allowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Branch-Id'],
  });

  // ─── Global Pipes ─────────────────────────────────────────────────────────
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }));

  // ─── Global Interceptors ──────────────────────────────────────────────────
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ─── Rate Limiter ─────────────────────────────────────────────────────────
  const rateLimitWindow = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
  const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 1000);
  const requestCounters = new Map<string, { count: number; windowStart: number }>();

  app.use((req: any, res: any, next: any) => {
    const forwarded = req.headers['x-forwarded-for']?.toString().split(',')[0].trim();
    const key = forwarded || req.ip || 'global';
    const now = Date.now();
    const counter = requestCounters.get(key);

    if (!counter || now - counter.windowStart > rateLimitWindow) {
      requestCounters.set(key, { count: 1, windowStart: now });
    } else {
      counter.count += 1;
      requestCounters.set(key, counter);
    }

    if ((requestCounters.get(key)?.count ?? 0) > rateLimitMax) {
      res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
      return;
    }

    res.setHeader('X-Powered-By', 'Gentong Mas ERP');
    next();
  });

  // ─── Swagger ──────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Gentong Mas ERP API')
    .setDescription('Backend API for Gentong Mas ERP System')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT',
    )
    .addTag('auth', 'Authentication & Authorization')
    .addTag('users', 'User & Role Management')
    .addTag('inventory', 'Inventory & Stock Management')
    .addTag('sales', 'Sales Orders & Invoices')
    .addTag('purchasing', 'Purchase Orders & Goods Receipt')
    .addTag('finance', 'Finance & Accounting')
    .addTag('payroll', 'Payroll & HR')
    .addTag('pos', 'Point of Sale')
    .addTag('assets', 'Fixed Asset Management')
    .addTag('tax', 'Tax Engine')
    .addTag('manufacturing', 'Manufacturing & Production')
    .addTag('crm', 'CRM & Leads')
    .addTag('helpdesk', 'Helpdesk & Tickets')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  console.log(`Gentong Mas ERP running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
