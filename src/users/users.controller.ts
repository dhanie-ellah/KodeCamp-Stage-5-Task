import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UnauthorizedException,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { roles } from './entities/user.entity';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    const userData = { ...createUserDto, role: 'user' as roles };
    return this.usersService.register(userData);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.usersService.forgotPassword(email);
  }

  @Post('reset-password')
  resetPassword(
    @Body('password') password: string,
    @Query('token') token: string,
  ) {
    return this.usersService.resetPassword(token, password);
  }
  // ADMIN ROUTES
  @Post('/admin/register')
  adminRegister(@Body() createAdminDto: CreateUserDto) {
    const adminData = { ...createAdminDto, role: 'admin' as roles };
    return this.usersService.register(adminData);
  }

  @Post('/admin/login')
  async adminLogin(
    @Body() loginDto: LoginDto
  ) {
    const result = await this.usersService.login(loginDto);

    if (result.userDetails.role != 'admin') {
      throw new UnauthorizedException('Access Denied, Admin portal only!!!');
    }
  }

  // @Get()
  // @UseGuards(AuthenticationGuard, RolesGuard)
  // @Roles(['Admin'])
  // findAllUsers() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // @UseGuards(AuthenticationGuard, RolesGuard)
  // @Roles(['Admin'])
  // findOneUser(@Param('id', ParseIntPipe) id: number) {
  //   return this.usersService.findOne(id);
  // }
}
