import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MakerKeyGuard } from '../common/guards/maker-key.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, MakerKeyGuard],
})
export class AdminModule {}
