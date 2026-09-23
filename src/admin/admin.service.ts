import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCoworkingProfileDto } from './dto/update-profile.dto';
import { CreateMemberAdminDto, UpdateMemberAdminDto } from './dto/create-member.dto';
import { CreateSpaceDto, UpdateSpaceDto } from './dto/create-space.dto';
import { CreateDiskonDto, UpdateDiskonDto } from './dto/create-diskon.dto';
import { UpdateReservasiStatusDto } from './dto/update-reservasi-status.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── PROFILE ───────────────────────────────────────────────────────────────

  async getProfile(ownerId: number) {
    const owner = await this.prisma.spaceOwner.findUnique({
      where: { id: ownerId },
      select: { id: true, nama_coworking: true, nama_pemilik: true, telp: true, alamat: true, deskripsi: true },
    });
    if (!owner) throw new NotFoundException('Profil tidak ditemukan!');
    return owner;
  }

  async updateProfile(ownerId: number, dto: UpdateCoworkingProfileDto) {
    const owner = await this.prisma.spaceOwner.update({
      where: { id: ownerId },
      data: {
        nama_coworking: dto.nama_coworking,
        nama_pemilik: dto.nama_pemilik,
        telp: dto.telp,
        alamat: dto.alamat,
        deskripsi: dto.deskripsi,
      },
      select: { id: true, nama_coworking: true, nama_pemilik: true, telp: true, alamat: true },
    });
    return owner;
  }

  // ─── MEMBERS ───────────────────────────────────────────────────────────────

  async getMembers(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { nama_member: { contains: search, mode: 'insensitive' } },
        { instansi: { contains: search, mode: 'insensitive' } },
        { telp: { contains: search } },
      ];
    }
    const members = await this.prisma.member.findMany({
      where,
      select: {
        id: true,
        nama_member: true,
        instansi: true,
        alamat: true,
        telp: true,
        foto: true,
        created_at: true,
      },
      orderBy: { id: 'asc' },
    });
    return members.map((m) => this.formatMember(m));
  }

  async createMember(dto: CreateMemberAdminDto) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existing) throw new BadRequestException('Username sudah digunakan!');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        role: 'member',
        member: {
          create: {
            nama_member: dto.nama_member,
            instansi: dto.instansi,
            alamat: dto.alamat,
            telp: dto.telp,
            foto: dto.foto || null,
          },
        },
      },
      include: { member: true },
    });

    return this.formatMember(user.member);
  }

  async getMemberById(id: number) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      select: {
        id: true,
        nama_member: true,
        instansi: true,
        alamat: true,
        telp: true,
        foto: true,
        created_at: true,
      },
    });
    if (!member) throw new NotFoundException('Member tidak ditemukan!');
    return this.formatMember(member);
  }

  async updateMember(id: number, dto: UpdateMemberAdminDto) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!member) throw new NotFoundException('Member tidak ditemukan!');

    const memberUpdate: any = {};
    if (dto.nama_member) memberUpdate.nama_member = dto.nama_member;
    if (dto.instansi) memberUpdate.instansi = dto.instansi;
    if (dto.alamat) memberUpdate.alamat = dto.alamat;
    if (dto.telp) memberUpdate.telp = dto.telp;
    if (dto.foto) memberUpdate.foto = dto.foto;

    const updated = await this.prisma.member.update({
      where: { id },
      data: memberUpdate,
      select: { id: true, nama_member: true, instansi: true, alamat: true, telp: true, foto: true, created_at: true },
    });

    // Update password jika ada
    if (dto.password) {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      await this.prisma.user.update({
        where: { id: member.id_user },
        data: { password: hashedPassword },
      });
    }

    return this.formatMember(updated);
  }

  async deleteMember(id: number) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!member) throw new NotFoundException('Member tidak ditemukan!');

    // Hapus user (cascade ke member)
    await this.prisma.user.delete({ where: { id: member.id_user } });
    return { id, deleted: true };
  }

  // ─── SPACES ────────────────────────────────────────────────────────────────

  async getSpaces(ownerId: number) {
    const spaces = await this.prisma.space.findMany({
      where: { id_owner: ownerId },
      orderBy: { id: 'asc' },
    });
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return spaces.map((s) => ({
      ...s,
      foto_url: s.foto ? `${baseUrl}/uploads/spaces/${s.foto}` : null,
    }));
  }

  async createSpace(dto: CreateSpaceDto, ownerId: number) {
    const space = await this.prisma.space.create({
      data: {
        nama_space: dto.nama_space,
        harga_per_jam: dto.harga_per_jam,
        tipe: dto.tipe as any,
        kapasitas: dto.kapasitas,
        deskripsi: dto.deskripsi,
        foto: dto.foto || null,
        id_owner: ownerId,
      },
    });
    return space;
  }

  async getSpaceById(id: number, ownerId: number) {
    const space = await this.prisma.space.findFirst({
      where: { id, id_owner: ownerId },
    });
    if (!space) throw new NotFoundException('Space tidak ditemukan!');
    return space;
  }

  async updateSpace(id: number, dto: UpdateSpaceDto, ownerId: number) {
    const space = await this.prisma.space.findFirst({ where: { id, id_owner: ownerId } });
    if (!space) throw new NotFoundException('Space tidak ditemukan!');

    return this.prisma.space.update({
      where: { id },
      data: {
        ...(dto.nama_space && { nama_space: dto.nama_space }),
        ...(dto.harga_per_jam && { harga_per_jam: dto.harga_per_jam }),
        ...(dto.tipe && { tipe: dto.tipe as any }),
        ...(dto.kapasitas && { kapasitas: dto.kapasitas }),
        ...(dto.deskripsi && { deskripsi: dto.deskripsi }),
        ...(dto.foto && { foto: dto.foto }),
      },
    });
  }

  async deleteSpace(id: number, ownerId: number) {
    const space = await this.prisma.space.findFirst({ where: { id, id_owner: ownerId } });
    if (!space) throw new NotFoundException('Space tidak ditemukan!');
    await this.prisma.space.delete({ where: { id } });
    return { id, deleted: true };
  }

  // ─── DISKON ─────────────────────────────────────────────────────────────────

  async getDiskons(ownerId: number) {
    return this.prisma.diskon.findMany({
      where: { id_owner: ownerId },
      orderBy: { id: 'asc' },
    });
  }

  async createDiskon(dto: CreateDiskonDto, ownerId: number) {
    // Cek duplikasi nama_diskon per owner
    const existing = await this.prisma.diskon.findFirst({
      where: {
        nama_diskon: { equals: dto.nama_diskon, mode: 'insensitive' },
        id_owner: ownerId,
      },
    });
    if (existing) {
      throw new BadRequestException(`Kode promo '${dto.nama_diskon}' sudah terdaftar!`);
    }

    return this.prisma.diskon.create({
      data: {
        nama_diskon: dto.nama_diskon.toUpperCase(),
        persentase_diskon: dto.persentase_diskon,
        tanggal_awal: new Date(dto.tanggal_awal),
        tanggal_akhir: new Date(dto.tanggal_akhir),
        id_owner: ownerId,
      },
    });
  }

  async getDiskonById(id: number, ownerId: number) {
    const diskon = await this.prisma.diskon.findFirst({ where: { id, id_owner: ownerId } });
    if (!diskon) throw new NotFoundException('Diskon tidak ditemukan!');
    return diskon;
  }

  async updateDiskon(id: number, dto: UpdateDiskonDto, ownerId: number) {
    const diskon = await this.prisma.diskon.findFirst({ where: { id, id_owner: ownerId } });
    if (!diskon) throw new NotFoundException('Diskon tidak ditemukan!');

    return this.prisma.diskon.update({
      where: { id },
      data: {
        ...(dto.nama_diskon && { nama_diskon: dto.nama_diskon }),
        ...(dto.persentase_diskon && { persentase_diskon: dto.persentase_diskon }),
        ...(dto.tanggal_awal && { tanggal_awal: new Date(dto.tanggal_awal) }),
        ...(dto.tanggal_akhir && { tanggal_akhir: new Date(dto.tanggal_akhir) }),
      },
    });
  }

  async deleteDiskon(id: number, ownerId: number) {
    const diskon = await this.prisma.diskon.findFirst({ where: { id, id_owner: ownerId } });
    if (!diskon) throw new NotFoundException('Diskon tidak ditemukan!');
    await this.prisma.diskon.delete({ where: { id } });
    return { id, deleted: true };
  }

  // ─── RESERVASI ──────────────────────────────────────────────────────────────

  async getReservasis(
    ownerId: number,
    month?: number,
    year?: number,
    status?: string,
    id_space?: number,
    tanggal?: string,
  ) {
    const where: any = { id_owner: ownerId };

    if (status) where.status = status;
    if (id_space) where.detail = { id_space };
    if (tanggal) where.tanggal_reservasi = new Date(tanggal);

    if (month || year) {
      const now = new Date();
      const m = month || now.getMonth() + 1;
      const y = year || now.getFullYear();
      where.tanggal_reservasi = {
        gte: new Date(y, m - 1, 1),
        lte: new Date(y, m, 0, 23, 59, 59),
      };
    }

    const reservasis = await this.prisma.reservasi.findMany({
      where,
      include: {
        member: { select: { id: true, nama_member: true, telp: true } },
        detail: {
          include: {
            space: { select: { id: true, nama_space: true, tipe: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return reservasis.map((r) => ({
      id: r.id,
      kode_booking: r.kode_booking,
      tanggal_reservasi: this.formatDate(r.tanggal_reservasi),
      jam_mulai: r.jam_mulai,
      jam_selesai: r.jam_selesai,
      durasi_jam: r.durasi_jam,
      total_harga_awal: r.detail?.total_harga_awal,
      potongan_diskon: r.detail?.potongan_diskon,
      total_bayar: r.detail?.total_bayar,
      status: r.status,
      member: r.member,
      space: r.detail?.space,
    }));
  }

  async updateReservasiStatus(id: number, dto: UpdateReservasiStatusDto, ownerId: number) {
    const reservasi = await this.prisma.reservasi.findFirst({
      where: { id, id_owner: ownerId },
    });
    if (!reservasi) throw new NotFoundException('Reservasi tidak ditemukan!');

    const updated = await this.prisma.reservasi.update({
      where: { id },
      data: { status: dto.status as any },
    });

    return {
      id: updated.id,
      status: updated.status,
      updated_at: updated.updated_at,
    };
  }

  async checkIn(id: number, ownerId: number) {
    const reservasi = await this.prisma.reservasi.findFirst({
      where: { id, id_owner: ownerId },
    });
    if (!reservasi) throw new NotFoundException('Reservasi tidak ditemukan!');
    if (reservasi.status !== 'disetujui') {
      throw new BadRequestException('Check-in hanya dapat dilakukan pada reservasi yang sudah disetujui!');
    }

    const updated = await this.prisma.reservasi.update({
      where: { id },
      data: { status: 'aktif', check_in_time: new Date() },
    });

    return {
      id: updated.id,
      status: updated.status,
      check_in_time: updated.check_in_time,
    };
  }

  async checkOut(id: number, ownerId: number) {
    const reservasi = await this.prisma.reservasi.findFirst({
      where: { id, id_owner: ownerId },
    });
    if (!reservasi) throw new NotFoundException('Reservasi tidak ditemukan!');
    if (reservasi.status !== 'aktif') {
      throw new BadRequestException('Check-out hanya dapat dilakukan pada reservasi yang sedang aktif!');
    }

    const updated = await this.prisma.reservasi.update({
      where: { id },
      data: { status: 'selesai', check_out_time: new Date() },
    });

    return {
      id: updated.id,
      status: updated.status,
      check_out_time: updated.check_out_time,
    };
  }

  // ─── REPORTS ────────────────────────────────────────────────────────────────

  async getMonthlyReport(ownerId: number, month?: number, year?: number) {
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const reservasis = await this.prisma.reservasi.findMany({
      where: {
        id_owner: ownerId,
        tanggal_reservasi: { gte: startDate, lte: endDate },
        status: { in: ['selesai', 'aktif', 'disetujui'] },
      },
      include: {
        detail: { include: { space: true } },
      },
    });

    const total_transaksi = reservasis.length;
    const total_jam_terpakai = reservasis.reduce((sum, r) => sum + r.durasi_jam, 0);
    const estimasi_pendapatan_kotor = reservasis.reduce(
      (sum, r) => sum + (r.detail?.total_harga_awal || 0),
      0,
    );
    const total_potongan_diskon = reservasis.reduce(
      (sum, r) => sum + (r.detail?.potongan_diskon || 0),
      0,
    );
    const realisasi_pendapatan_bersih = reservasis.reduce(
      (sum, r) => sum + (r.detail?.total_bayar || 0),
      0,
    );

    // Rincian per tipe space
    const tipeMap: Record<string, any> = {
      desk: { tipe: 'desk', label: 'Personal Desk', total_booking: 0, total_jam: 0, total_pendapatan: 0 },
      meeting_room: { tipe: 'meeting_room', label: 'Meeting Room', total_booking: 0, total_jam: 0, total_pendapatan: 0 },
      private_office: { tipe: 'private_office', label: 'Private Office', total_booking: 0, total_jam: 0, total_pendapatan: 0 },
    };

    reservasis.forEach((r) => {
      const tipe = r.detail?.space?.tipe;
      if (tipe && tipeMap[tipe]) {
        tipeMap[tipe].total_booking += 1;
        tipeMap[tipe].total_jam += r.durasi_jam;
        tipeMap[tipe].total_pendapatan += r.detail?.total_bayar || 0;
      }
    });

    return {
      month: m,
      year: y,
      total_transaksi,
      total_jam_terpakai,
      estimasi_pendapatan_kotor,
      total_potongan_diskon,
      realisasi_pendapatan_bersih,
      rincian_per_tipe_space: Object.values(tipeMap),
    };
  }

  private formatMember(member: any) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return {
      ...member,
      foto_url: member.foto ? `${baseUrl}/uploads/members/${member.foto}` : null,
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
