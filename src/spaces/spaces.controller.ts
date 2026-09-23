import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { SpacesService } from './spaces.service';

@ApiTags('Spaces (Katalog & Ketersediaan)')
@Controller('api/spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get('types')
  @ApiOperation({ summary: 'Daftar Tipe Space (Personal Desk, Meeting Room, Private Office)' })
  getTypes() {
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data: this.spacesService.getTypes(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('availability')
  @ApiOperation({ summary: 'Cek Ketersediaan Space Berdasarkan Tanggal & Jam' })
  @ApiQuery({ name: 'id_space', type: Number })
  @ApiQuery({ name: 'tanggal', example: '2026-08-30' })
  @ApiQuery({ name: 'jam_mulai', example: '09:00' })
  @ApiQuery({ name: 'durasi_jam', type: Number })
  async checkAvailability(
    @Query('id_space', ParseIntPipe) id_space: number,
    @Query('tanggal') tanggal: string,
    @Query('jam_mulai') jam_mulai: string,
    @Query('durasi_jam', ParseIntPipe) durasi_jam: number,
  ) {
    const data = await this.spacesService.checkAvailability(
      id_space,
      tanggal,
      jam_mulai,
      durasi_jam,
    );
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Space tersedia untuk dipesan pada jadwal yang diminta',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lihat Semua Space Coworking (Filter ?tipe & ?search)' })
  @ApiQuery({ name: 'tipe', required: false, enum: ['desk', 'meeting_room', 'private_office'] })
  @ApiQuery({ name: 'search', required: false })
  async getAll(
    @Query('tipe') tipe?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.spacesService.getAll(tipe, search);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lihat Detail Space Coworking Berdasarkan ID' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.spacesService.getById(id);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
