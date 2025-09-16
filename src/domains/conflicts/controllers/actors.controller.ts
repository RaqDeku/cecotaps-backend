import { Controller, Get } from '@nestjs/common';
import { ActorsService } from '../services/actors.service';
import { ApiResponse } from 'src/common/api.response';

@Controller('actors')
export class ActorsController extends ApiResponse {
  constructor(private readonly actorsService: ActorsService) {
    super();
  }

  @Get('/')
  async getActorsData() {
    return this.response({
      data: await this.actorsService.getAllConflictsActors(),
    });
  }
}
