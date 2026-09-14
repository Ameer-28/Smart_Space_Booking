import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiSecurity,
  ApiQuery,
} from '@nestjs/swagger';
import { SpacesService } from './spaces.service';
import { MakerKeyGuard } from '../common/guards/maker-key.guard';

@ApiTags('Spaces (Katalog & Ketersediaan)')
@Controller('api/spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get('types')
  @UseGuards(MakerKeyGuard)
  @ApiSecurity('MakerKey')
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
  @UseGuards(MakerKeyGuard)
  @ApiSecurity('MakerKey')
  @ApiOperation({ summary: 'Cek Ketersediaan Space Berdasarkan Tanggal & Jam' })
  @ApiQuery({ name: 'id_space', type: Number })
  @ApiQuery({ name: 'tanggal', example: '2026-08-30' })
  @ApiQuery({ name: 'jam_mulai', example: '09:00' })
  @ApiQuery({ name: 'durasi_jam', type: Number })
  async checkAvailability(
    @Request() req: any,
    @Query('id_space', ParseIntPipe) id_space: number,
    @Query('tanggal') tanggal: string,
    @Query('jam_mulai') jam_mulai: string,
    @Query('durasi_jam', ParseIntPipe) durasi_jam: number,
  ) {
    const data = await this.spacesService.checkAvailability(
      req.makerId,
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
  @UseGuards(MakerKeyGuard)
  @ApiSecurity('MakerKey')
  @ApiOperation({ summary: 'Lihat Semua Space Coworking (Filter ?tipe & ?search)' })
  @ApiQuery({ name: 'tipe', required: false, enum: ['desk', 'meeting_room', 'private_office'] })
  @ApiQuery({ name: 'search', required: false })
  async getAll(
    @Request() req: any,
    @Query('tipe') tipe?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.spacesService.getAll(req.makerId, tipe, search);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @UseGuards(MakerKeyGuard)
  @ApiSecurity('MakerKey')
  @ApiOperation({ summary: 'Lihat Detail Space Coworking Berdasarkan ID' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const data = await this.spacesService.getById(id, req.makerId);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
