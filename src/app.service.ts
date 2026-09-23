import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot() {
    return {
      name: 'Coworking Space Backend API - UKK RPL Paket B',
      version: '1.0.0',
      status: 'online',
      swagger_docs: '/docs',
      description:
        'Backend service untuk Sistem Reservasi Coworking Space.',
      documentation_links: {
        swagger: `${process.env.BASE_URL || 'http://localhost:3000'}/docs`,
        swagger_json: `${process.env.BASE_URL || 'http://localhost:3000'}/docs-json`,
      },
    };
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
