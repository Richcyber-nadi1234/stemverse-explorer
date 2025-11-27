
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
      user: user
    };
  }

  async register(data: any) {
    // Determine verification status based on role
    let verificationStatus = 'unverified';
    let isActive = false;

    if (data.roles && data.roles.includes('student')) {
       // Students might need parent email verification, simpler for now
       verificationStatus = 'pending'; 
    } else if (data.roles && (data.roles.includes('teacher') || data.roles.includes('school_admin'))) {
       verificationStatus = 'pending';
    }

    // Check if user exists
    const existing = await this.usersService.findOne(data.email);
    if (existing) {
        throw new Error('User already exists');
    }

    const user = await this.usersService.create({
        ...data,
        active: isActive,
        verificationStatus: verificationStatus
    });
    
    // Return the user object (without password)
    const { passwordHash, ...result } = user;
    return { message: 'User registered successfully', user: result };
  }
}