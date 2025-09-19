import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from 'src/common/api.response';
import { AnalyticsService } from '../services/analytics.service';

@Controller('conflicts-analytics')
export class AnalyticsController extends ApiResponse {
  constructor(private readonly analyticsService: AnalyticsService) {
    super();
  }

  @Get('/')
  async getConflictsAnalytics() {
    return this.response({
      data: await this.analyticsService.getConflictsStats(),
    });
  }

  @Get('/actors-involvement')
  async getActorsInvolvement() {
    return this.response({
      data: await this.analyticsService.actorsInvolvement(),
    });
  }

  @Get('/interventions-stats')
  async getInterventionsStats() {
    return this.response({
      data: await this.analyticsService.interventionsStats(),
    });
  }

  @Get('/regional-breakdown')
  async getRegionalBreakdown() {
    return this.response({
      data: await this.analyticsService.regionalBreakdown(),
    });
  }

  @Get('/conflict-trends')
  async getConflictTrends() {
    return this.response({
      data: await this.analyticsService.conflictTrends(),
    });
  }
}
