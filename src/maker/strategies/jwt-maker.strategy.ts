import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtMakerStrategy extends PassportStrategy(Strategy, 'jwt-maker') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_MAKER_SECRET || 'maker_secret',
    });
  }

  async validate(payload: any) {
    if (payload.type !== 'maker') {
      throw new UnauthorizedException('Token bukan milik App Maker!');
    }
    const maker = await this.prisma.appMaker.findUnique({
      where: { id: payload.sub },
    });
    if (!maker) {
      throw new UnauthorizedException('App Maker tidak ditemukan!');
    }
    return { sub: maker.id, username: maker.username, type: 'maker' };
  }
}
