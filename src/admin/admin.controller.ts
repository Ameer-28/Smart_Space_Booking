import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
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
import { AdminService } from './admin.service';
import { UpdateCoworkingProfileDto } from './dto/update-profile.dto';
import { CreateMemberAdminDto, UpdateMemberAdminDto } from './dto/create-member.dto';
import { CreateSpaceDto, UpdateSpaceDto } from './dto/create-space.dto';
import { CreateDiskonDto, UpdateDiskonDto } from './dto/create-diskon.dto';
import { UpdateReservasiStatusDto } from './dto/update-reservasi-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MakerKeyGuard } from '../common/guards/maker-key.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Admin Panel')
@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard, MakerKeyGuard)
@Roles('admin_space')
@ApiBearerAuth('JWT')
@ApiSecurity('MakerKey')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── PROFILE ────────────────────────────────────────────────────────────────

  @Get('profile')
  @ApiOperation({ summary: 'Lihat Data Profil Lokasi Coworking Space' })
  async getProfile(@CurrentUser() user: any) {
    const data = await this.adminService.getProfile(user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.OK, message: 'Berhasil memproses permintaan', data, timestamp: new Date().toISOString() };
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update Data Profil Lokasi Coworking Space' })
  async updateProfile(@Body() dto: UpdateCoworkingProfileDto, @CurrentUser() user: any) {
    const data = await this.adminService.updateProfile(user.spaceOwner.id, dto);
    return { status: true, statusCode: HttpStatus.OK, message: 'Profil Coworking Space berhasil diperbarui!', data, timestamp: new Date().toISOString() };
  }

  // ─── MEMBERS ─────────────────────────────────────────────────────────────────

  @Get('members')
  @ApiOperation({ summary: 'Daftar Semua Member / Pelanggan Coworking' })
  @ApiQuery({ name: 'search', required: false })
  async getMembers(@CurrentUser() user: any, @Query('search') search?: string) {
    const data = await this.adminService.getMembers(user.maker_id, search);
    return { status: true, statusCode: HttpStatus.OK, message: 'Berhasil memproses permintaan', data, timestamp: new Date().toISOString() };
  }

  @Post('members')
  @ApiOperation({ summary: 'Tambah Data Member Baru oleh Admin' })
  async createMember(@Body() dto: CreateMemberAdminDto, @CurrentUser() user: any) {
    const data = await this.adminService.createMember(dto, user.maker_id, user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.CREATED, message: 'Data member baru berhasil ditambahkan!', data, timestamp: new Date().toISOString() };
  }

  @Get('members/:id')
  @ApiOperation({ summary: 'Detail Data Member Berdasarkan ID' })
  async getMemberById(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.adminService.getMemberById(id, user.maker_id);
    return { status: true, statusCode: HttpStatus.OK, message: 'Berhasil memproses permintaan', data, timestamp: new Date().toISOString() };
  }

  @Put('members/:id')
  @ApiOperation({ summary: 'Update Data Member / Pelanggan' })
  async updateMember(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMemberAdminDto, @CurrentUser() user: any) {
    const data = await this.adminService.updateMember(id, dto, user.maker_id);
    return { status: true, statusCode: HttpStatus.OK, message: 'Data member berhasil diperbarui!', data, timestamp: new Date().toISOString() };
  }

  @Delete('members/:id')
  @ApiOperation({ summary: 'Hapus Data Member / Pelanggan' })
  async deleteMember(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.adminService.deleteMember(id, user.maker_id);
    return { status: true, statusCode: HttpStatus.OK, message: 'Data member berhasil dihapus!', data, timestamp: new Date().toISOString() };
  }

  // ─── SPACES ──────────────────────────────────────────────────────────────────

  @Get('spaces')
  @ApiOperation({ summary: 'Daftar Semua Ruangan & Meja Milik Admin' })
  async getSpaces(@CurrentUser() user: any) {
    const data = await this.adminService.getSpaces(user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.OK, message: 'Berhasil memproses permintaan', data, timestamp: new Date().toISOString() };
  }

  @Post('spaces')
  @ApiOperation({ summary: 'Tambah Ruangan / Meja Space Baru' })
  async createSpace(@Body() dto: CreateSpaceDto, @CurrentUser() user: any) {
    const data = await this.adminService.createSpace(dto, user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.CREATED, message: 'Space baru berhasil ditambahkan!', data, timestamp: new Date().toISOString() };
  }

  @Get('spaces/:id')
  @ApiOperation({ summary: 'Detail Data Space Berdasarkan ID' })
  async getSpaceById(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.adminService.getSpaceById(id, user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.OK, message: 'Berhasil memproses permintaan', data, timestamp: new Date().toISOString() };
  }

  @Put('spaces/:id')
  @ApiOperation({ summary: 'Update Data Ruangan & Fasilitas Space' })
  async updateSpace(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSpaceDto, @CurrentUser() user: any) {
    const data = await this.adminService.updateSpace(id, dto, user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.OK, message: 'Data space berhasil diperbarui!', data, timestamp: new Date().toISOString() };
  }

  @Delete('spaces/:id')
  @ApiOperation({ summary: 'Hapus Data Ruangan / Meja Space' })
  async deleteSpace(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.adminService.deleteSpace(id, user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.OK, message: 'Space berhasil dihapus!', data, timestamp: new Date().toISOString() };
  }

  // ─── DISKON ──────────────────────────────────────────────────────────────────

  @Get('diskon')
  @ApiOperation({ summary: 'Daftar Semua Kode Promo / Diskon Event' })
  async getDiskons(@CurrentUser() user: any) {
    const data = await this.adminService.getDiskons(user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.OK, message: 'Berhasil memproses permintaan', data, timestamp: new Date().toISOString() };
  }

  @Post('diskon')
  @ApiOperation({ summary: 'Tambah Kode Promo / Diskon Event Baru' })
  async createDiskon(@Body() dto: CreateDiskonDto, @CurrentUser() user: any) {
    const data = await this.adminService.createDiskon(dto, user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.CREATED, message: 'Kode promo baru berhasil dibuat!', data, timestamp: new Date().toISOString() };
  }

  @Get('diskon/:id')
  @ApiOperation({ summary: 'Detail Data Diskon Berdasarkan ID' })
  async getDiskonById(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.adminService.getDiskonById(id, user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.OK, message: 'Berhasil memproses permintaan', data, timestamp: new Date().toISOString() };
  }

  @Put('diskon/:id')
  @ApiOperation({ summary: 'Update Data Kode Promo & Periode Diskon' })
  async updateDiskon(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDiskonDto, @CurrentUser() user: any) {
    const data = await this.adminService.updateDiskon(id, dto, user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.OK, message: 'Data promo diskon berhasil diperbarui!', data, timestamp: new Date().toISOString() };
  }

  @Delete('diskon/:id')
  @ApiOperation({ summary: 'Hapus Kode Promo / Diskon' })
  async deleteDiskon(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.adminService.deleteDiskon(id, user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.OK, message: 'Kode promo berhasil dihapus!', data, timestamp: new Date().toISOString() };
  }

  // ─── RESERVASI ───────────────────────────────────────────────────────────────

  @Get('reservasi')
  @ApiOperation({ summary: 'Lihat Seluruh Reservasi Coworking (?month, ?year, ?status, ?id_space, ?tanggal)' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan'] })
  @ApiQuery({ name: 'id_space', required: false, type: Number })
  @ApiQuery({ name: 'tanggal', required: false })
  async getReservasis(
    @CurrentUser() user: any,
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Query('status') status?: string,
    @Query('id_space') id_space?: number,
    @Query('tanggal') tanggal?: string,
  ) {
    const data = await this.adminService.getReservasis(
      user.spaceOwner.id,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
      status,
      id_space ? Number(id_space) : undefined,
      tanggal,
    );
    return { status: true, statusCode: HttpStatus.OK, message: 'Berhasil memproses permintaan', data, timestamp: new Date().toISOString() };
  }

  @Patch('reservasi/:id/status')
  @ApiOperation({ summary: 'Konfirmasi & Ubah Status Pemesanan (disetujui, dibatalkan, dll)' })
  async updateReservasiStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservasiStatusDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.adminService.updateReservasiStatus(id, dto, user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.OK, message: `Status reservasi berhasil diperbarui menjadi ${dto.status}`, data, timestamp: new Date().toISOString() };
  }

  @Post('reservasi/:id/check-in')
  @ApiOperation({ summary: 'Check-In Pelanggan (Status Berubah ke Aktif/Digunakan)' })
  async checkIn(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.adminService.checkIn(id, user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.OK, message: 'Check-in member berhasil! Status reservasi aktif.', data, timestamp: new Date().toISOString() };
  }

  @Post('reservasi/:id/check-out')
  @ApiOperation({ summary: 'Check-Out Pelanggan (Status Berubah ke Selesai)' })
  async checkOut(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.adminService.checkOut(id, user.spaceOwner.id);
    return { status: true, statusCode: HttpStatus.OK, message: 'Check-out member berhasil! Reservasi telah selesai.', data, timestamp: new Date().toISOString() };
  }

  // ─── REPORTS ─────────────────────────────────────────────────────────────────

  @Get('reports/monthly')
  @ApiOperation({ summary: 'Rekapitulasi Estimasi & Realisasi Pendapatan Per Bulan' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getMonthlyReport(
    @CurrentUser() user: any,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    const data = await this.adminService.getMonthlyReport(
      user.spaceOwner.id,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
    return { status: true, statusCode: HttpStatus.OK, message: 'Berhasil memproses permintaan', data, timestamp: new Date().toISOString() };
  }

  @Get('reports/income')
  @ApiOperation({ summary: 'Alias Rekapitulasi Pendapatan Bulanan' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getIncome(
    @CurrentUser() user: any,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    const report = await this.adminService.getMonthlyReport(
      user.spaceOwner.id,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data: {
        month: report.month,
        year: report.year,
        realisasi_pendapatan_bersih: report.realisasi_pendapatan_bersih,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
