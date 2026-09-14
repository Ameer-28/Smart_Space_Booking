import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { MakerService } from './maker.service';
import { RegisterMakerDto } from './dto/register-maker.dto';
import { LoginMakerDto } from './dto/login-maker.dto';
import { JwtMakerGuard } from '../common/guards/jwt-maker.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('App Maker (Multi-Tenancy)')
@Controller('api/maker')
export class MakerController {
  constructor(private readonly makerService: MakerService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrasi Akun Siswa (Mendapatkan App Key Unik)' })
  @ApiCreatedResponse({ description: 'Registrasi berhasil' })
  async register(@Body() dto: RegisterMakerDto) {
    const data = await this.makerService.register(dto);
    return {
      status: true,
      statusCode: HttpStatus.CREATED,
      message: 'Registrasi App Maker berhasil! Simpan app_key Anda dengan baik.',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login Akun Siswa Pengembang Frontend' })
  @ApiOkResponse({ description: 'Login berhasil' })
  async login(@Body() dto: LoginMakerDto) {
    const data = await this.makerService.login(dto);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Login App Maker berhasil!',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('me')
  @UseGuards(JwtMakerGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Lihat Profil & App Key Siswa Saat Ini' })
  async getMe(@CurrentUser() user: any) {
    const data = await this.makerService.getMe(user.sub);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @UseGuards(JwtMakerGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Statistik Keseluruhan Data Siswa (App Maker)' })
  async getStats(@CurrentUser() user: any) {
    const data = await this.makerService.getStats(user.sub);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('list')
  @ApiOperation({ summary: 'Daftar Semua Siswa / App Maker Terdaftar (Panel Guru/Penguji)' })
  async getList() {
    const data = await this.makerService.getList();
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
