import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDiskonDto {
  @ApiProperty({ example: 'PROMOAGUSTUS' })
  @IsString()
  @IsNotEmpty()
  nama_diskon: string;

  @ApiProperty({ example: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  persentase_diskon: number;

  @ApiProperty({ example: '2026-08-01T00:00:00Z' })
  @IsString()
  @IsNotEmpty()
  tanggal_awal: string;

  @ApiProperty({ example: '2026-08-31T23:59:59Z' })
  @IsString()
  @IsNotEmpty()
  tanggal_akhir: string;
}

export class UpdateDiskonDto {
  @ApiPropertyOptional({ example: 'PROMOAGUSTUS2026' })
  @IsOptional()
  @IsString()
  nama_diskon?: string;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  persentase_diskon?: number;

  @ApiPropertyOptional({ example: '2026-08-01T00:00:00Z' })
  @IsOptional()
  @IsString()
  tanggal_awal?: string;

  @ApiPropertyOptional({ example: '2026-09-15T23:59:59Z' })
  @IsOptional()
  @IsString()
  tanggal_akhir?: string;
}
