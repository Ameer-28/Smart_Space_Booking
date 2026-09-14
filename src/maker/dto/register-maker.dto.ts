import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterMakerDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'budisantoso' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'budi@smk.sch.id' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6)
  password: string;
}
