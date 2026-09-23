import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DiskonService } from './diskon.service';

class CheckPromoDto {
  @ApiProperty({ example: 'DISKONHEMAT20' })
  @IsString()
  @IsNotEmpty()
  nama_diskon: string;
}

@ApiTags('Diskon & Promo')
@Controller('api/diskon')
export class DiskonController {
  constructor(private readonly diskonService: DiskonService) {}

  @Get('active')
  @ApiOperation({ summary: 'Daftar Promo / Diskon yang Sedang Aktif' })
  async getActive() {
    const data = await this.diskonService.getActive();
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('check')
  @ApiOperation({ summary: 'Periksa Validitas & Hitung Potongan Kode Promo' })
  async checkPromo(@Body() dto: CheckPromoDto) {
    const data = await this.diskonService.checkPromo(dto.nama_diskon);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Kode promo valid dan masih berlaku!',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lihat Detail Diskon Berdasarkan ID' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.diskonService.getById(id);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
