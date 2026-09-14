import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MakerKeyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const makerKey =
      request.headers['x-maker-key'] || request.headers['x-app-key'];

    if (!makerKey) {
      throw new UnauthorizedException(
        'Header x-maker-key wajib disertakan pada setiap request!',
      );
    }

    const maker = await this.prisma.appMaker.findUnique({
      where: { app_key: makerKey },
    });

    if (!maker) {
      throw new UnauthorizedException('App key tidak valid atau tidak terdaftar!');
    }

    // Simpan maker di request untuk digunakan di controller
    request.maker = maker;
    request.makerId = maker.id;
    request.makerKey = makerKey;

    return true;
  }
}
