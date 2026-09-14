import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Status API & Petunjuk Penggunaan' })
  getRoot() {
    return this.appService.getRoot();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health Check Server' })
  getHealth() {
    return this.appService.getHealth();
  }
}
