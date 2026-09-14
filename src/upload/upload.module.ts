import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MakerKeyGuard } from '../common/guards/maker-key.guard';

@Module({
  controllers: [UploadController],
  providers: [UploadService, MakerKeyGuard],
})
export class UploadModule {}
