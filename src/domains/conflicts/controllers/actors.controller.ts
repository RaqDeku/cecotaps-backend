import { Controller, Get } from '@nestjs/common';
import { ActorsService } from '../services/actors.service';
import { ApiResponse } from 'src/common/api.response';
import { Public } from 'src/domains/admin/auth.guard';

@Controller('actors')
export class ActorsController extends ApiResponse {
  constructor(private readonly actorsService: ActorsService) {
    super();
  }

  @Public()
  @Get('/')
  async getActorsData() {
    return this.response({
      data: await this.actorsService.getAllConflictsActors(),
    });
  }
}
