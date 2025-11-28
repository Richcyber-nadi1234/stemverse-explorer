
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
    // Normalize user shape for frontend expectations
    const safeUser = {
      ...user,
      first_name: (user as any).first_name ?? (user as any).firstName ?? null,
      last_name: (user as any).last_name ?? (user as any).lastName ?? null,
      roles: ((user as any).roles || []).map((r: string) => String(r).toLowerCase()),
    };
    const payload = { email: safeUser.email, sub: safeUser.id, roles: safeUser.roles };
    return {
      access_token: this.jwtService.sign(payload),
      user: safeUser
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
    
    // Return the user object (without password) and issue token
    const { passwordHash, ...result } = user as any;
    const safeUser = {
      ...result,
      first_name: result.first_name ?? result.firstName ?? null,
      last_name: result.last_name ?? result.lastName ?? null,
      roles: (result.roles || []).map((r: string) => String(r).toLowerCase()),
    };
    const payload = { email: safeUser.email, sub: safeUser.id, roles: safeUser.roles };
    return { message: 'User registered successfully', access_token: this.jwtService.sign(payload), user: safeUser };
  }
}
