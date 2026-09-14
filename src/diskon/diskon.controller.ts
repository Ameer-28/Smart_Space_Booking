import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DiskonService } from './diskon.service';
import { MakerKeyGuard } from '../common/guards/maker-key.guard';

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
  @UseGuards(MakerKeyGuard)
  @ApiSecurity('MakerKey')
  @ApiOperation({ summary: 'Daftar Promo / Diskon yang Sedang Aktif' })
  async getActive(@Request() req: any) {
    const data = await this.diskonService.getActive(req.makerId);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('check')
  @UseGuards(MakerKeyGuard)
  @ApiSecurity('MakerKey')
  @ApiOperation({ summary: 'Periksa Validitas & Hitung Potongan Kode Promo' })
  async checkPromo(@Body() dto: CheckPromoDto, @Request() req: any) {
    const data = await this.diskonService.checkPromo(dto.nama_diskon, req.makerId);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Kode promo valid dan masih berlaku!',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @UseGuards(MakerKeyGuard)
  @ApiSecurity('MakerKey')
  @ApiOperation({ summary: 'Lihat Detail Diskon Berdasarkan ID' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const data = await this.diskonService.getById(id, req.makerId);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
