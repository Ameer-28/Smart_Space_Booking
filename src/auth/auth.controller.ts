import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterMemberDto } from './dto/register-member.dto';
import { RegisterAdminSpaceDto } from './dto/register-admin-space.dto';
import { LoginDto } from './dto/login.dto';
import { MakerKeyGuard } from '../common/guards/maker-key.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/member')
  @UseGuards(MakerKeyGuard)
  @ApiSecurity('MakerKey')
  @ApiOperation({ summary: 'Registrasi Akun Member / Pelanggan Baru' })
  async registerMember(@Body() dto: RegisterMemberDto, @Request() req: any) {
    const data = await this.authService.registerMember(dto, req.makerId);
    return {
      status: true,
      statusCode: HttpStatus.CREATED,
      message: 'Registrasi member berhasil!',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('register/admin-space')
  @UseGuards(MakerKeyGuard)
  @ApiSecurity('MakerKey')
  @ApiOperation({ summary: 'Registrasi Pengelola Lokasi / Admin Coworking Space' })
  async registerAdminSpace(
    @Body() dto: RegisterAdminSpaceDto,
    @Request() req: any,
  ) {
    const data = await this.authService.registerAdminSpace(dto, req.makerId);
    return {
      status: true,
      statusCode: HttpStatus.CREATED,
      message: 'Registrasi Admin Space berhasil!',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(MakerKeyGuard)
  @ApiSecurity('MakerKey')
  @ApiOperation({ summary: 'Login Akun User (Member atau Admin Space) - Mengembalikan JWT Token' })
  async login(@Body() dto: LoginDto, @Request() req: any) {
    const data = await this.authService.login(dto, req.makerId);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Login berhasil!',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, MakerKeyGuard)
  @ApiBearerAuth('JWT')
  @ApiSecurity('MakerKey')
  @ApiOperation({ summary: 'Cek Profil & Hak Akses Pengguna yang Sedang Login' })
  async getProfile(@CurrentUser() user: any) {
    const data = await this.authService.getProfile(user.sub);
    return {
      status: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil memproses permintaan',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
