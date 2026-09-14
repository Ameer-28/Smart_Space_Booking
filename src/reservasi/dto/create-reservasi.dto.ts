import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReservasiDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  id_space: number;

  @ApiProperty({ example: '2026-08-30' })
  @IsString()
  @IsNotEmpty()
  tanggal_reservasi: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  jam_mulai: string;

  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durasi_jam: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_diskon?: number;

  @ApiPropertyOptional({ example: 'DISKONHEMAT20' })
  @IsOptional()
  @IsString()
  kode_promo?: string;
}
