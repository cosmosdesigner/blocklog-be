import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Header,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardStats(@Request() req: AuthenticatedRequest) {
    return this.analyticsService.getDashboardStats(req.user.id);
  }

  @Get('monthly')
  async getMonthlyStats(
    @Request() req: AuthenticatedRequest,
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe) year: number,
  ) {
    return this.analyticsService.getMonthlyStats(req.user.id, year);
  }

  @Get('daily')
  async getDailyStats(
    @Request() req: AuthenticatedRequest,
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe) year: number,
    @Query('month', new DefaultValuePipe(new Date().getMonth() + 1), ParseIntPipe) month: number,
  ) {
    return this.analyticsService.getDailyStats(req.user.id, year, month);
  }

  @Get('calendar')
  async getYearlyCalendarData(
    @Request() req: AuthenticatedRequest,
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe) year: number,
  ) {
    return this.analyticsService.getYearlyCalendarData(req.user.id, year);
  }

  @Get('export')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="blocklog-export.json"')
  async exportUserData(@Request() req: AuthenticatedRequest) {
    return this.analyticsService.exportUserData(req.user.id);
  }
}
