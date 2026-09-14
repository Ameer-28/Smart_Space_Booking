import { Module } from '@nestjs/common';
import { ReservasiController } from './reservasi.controller';
import { ReservasiService } from './reservasi.service';
import { SpacesModule } from '../spaces/spaces.module';
import { DiskonModule } from '../diskon/diskon.module';
import { MakerKeyGuard } from '../common/guards/maker-key.guard';

@Module({
  imports: [SpacesModule, DiskonModule],
  controllers: [ReservasiController],
  providers: [ReservasiService, MakerKeyGuard],
  exports: [ReservasiService],
})
export class ReservasiModule {}
