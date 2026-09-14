import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReservasiStatusDto {
  @ApiProperty({
    example: 'disetujui',
    enum: ['belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan'])
  status: string;
}
