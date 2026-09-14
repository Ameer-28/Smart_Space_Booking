import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiSecurity,
  ApiQuery,
} from '@nestjs/swagger';
import { ReservasiService } from './reservasi.service';
import { CreateReservasiDto } from './dto/create-reservasi.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MakerKeyGuard } from '../common/guards/maker-key.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Reservasi Member')
@Controller('api/reservasi')
@ApiBearerAuth('JWT')
@ApiSecurity('MakerKey')
export class ReservasiController {
  constructor(private readonly reservasiService: ReservasiService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, MakerKeyGuard)
  @Roles('member')
  @ApiOperation({ summary: 'Buat Pemesanan Space Baru (Member)' })
  async create(
    @Body() dto: CreateReservasiDto,
    @CurrentUser() user: any,
    @Request() req: any,
  ) {
    const data = await this.reservasiService.create(
      dto,
      user.member.id,
      user.maker_id,
    );
    return {
      status: true,
      statusCode: HttpStatus.CREATED,
      message: 'Reservasi berhasil dibuat! Silakan tunggu konfirmasi admin.',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard, MakerKeyGuard)
  @Roles('member')
  @ApiOperation({ summary: 'Lihat Status Semua Pemesanan Saya (Member)' })
  async getMy(@CurrentUser() user: any) {
    const data = await this.reservasiService.getMy(user.member.id);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('my/history')
  @UseGuards(JwtAuthGuard, RolesGuard, MakerKeyGuard)
  @Roles('member')
  @ApiOperation({ summary: 'Lihat Histori Pemesanan Berdasarkan Bulan & Tahun (Member)' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getMyHistory(
    @CurrentUser() user: any,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    const data = await this.reservasiService.getMyHistory(
      user.member.id,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/e-ticket')
  @UseGuards(JwtAuthGuard, MakerKeyGuard)
  @ApiOperation({ summary: 'Cetak E-Ticket / Bukti Nota Digital Reservasi' })
  async getETicket(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const memberId = user.member?.id || null;
    const data = await this.reservasiService.getETicket(id, memberId, user.role);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'E-Ticket berhasil dimuat',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, MakerKeyGuard)
  @ApiOperation({ summary: 'Lihat Detail Reservasi Berdasarkan ID' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const memberId = user.member?.id || null;
    const data = await this.reservasiService.getById(id, memberId, user.role);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard, MakerKeyGuard)
  @Roles('member')
  @ApiOperation({ summary: 'Batalkan Pemesanan (Member)' })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const data = await this.reservasiService.cancel(id, user.member.id);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Reservasi berhasil dibatalkan oleh pengguna',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
