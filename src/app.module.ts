import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MakerModule } from './maker/maker.module';
import { AuthModule } from './auth/auth.module';
import { SpacesModule } from './spaces/spaces.module';
import { DiskonModule } from './diskon/diskon.module';
import { ReservasiModule } from './reservasi/reservasi.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MakerModule,
    AuthModule,
    SpacesModule,
    DiskonModule,
    ReservasiModule,
    AdminModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
