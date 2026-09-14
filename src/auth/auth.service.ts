import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterMemberDto } from './dto/register-member.dto';
import { RegisterAdminSpaceDto } from './dto/register-admin-space.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private formatMemberFoto(foto: string | null): string | null {
    if (!foto) return null;
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/members/${foto}`;
  }

  async registerMember(dto: RegisterMemberDto, makerId: number) {
    const existing = await this.prisma.user.findFirst({
      where: { username: dto.username, maker_id: makerId },
    });
    if (existing) {
      throw new BadRequestException('Username sudah digunakan oleh akun lain!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        role: 'member',
        maker_id: makerId,
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

    const access_token = this.generateToken(user);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      member: {
        id: user.member.id,
        nama_member: user.member.nama_member,
        instansi: user.member.instansi,
        alamat: user.member.alamat,
        telp: user.member.telp,
        foto: user.member.foto,
        foto_url: this.formatMemberFoto(user.member.foto),
      },
      access_token,
    };
  }

  async registerAdminSpace(dto: RegisterAdminSpaceDto, makerId: number) {
    const existing = await this.prisma.user.findFirst({
      where: { username: dto.username, maker_id: makerId },
    });
    if (existing) {
      throw new BadRequestException('Username sudah digunakan oleh akun lain!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        role: 'admin_space',
        maker_id: makerId,
        spaceOwner: {
          create: {
            nama_coworking: dto.nama_coworking,
            nama_pemilik: dto.nama_pemilik,
            telp: dto.telp,
          },
        },
      },
      include: { spaceOwner: true },
    });

    const access_token = this.generateToken(user);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      space_owner: {
        id: user.spaceOwner.id,
        nama_coworking: user.spaceOwner.nama_coworking,
        nama_pemilik: user.spaceOwner.nama_pemilik,
        telp: user.spaceOwner.telp,
      },
      access_token,
    };
  }

  async login(dto: LoginDto, makerId: number) {
    const user = await this.prisma.user.findFirst({
      where: { username: dto.username, maker_id: makerId },
      include: { member: true, spaceOwner: true },
    });

    if (!user) {
      throw new UnauthorizedException('Username atau Password salah!');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Username atau Password salah!');
    }

    const access_token = this.generateToken(user);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      maker_id: user.maker_id,
      member: user.member
        ? {
            id: user.member.id,
            nama_member: user.member.nama_member,
            instansi: user.member.instansi,
            alamat: user.member.alamat,
            telp: user.member.telp,
            foto: user.member.foto,
            foto_url: this.formatMemberFoto(user.member.foto),
          }
        : null,
      space_owner: user.spaceOwner
        ? {
            id: user.spaceOwner.id,
            nama_coworking: user.spaceOwner.nama_coworking,
            nama_pemilik: user.spaceOwner.nama_pemilik,
            telp: user.spaceOwner.telp,
          }
        : null,
      access_token,
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true, spaceOwner: true },
    });

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      member: user.member
        ? {
            id: user.member.id,
            nama_member: user.member.nama_member,
            instansi: user.member.instansi,
            alamat: user.member.alamat,
            telp: user.member.telp,
            foto: user.member.foto,
            foto_url: this.formatMemberFoto(user.member.foto),
          }
        : null,
      space_owner: user.spaceOwner
        ? {
            id: user.spaceOwner.id,
            nama_coworking: user.spaceOwner.nama_coworking,
            nama_pemilik: user.spaceOwner.nama_pemilik,
            telp: user.spaceOwner.telp,
          }
        : null,
    };
  }

  private generateToken(user: any): string {
    return this.jwtService.sign({
      sub: user.id,
      username: user.username,
      role: user.role,
      type: 'user',
    });
  }
}
