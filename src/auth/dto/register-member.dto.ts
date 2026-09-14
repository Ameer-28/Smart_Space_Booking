import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterMemberDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  nama_member: string;

  @ApiProperty({ example: 'Universitas Indonesia' })
  @IsString()
  @IsNotEmpty()
  instansi: string;

  @ApiProperty({ example: 'Jl. Sudirman No. 123, Jakarta' })
  @IsString()
  @IsNotEmpty()
  alamat: string;

  @ApiProperty({ example: '081234567890' })
  @IsString()
  @IsNotEmpty()
  telp: string;

  @ApiPropertyOptional({ example: 'member_john.jpg' })
  @IsOptional()
  @IsString()
  foto?: string;
}
