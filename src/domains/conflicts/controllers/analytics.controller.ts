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
}
