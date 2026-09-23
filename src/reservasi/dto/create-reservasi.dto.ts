import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min } from 'class-validator';
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
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal_reservasi harus YYYY-MM-DD' })
  tanggal_reservasi: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Format jam_mulai harus HH:mm (contoh: 09:00)' })
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
