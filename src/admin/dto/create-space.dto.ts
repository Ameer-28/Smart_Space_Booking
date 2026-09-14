import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSpaceDto {
  @ApiProperty({ example: 'Personal Desk Alpha 01' })
  @IsString()
  @IsNotEmpty()
  nama_space: string;

  @ApiProperty({ example: 25000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  harga_per_jam: number;

  @ApiProperty({ example: 'desk', enum: ['desk', 'meeting_room', 'private_office'] })
  @IsString()
  @IsIn(['desk', 'meeting_room', 'private_office'])
  tipe: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  kapasitas: number;

  @ApiProperty({ example: 'WiFi 100Mbps, stopkontak, coffee' })
  @IsString()
  @IsNotEmpty()
  deskripsi: string;

  @ApiPropertyOptional({ example: 'desk_alpha_01.jpg' })
  @IsOptional()
  @IsString()
  foto?: string;
}

export class UpdateSpaceDto {
  @ApiPropertyOptional({ example: 'Personal Desk Alpha 01 (Updated)' })
  @IsOptional()
  @IsString()
  nama_space?: string;

  @ApiPropertyOptional({ example: 30000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  harga_per_jam?: number;

  @ApiPropertyOptional({ enum: ['desk', 'meeting_room', 'private_office'] })
  @IsOptional()
  @IsString()
  @IsIn(['desk', 'meeting_room', 'private_office'])
  tipe?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  kapasitas?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  foto?: string;
}
