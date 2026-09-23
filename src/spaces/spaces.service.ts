import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpacesService {
  constructor(private prisma: PrismaService) {}

  getTypes() {
    return [
      {
        tipe: 'desk',
        label: 'Personal Desk',
        deskripsi:
          'Meja kerja individual yang nyaman dengan fasilitas colokan listrik, WiFi kencang, dan air minum.',
      },
      {
        tipe: 'meeting_room',
        label: 'Meeting Room',
        deskripsi:
          'Ruang rapat tertutup dengan fasilitas proyektor/TV LED, whiteboard, sound system, dan AC dingin.',
      },
      {
        tipe: 'private_office',
        label: 'Private Office',
        deskripsi:
          'Ruang kantor privat eksklusif untuk tim kecil hingga menengah dengan akses fleksibel dan keamanan 24 jam.',
      },
    ];
  }

  async getAll(tipe?: string, search?: string) {
    const where: any = {};

    if (tipe) {
      where.tipe = tipe;
    }

    if (search) {
      where.OR = [
        { nama_space: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } },
      ];
    }

    const spaces = await this.prisma.space.findMany({
      where,
      include: {
        owner: {
          select: {
            nama_coworking: true,
            nama_pemilik: true,
            telp: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return spaces.map((s) => this.formatSpace(s));
  }

  async getById(id: number) {
    const space = await this.prisma.space.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            nama_coworking: true,
            nama_pemilik: true,
            telp: true,
          },
        },
      },
    });

    if (!space) {
      throw new NotFoundException('Space dengan ID tersebut tidak ditemukan!');
    }

    return this.formatSpace(space);
  }

  validasiTanggalDanWaktu(tanggal: string, jam_mulai: string): void {
    if (!tanggal) {
      throw new BadRequestException('Tanggal reservasi wajib diisi!');
    }
    if (!jam_mulai) {
      throw new BadRequestException('Jam mulai reservasi wajib diisi!');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(tanggal)) {
      throw new BadRequestException('Format tanggal harus YYYY-MM-DD (contoh: 2026-08-30)!');
    }

    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(jam_mulai)) {
      throw new BadRequestException('Format jam_mulai harus HH:mm (contoh: 09:00)!');
    }

    const [year, month, day] = tanggal.split('-').map(Number);
    const [hour, minute] = jam_mulai.split(':').map(Number);

    const targetDate = new Date(year, month - 1, day);
    if (
      targetDate.getFullYear() !== year ||
      targetDate.getMonth() !== month - 1 ||
      targetDate.getDate() !== day
    ) {
      throw new BadRequestException('Tanggal reservasi tidak valid!');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (targetDate < today) {
      throw new BadRequestException('Tanggal reservasi tidak boleh tanggal yang sudah lewat!');
    }

    if (targetDate.getTime() === today.getTime()) {
      const targetDateTime = new Date(year, month - 1, day, hour, minute, 0, 0);
      if (targetDateTime <= now) {
        throw new BadRequestException('Jam mulai reservasi sudah lewat untuk hari ini!');
      }
    }
  }

  async checkAvailability(
    id_space: number,
    tanggal: string,
    jam_mulai: string,
    durasi_jam: number,
  ) {
    if (!durasi_jam || durasi_jam < 1) {
      throw new BadRequestException('Durasi reservasi minimal 1 jam!');
    }

    this.validasiTanggalDanWaktu(tanggal, jam_mulai);

    const space = await this.prisma.space.findUnique({
      where: { id: id_space },
    });

    if (!space) {
      throw new NotFoundException('Space tidak ditemukan!');
    }

    const jam_selesai = this.hitungJamSelesai(jam_mulai, durasi_jam);

    const conflict = await this.cekKonflik(
      id_space,
      tanggal,
      jam_mulai,
      jam_selesai,
    );

    if (conflict) {
      throw new BadRequestException(
        'Maaf, space sudah terisi atau dibooking pada jam tersebut!',
      );
    }

    return {
      available: true,
      id_space: space.id,
      nama_space: space.nama_space,
      tanggal,
      jam_mulai,
      jam_selesai,
      durasi_jam,
      harga_per_jam: space.harga_per_jam,
      estimasi_total: space.harga_per_jam * durasi_jam,
    };
  }

  async cekKonflik(
    id_space: number,
    tanggal: string,
    jam_mulai: string,
    jam_selesai: string,
    excludeReservasiId?: number,
  ): Promise<boolean> {
    const tanggalDate = new Date(tanggal);

    const where: any = {
      detail: {
        id_space,
      },
      tanggal_reservasi: tanggalDate,
      status: { in: ['belum_dikonfirm', 'disetujui', 'aktif'] },
      AND: [
        { jam_mulai: { lt: jam_selesai } },
        { jam_selesai: { gt: jam_mulai } },
      ],
    };

    if (excludeReservasiId) {
      where.id = { not: excludeReservasiId };
    }

    const count = await this.prisma.reservasi.count({ where });
    return count > 0;
  }

  hitungJamSelesai(jam_mulai: string, durasi_jam: number): string {
    const [hours, minutes] = jam_mulai.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durasi_jam * 60;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  private formatSpace(space: any) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return {
      ...space,
      foto_url: space.foto
        ? `${baseUrl}/uploads/spaces/${space.foto}`
        : null,
    };
  }
}
