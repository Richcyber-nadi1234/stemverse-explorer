
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { modules, ...courseData } = data;
    
    // Create course and modules in a transaction if modules exist
    return (this.prisma as any).course.create({
      data: {
        ...courseData,
        modules: {
          create: modules?.map((m: any) => ({
            title: m.title,
            content: m.content,
            contentType: m.contentType,
            quizData: m.quizData || undefined,
            assignmentConfig: m.assignmentConfig || undefined,
            liveConfig: m.liveConfig || undefined
          }))
        }
      },
      include: { modules: true }
    });
  }

  async findAll() {
    return (this.prisma as any).course.findMany({
      include: { modules: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return (this.prisma as any).course.findUnique({
      where: { id },
      include: { modules: true }
    });
  }

  async update(id: string, data: any) {
    const { modules, ...courseData } = data;

    // Simple update strategy: Update Course fields, and if modules are provided, 
    // ideally we would diff them. For simplicity, we update the course details.
    // Handling nested module updates deeply via Prisma requires specific ID checks.
    
    return (this.prisma as any).course.update({
      where: { id },
      data: courseData,
      include: { modules: true }
    });
  }

  async remove(id: string) {
    return (this.prisma as any).course.delete({
      where: { id }
    });
  }
}
