import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterMakerDto } from './dto/register-maker.dto';
import { LoginMakerDto } from './dto/login-maker.dto';

@Injectable()
export class MakerService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterMakerDto) {
    const existing = await this.prisma.appMaker.findFirst({
      where: {
        OR: [{ username: dto.username }, { email: dto.email }],
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Username atau Email sudah terdaftar sebagai App Maker!',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const appKey = 'mk_' + uuidv4().replace(/-/g, '');

    const maker = await this.prisma.appMaker.create({
      data: {
        name: dto.name,
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        app_key: appKey,
      },
    });

    const access_token = this.generateToken(maker);

    return {
      id: maker.id,
      name: maker.name,
      username: maker.username,
      email: maker.email,
      app_key: maker.app_key,
      created_at: maker.created_at,
      updated_at: maker.updated_at,
      access_token,
    };
  }

  async login(dto: LoginMakerDto) {
    const maker = await this.prisma.appMaker.findFirst({
      where: {
        OR: [
          { username: dto.usernameOrEmail },
          { email: dto.usernameOrEmail },
        ],
      },
    });

    if (!maker) {
      throw new UnauthorizedException('Kredensial login App Maker salah!');
    }

    const isMatch = await bcrypt.compare(dto.password, maker.password);
    if (!isMatch) {
      throw new UnauthorizedException('Kredensial login App Maker salah!');
    }

    const access_token = this.generateToken(maker);

    return {
      id: maker.id,
      name: maker.name,
      username: maker.username,
      email: maker.email,
      app_key: maker.app_key,
      access_token,
    };
  }

  async getMe(makerId: number) {
    const maker = await this.prisma.appMaker.findUnique({
      where: { id: makerId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        app_key: true,
        created_at: true,
      },
    });
    return maker;
  }

  async getStats(makerId: number) {
    const [members, spaces, diskons, reservasis] = await Promise.all([
      this.prisma.member.count({
        where: { user: { maker_id: makerId } },
      }),
      this.prisma.space.count({
        where: { owner: { user: { maker_id: makerId } } },
      }),
      this.prisma.diskon.count({
        where: { id_owner: { in: await this.getOwnerIdsByMaker(makerId) } },
      }),
      this.prisma.reservasi.count({
        where: { id_owner: { in: await this.getOwnerIdsByMaker(makerId) } },
      }),
    ]);

    const pendapatanResult = await this.prisma.detailReservasi.aggregate({
      _sum: { total_bayar: true },
      where: {
        reservasi: {
          id_owner: { in: await this.getOwnerIdsByMaker(makerId) },
          status: 'selesai',
        },
      },
    });

    return {
      total_members: members,
      total_spaces: spaces,
      total_diskon: diskons,
      total_reservasi: reservasis,
      total_pendapatan: pendapatanResult._sum.total_bayar || 0,
    };
  }

  async getList() {
    return this.prisma.appMaker.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        app_key: true,
        created_at: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  private async getOwnerIdsByMaker(makerId: number): Promise<number[]> {
    const owners = await this.prisma.spaceOwner.findMany({
      where: { user: { maker_id: makerId } },
      select: { id: true },
    });
    return owners.map((o) => o.id);
  }

  private generateToken(maker: any): string {
    return this.jwtService.sign({
      sub: maker.id,
      username: maker.username,
      type: 'maker',
    });
  }
}
