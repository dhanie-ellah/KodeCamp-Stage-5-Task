import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userModel: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existing = await this.userModel.findOneBy({
      email: createUserDto.email,
    });

    if (existing) {
      throw new ConflictException(
        `User with Email:${createUserDto.email} already exists`,
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || 'User',
    });

    const saved = await this.userModel.save(user);
    const { password, ...result } = saved;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOneBy({ email: loginDto.email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matchedPassword = await bcrypt.compare(loginDto.password, user.password);

    if (!matchedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { password: _, ...userDetails } = user;

    return {
      accessToken,
      userDetails,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOneBy({ email: email });
    if (!user) {
      return { message: 'If that email exists, a reset link was sent' };
    }

    const resetPayload = {
      sub: user.id,
      type: 'password_reset',
    };
    const resetToken = await this.jwtService.signAsync(resetPayload, {
      expiresIn: '10m',
    });

    return {
      resetToken,
      message: 'Reset token generated and expires after 10 minutes',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);

      if (payload.type != 'password_reset') {
        throw new UnauthorizedException('Invalid token');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      const updateResult = await this.userModel.update(payload.sub, {
        password: hashedNewPassword,
      });

      if (updateResult.affected === 0) {
        throw new NotFoundException('User not found.');
      }

      return { message: 'Password has been successfully updated.' };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Your reset link has expired. Please request a new one.',
        );
      }

      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired reset token.');
    }
  }

  // async findAll() {
  //   const users = await this.userModel.find();
  //   return users.map(({ password, ...passwordlessData }) => passwordlessData);
  // }

  // async findOne(id: number) {
  //   const user = await this.userModel.findOne({
  //     where: { id },
  //     relations: ['products'],
  //   });

  //   if (!user) {
  //     throw new NotFoundException(`User with ID ${id} not found`);
  //   }

  //   const { password, ...result } = user;
  //   return result;
  // }
}
