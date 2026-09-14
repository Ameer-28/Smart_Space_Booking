import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtMakerGuard extends AuthGuard('jwt-maker') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException('Token App Maker tidak valid atau sudah kedaluwarsa!');
    }
    return user;
  }
}
