import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return (this.prisma as any).user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return (this.prisma as any).user.findUnique({
      where: { id },
    });
  }

  async create(data: any): Promise<User> {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(data.password, salt);

    return (this.prisma as any).user.create({
      data: {
        email: data.email,
        passwordHash: passwordHash,
        first_name: data.first_name,
        last_name: data.last_name,
        roles: data.roles || ['student'],
        school_id: data.school_id,
        bio: data.bio,
        interests: data.interests || [],
        avatarConfig: data.avatarConfig || {},
        active: data.active ?? false,
        verificationStatus: data.verificationStatus || 'unverified',
        verificationDocuments: data.verificationDocuments || [],
        customPermissions: data.customPermissions || [],
        xp: 0,
        level: 1,
        coins: 0,
        streak: 0,
      },
    });
  }
}