import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiskonService {
  constructor(private prisma: PrismaService) {}

  async getActive() {
    const now = new Date();

    return this.prisma.diskon.findMany({
      where: {
        tanggal_awal: { lte: now },
        tanggal_akhir: { gte: now },
      },
      select: {
        id: true,
        nama_diskon: true,
        persentase_diskon: true,
        tanggal_awal: true,
        tanggal_akhir: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  async checkPromo(nama_diskon: string) {
    const now = new Date();

    const diskon = await this.prisma.diskon.findFirst({
      where: {
        nama_diskon: { equals: nama_diskon, mode: 'insensitive' },
        tanggal_awal: { lte: now },
        tanggal_akhir: { gte: now },
      },
    });

    if (!diskon) {
      throw new BadRequestException(
        'Kode promo tidak ditemukan atau sudah kedaluwarsa!',
      );
    }

    return {
      id: diskon.id,
      nama_diskon: diskon.nama_diskon,
      persentase_diskon: diskon.persentase_diskon,
      tanggal_awal: diskon.tanggal_awal,
      tanggal_akhir: diskon.tanggal_akhir,
      is_active: true,
    };
  }

  async getById(id: number) {
    const diskon = await this.prisma.diskon.findUnique({
      where: { id },
      select: {
        id: true,
        nama_diskon: true,
        persentase_diskon: true,
        tanggal_awal: true,
        tanggal_akhir: true,
      },
    });

    if (!diskon) {
      throw new NotFoundException('Diskon dengan ID tersebut tidak ditemukan!');
    }

    return diskon;
  }
}
