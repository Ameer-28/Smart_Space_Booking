import { Module } from '@nestjs/common';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';
import { MakerKeyGuard } from '../common/guards/maker-key.guard';

@Module({
  controllers: [SpacesController],
  providers: [SpacesService, MakerKeyGuard],
  exports: [SpacesService],
})
export class SpacesModule {}
