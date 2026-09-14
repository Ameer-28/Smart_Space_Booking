import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, HttpStatus } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS
  app.enableCors();

  // Global prefix (tidak pakai, karena kontrak API sudah pakai /api/...)
  // app.setGlobalPrefix('api');

  // Serve static uploads
  const uploadsPath = join(process.cwd(), 'uploads');
  const subfolders = ['spaces', 'members', 'general'];
  subfolders.forEach((folder) => {
    const fullPath = join(uploadsPath, folder);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
    }
  });
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Smart Space Booking API')
    .setDescription(
      'Backend RESTful API untuk Sistem Reservasi Coworking Space - UKK RPL 2026/2027 SMK Telkom Malang',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-maker-key' }, 'MakerKey')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Smart Space Booking API running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}
bootstrap();
