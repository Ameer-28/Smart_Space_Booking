import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginMakerDto {
  @ApiProperty({ example: 'budisantoso', description: 'Username atau email' })
  @IsString()
  @IsNotEmpty()
  usernameOrEmail: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
