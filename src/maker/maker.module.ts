import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MakerController } from './maker.controller';
import { MakerService } from './maker.service';
import { JwtMakerStrategy } from './strategies/jwt-maker.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_MAKER_SECRET || 'maker_secret',
      signOptions: { expiresIn: process.env.JWT_MAKER_EXPIRES_IN || '30d' },
    }),
  ],
  controllers: [MakerController],
  providers: [MakerService, JwtMakerStrategy],
  exports: [MakerService],
})
export class MakerModule {}
