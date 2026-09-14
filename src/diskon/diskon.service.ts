import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiskonService {
  constructor(private prisma: PrismaService) {}

  async getActive(makerId: number) {
    const ownerIds = await this.getOwnerIdsByMaker(makerId);
    const now = new Date();

    return this.prisma.diskon.findMany({
      where: {
        id_owner: { in: ownerIds },
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

  async checkPromo(nama_diskon: string, makerId: number) {
    const ownerIds = await this.getOwnerIdsByMaker(makerId);
    const now = new Date();

    const diskon = await this.prisma.diskon.findFirst({
      where: {
        nama_diskon: { equals: nama_diskon, mode: 'insensitive' },
        id_owner: { in: ownerIds },
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

  async getById(id: number, makerId: number) {
    const ownerIds = await this.getOwnerIdsByMaker(makerId);
    const diskon = await this.prisma.diskon.findFirst({
      where: { id, id_owner: { in: ownerIds } },
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

  private async getOwnerIdsByMaker(makerId: number): Promise<number[]> {
    const owners = await this.prisma.spaceOwner.findMany({
      where: { user: { maker_id: makerId } },
      select: { id: true },
    });
    return owners.map((o) => o.id);
  }
}
