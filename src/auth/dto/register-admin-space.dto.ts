import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAdminSpaceDto {
  @ApiProperty({ example: 'admin_space1' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Moklet Hub Coworking' })
  @IsString()
  @IsNotEmpty()
  nama_coworking: string;

  @ApiProperty({ example: 'Ahmad Bidin' })
  @IsString()
  @IsNotEmpty()
  nama_pemilik: string;

  @ApiProperty({ example: '081298765432' })
  @IsString()
  @IsNotEmpty()
  telp: string;
}
