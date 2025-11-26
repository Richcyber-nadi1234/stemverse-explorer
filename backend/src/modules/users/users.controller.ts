
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    // req.user is populated by the JwtStrategy
    const user = await this.usersService.findById(req.user.userId);
    const { passwordHash, ...result } = user;
    return result;
  }
}
