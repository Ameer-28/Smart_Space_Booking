import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SpacesService } from '../spaces/spaces.service';
import { CreateReservasiDto } from './dto/create-reservasi.dto';
import * as QRCode from 'qrcode';

@Injectable()
export class ReservasiService {
  constructor(
    private prisma: PrismaService,
    private spacesService: SpacesService,
  ) {}

  async create(dto: CreateReservasiDto, memberId: number, makerId: number) {
    // 1. Validasi space
    const ownerIds = await this.spacesService.getOwnerIdsByMaker(makerId);
    const space = await this.prisma.space.findFirst({
      where: { id: dto.id_space, id_owner: { in: ownerIds } },
    });
    if (!space) {
      throw new NotFoundException('Space tidak ditemukan!');
    }

    // 2. Hitung jam selesai
    const jam_selesai = this.spacesService.hitungJamSelesai(
      dto.jam_mulai,
      dto.durasi_jam,
    );

    // 3. Cek ketersediaan
    const conflict = await this.spacesService.cekKonflik(
      dto.id_space,
      dto.tanggal_reservasi,
      dto.jam_mulai,
      jam_selesai,
    );
    if (conflict) {
      throw new BadRequestException(
        'Space tidak tersedia pada tanggal dan rentang jam tersebut!',
      );
    }

    // 4. Resolusi diskon
    let diskon = null;
    if (dto.id_diskon) {
      diskon = await this.prisma.diskon.findFirst({
        where: {
          id: dto.id_diskon,
          id_owner: { in: ownerIds },
          tanggal_awal: { lte: new Date() },
          tanggal_akhir: { gte: new Date() },
        },
      });
      if (!diskon) {
        throw new BadRequestException('Diskon tidak valid atau sudah kedaluwarsa!');
      }
    } else if (dto.kode_promo) {
      diskon = await this.prisma.diskon.findFirst({
        where: {
          nama_diskon: { equals: dto.kode_promo, mode: 'insensitive' },
          id_owner: { in: ownerIds },
          tanggal_awal: { lte: new Date() },
          tanggal_akhir: { gte: new Date() },
        },
      });
      if (!diskon) {
        throw new BadRequestException('Kode promo tidak ditemukan atau sudah kedaluwarsa!');
      }
    }

    // 5. Hitung harga
    const harga_per_jam = space.harga_per_jam;
    const total_harga_awal = harga_per_jam * dto.durasi_jam;
    const potongan_diskon = diskon
      ? (total_harga_awal * diskon.persentase_diskon) / 100
      : 0;
    const total_bayar = total_harga_awal - potongan_diskon;

    // 6. Generate kode booking — count per owner agar unik dan terisolasi per maker
    const dateStr = dto.tanggal_reservasi.replace(/-/g, '');
    const countPerOwner = await this.prisma.reservasi.count({
      where: { id_owner: space.id_owner },
    });
    const kode_booking = `BOOK-${dateStr}-${String(countPerOwner + 1).padStart(4, '0')}`;

    // 7. Dapatkan owner
    const owner = await this.prisma.spaceOwner.findUnique({
      where: { id: space.id_owner },
      include: { user: { select: { maker: { select: { app_key: true } } } } },
    });

    // 8. Buat reservasi
    const reservasi = await this.prisma.reservasi.create({
      data: {
        kode_booking,
        tanggal_reservasi: new Date(dto.tanggal_reservasi),
        jam_mulai: dto.jam_mulai,
        jam_selesai,
        durasi_jam: dto.durasi_jam,
        id_owner: space.id_owner,
        id_member: memberId,
        status: 'belum_dikonfirm',
        detail: {
          create: {
            id_space: dto.id_space,
            id_diskon: diskon?.id || null,
            harga_per_jam,
            total_harga_awal,
            potongan_diskon,
            total_bayar,
          },
        },
      },
      include: { detail: true },
    });

    return {
      id: reservasi.id,
      kode_booking: reservasi.kode_booking,
      id_member: reservasi.id_member,
      id_space: reservasi.detail.id_space,
      id_diskon: reservasi.detail.id_diskon,
      tanggal_reservasi: this.formatDate(reservasi.tanggal_reservasi),
      jam_mulai: reservasi.jam_mulai,
      jam_selesai: reservasi.jam_selesai,
      durasi_jam: reservasi.durasi_jam,
      harga_per_jam: reservasi.detail.harga_per_jam,
      total_harga_awal: reservasi.detail.total_harga_awal,
      potongan_diskon: reservasi.detail.potongan_diskon,
      total_bayar: reservasi.detail.total_bayar,
      status: reservasi.status,
      created_at: reservasi.created_at,
    };
  }

  async getMy(memberId: number) {
    const reservasis = await this.prisma.reservasi.findMany({
      where: { id_member: memberId },
      include: {
        detail: { include: { space: { select: { id: true, nama_space: true, tipe: true } } } },
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
      total_bayar: r.detail?.total_bayar,
      status: r.status,
      space: r.detail?.space
        ? {
            id: r.detail.space.id,
            nama_space: r.detail.space.nama_space,
            tipe: r.detail.space.tipe,
          }
        : null,
    }));
  }

  async getMyHistory(memberId: number, month?: number, year?: number) {
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const reservasis = await this.prisma.reservasi.findMany({
      where: {
        id_member: memberId,
        tanggal_reservasi: { gte: startDate, lte: endDate },
      },
      include: {
        detail: { include: { space: { select: { nama_space: true } } } },
      },
      orderBy: { tanggal_reservasi: 'desc' },
    });

    const total_pengeluaran = reservasis.reduce(
      (sum, r) => sum + (r.detail?.total_bayar || 0),
      0,
    );

    return {
      month: m,
      year: y,
      total_reservasi: reservasis.length,
      total_pengeluaran,
      items: reservasis.map((r) => ({
        id: r.id,
        kode_booking: r.kode_booking,
        tanggal_reservasi: this.formatDate(r.tanggal_reservasi),
        jam_mulai: r.jam_mulai,
        jam_selesai: r.jam_selesai,
        durasi_jam: r.durasi_jam,
        total_bayar: r.detail?.total_bayar,
        status: r.status,
        space_name: r.detail?.space?.nama_space,
      })),
    };
  }

  async getETicket(id: number, memberId: number, role: string) {
    const reservasi = await this.prisma.reservasi.findUnique({
      where: { id },
      include: {
        member: true,
        owner: {
          include: {
            user: { select: { maker: { select: { app_key: true } } } },
          },
        },
        detail: { include: { space: true, diskon: true } },
      },
    });

    if (!reservasi) throw new NotFoundException('Reservasi tidak ditemukan!');

    // Validasi akses: member hanya bisa lihat miliknya
    if (role === 'member' && reservasi.id_member !== memberId) {
      throw new ForbiddenException('Akses ditolak!');
    }

    const appKey = reservasi.owner?.user?.maker?.app_key || '';
    // Format sesuai contoh soal: VERIFY-RESERVASI-{id}-{app_key}
    const qrPayload = `VERIFY-RESERVASI-${reservasi.id}-${appKey}`;

    return {
      e_ticket_number: `TICKET-${reservasi.owner.nama_coworking.replace(/\s+/g, '').substring(0, 6).toUpperCase()}-${this.formatDate(reservasi.tanggal_reservasi).replace(/-/g, '')}-${String(reservasi.id).padStart(4, '0')}`,
      kode_booking: reservasi.kode_booking,
      coworking_space: {
        nama: reservasi.owner.nama_coworking,
        telepon: reservasi.owner.telp,
      },
      member: {
        nama: reservasi.member.nama_member,
        instansi: reservasi.member.instansi,
        telp: reservasi.member.telp,
      },
      space: {
        nama: reservasi.detail?.space?.nama_space,
        tipe: reservasi.detail?.space?.tipe,
        harga_per_jam: reservasi.detail?.harga_per_jam,
      },
      jadwal: {
        tanggal: this.formatDate(reservasi.tanggal_reservasi),
        jam_mulai: reservasi.jam_mulai,
        jam_selesai: reservasi.jam_selesai,
        durasi: `${reservasi.durasi_jam} Jam`,
      },
      rincian_pembayaran: {
        tarif_kotor: reservasi.detail?.total_harga_awal,
        diskon_promo: reservasi.detail?.diskon
          ? `${reservasi.detail.diskon.persentase_diskon}% (${reservasi.detail.diskon.nama_diskon})`
          : 'Tidak ada',
        potongan: reservasi.detail?.potongan_diskon,
        total_dibayar: reservasi.detail?.total_bayar,
      },
      status_reservasi: reservasi.status,
      qr_code_payload: qrPayload,
    };
  }

  async getById(id: number, userId: number, role: string) {
    const reservasi = await this.prisma.reservasi.findUnique({
      where: { id },
      include: {
        member: { select: { nama_member: true, telp: true } },
        detail: {
          include: {
            space: { select: { nama_space: true, harga_per_jam: true } },
          },
        },
      },
    });

    if (!reservasi) throw new NotFoundException('Reservasi tidak ditemukan!');

    if (role === 'member' && reservasi.id_member !== userId) {
      throw new ForbiddenException('Akses ditolak!');
    }

    return {
      id: reservasi.id,
      kode_booking: reservasi.kode_booking,
      id_member: reservasi.id_member,
      id_space: reservasi.detail?.id_space,
      tanggal_reservasi: this.formatDate(reservasi.tanggal_reservasi),
      jam_mulai: reservasi.jam_mulai,
      jam_selesai: reservasi.jam_selesai,
      durasi_jam: reservasi.durasi_jam,
      total_bayar: reservasi.detail?.total_bayar,
      status: reservasi.status,
      member: reservasi.member,
      space: reservasi.detail?.space,
    };
  }

  async cancel(id: number, memberId: number) {
    const reservasi = await this.prisma.reservasi.findUnique({ where: { id } });
    if (!reservasi) throw new NotFoundException('Reservasi tidak ditemukan!');
    if (reservasi.id_member !== memberId) throw new ForbiddenException('Akses ditolak!');
    if (['selesai', 'dibatalkan', 'aktif'].includes(reservasi.status)) {
      throw new BadRequestException(
        'Reservasi tidak dapat dibatalkan pada status ini!',
      );
    }

    const updated = await this.prisma.reservasi.update({
      where: { id },
      data: { status: 'dibatalkan' },
    });

    return {
      id: updated.id,
      status: updated.status,
      updated_at: updated.updated_at,
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
