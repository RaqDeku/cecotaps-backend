import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from 'src/common/api.response';
import { AnalyticsService } from '../services/analytics.service';
import { Public } from 'src/domains/admin/auth.guard';

@Controller('conflicts-analytics')
export class AnalyticsController extends ApiResponse {
  constructor(private readonly analyticsService: AnalyticsService) {
    super();
  }

  @Public()
  @Get('/')
  async getConflictsAnalytics() {
    return this.response({
      data: await this.analyticsService.getConflictsStats(),
    });
  }

  @Public()
  @Get('/actors-involvement')
  async getActorsInvolvement() {
    return this.response({
      data: await this.analyticsService.actorsInvolvement(),
    });
  }

  @Public()
  @Get('/interventions-stats')
  async getInterventionsStats() {
    return this.response({
      data: await this.analyticsService.interventionsStats(),
    });
  }

  @Public()
  @Get('/regional-breakdown')
  async getRegionalBreakdown() {
    return this.response({
      data: await this.analyticsService.regionalBreakdown(),
    });
  }

  @Public()
  @Get('/conflict-trends')
  async getConflictTrends() {
    return this.response({
      data: await this.analyticsService.conflictTrends(),
    });
  }
}
