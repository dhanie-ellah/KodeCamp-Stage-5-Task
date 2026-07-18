import { IsEmail, IsEnum, IsNumber, IsString } from 'class-validator';
import { roles } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNumber()
  id!: number;

  @ApiProperty({ example: 'daniella@braide.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Daniella Braide' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'daniella' })
  @IsString()
  password!: string;

  @ApiProperty({ example: 'user' })
  @IsEnum(roles)
  role!: roles;
}
