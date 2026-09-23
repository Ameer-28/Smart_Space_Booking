import { Module } from '@nestjs/common';
import { ReservasiController } from './reservasi.controller';
import { ReservasiService } from './reservasi.service';
import { SpacesModule } from '../spaces/spaces.module';
import { DiskonModule } from '../diskon/diskon.module';

@Module({
  imports: [SpacesModule, DiskonModule],
  controllers: [ReservasiController],
  providers: [ReservasiService],
  exports: [ReservasiService],
})
export class ReservasiModule {}
