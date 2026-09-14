import { Module } from '@nestjs/common';
import { DiskonController } from './diskon.controller';
import { DiskonService } from './diskon.service';
import { MakerKeyGuard } from '../common/guards/maker-key.guard';

@Module({
  controllers: [DiskonController],
  providers: [DiskonService, MakerKeyGuard],
  exports: [DiskonService],
})
export class DiskonModule {}
