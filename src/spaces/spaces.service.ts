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

  async getAll(makerId: number, tipe?: string, search?: string) {
    const ownerIds = await this.getOwnerIdsByMaker(makerId);

    const where: any = {
      id_owner: { in: ownerIds },
    };

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

  async getById(id: number, makerId: number) {
    const ownerIds = await this.getOwnerIdsByMaker(makerId);
    const space = await this.prisma.space.findFirst({
      where: { id, id_owner: { in: ownerIds } },
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

  async checkAvailability(
    makerId: number,
    id_space: number,
    tanggal: string,
    jam_mulai: string,
    durasi_jam: number,
  ) {
    const ownerIds = await this.getOwnerIdsByMaker(makerId);
    const space = await this.prisma.space.findFirst({
      where: { id: id_space, id_owner: { in: ownerIds } },
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

  async getOwnerIdsByMaker(makerId: number): Promise<number[]> {
    const owners = await this.prisma.spaceOwner.findMany({
      where: { user: { maker_id: makerId } },
      select: { id: true },
    });
    return owners.map((o) => o.id);
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
