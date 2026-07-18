import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'daniella@braide.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'daniella' })
  @IsString()
  password!: string;
}
