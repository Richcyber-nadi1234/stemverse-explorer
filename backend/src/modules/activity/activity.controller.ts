import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  // Get activity for a specific user. Guarded by JWT.
  @UseGuards(AuthGuard('jwt'))
  @Get(':userId')
  async getForUser(@Param('userId') userId: string, @Request() req: any) {
    // Optional: restrict access so a user can only fetch their own logs,
    // or allow instructors/admins to fetch others.
    const requesterRoles = (req.user?.roles || []) as string[];
    const isSelf = req.user?.userId === userId;
    const isPrivileged = requesterRoles.some(r => ['admin', 'school_admin', 'teacher', 'tutor'].includes(String(r).toLowerCase()));

    if (!isSelf && !isPrivileged) {
      // In a full implementation, we would throw a ForbiddenException.
      // For now, return empty array to avoid breaking demos.
      return [];
    }

    return this.activityService.getUserActivity(userId);
  }
}

