import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Simple service that would normally read from an Activity table.
// For now, we return synthesized entries to demonstrate wiring.
@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async getUserActivity(userId: string) {
    // TODO: Replace with real DB query when Activity model exists
    // Example: return this.prisma.activity.findMany({ where: { userId }, orderBy: { timestamp: 'desc' } });
    const now = new Date();
    const fmt = (d: Date) => d.toLocaleString('en-GB', { hour12: true });
    return [
      { id: 'a-login', timestamp: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 5)), category: 'Login', action: 'Logged in', details: 'Web app' },
      { id: 'a-course-start', timestamp: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 4.5)), category: 'Course', action: 'Started Lesson', details: 'Computing / ICT • Variables' },
      { id: 'a-quiz', timestamp: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 4)), category: 'Assessment', action: 'Submitted Quiz', details: 'Mathematics • Fractions Quiz 2' },
      { id: 'a-project', timestamp: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 3)), category: 'Project', action: 'Updated Project Task', details: 'Robotics • Calibrated sensor module' },
      { id: 'a-marketplace', timestamp: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 2)), category: 'Marketplace', action: 'Redeemed Coins', details: 'Purchased avatar accessory' },
      { id: 'a-exam', timestamp: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 1.5)), category: 'Exam', action: 'Submitted Exam', details: 'Integ. Science • Term 3' },
      { id: 'a-share', timestamp: fmt(new Date(now.getTime() - 1000 * 60 * 30)), category: 'Share', action: 'Shared Report', details: 'Exported PDF to parent email' },
    ];
  }
}

