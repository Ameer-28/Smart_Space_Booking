import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'jwt_secret',
    });
  }

  async validate(payload: any) {
    if (payload.type !== 'user') {
      throw new UnauthorizedException('Token tidak valid untuk user!');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        member: true,
        spaceOwner: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan!');
    }
    return {
      sub: user.id,
      username: user.username,
      role: user.role,
      maker_id: user.maker_id,
      member: user.member,
      spaceOwner: user.spaceOwner,
    };
  }
}
