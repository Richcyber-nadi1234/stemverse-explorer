
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

    // Using 'any' casting for prisma to avoid TS errors before generation
    return (this.prisma as any).user.create({
      data: {
        email: data.email,
        passwordHash: passwordHash, // Store the HASH, not the plain password
        firstName: data.firstName ?? data.first_name ?? null,
        lastName: data.lastName ?? data.last_name ?? null,
        bio: data.bio || '',
        roles: (data.roles || ['STUDENT']).map((r: string) => String(r).toUpperCase()),
        avatarConfig: data.avatarConfig || {},
        // Gamification defaults aligned with schema
        xp: data.xp ?? 0,
        level: data.level ?? 1,
        stars: data.stars ?? 0,
        badges: data.badges ?? [],
      },
    });
  }
}
