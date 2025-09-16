import { Controller, Get } from '@nestjs/common';
import { ConflictInterventionActionsService } from '../services/interventions.service';
import { ApiResponse } from 'src/common/api.response';

@Controller('conflict-interventions')
export class InterventionActionsController extends ApiResponse {
  constructor(
    private readonly interventionService: ConflictInterventionActionsService,
  ) {
    super();
  }

  @Get('/')
  async getActorsData() {
    return this.response({
      data: await this.interventionService.getAllConflictInterventionActions(),
    });
  }
}
