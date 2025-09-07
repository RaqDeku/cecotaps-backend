import { Controller, Get } from '@nestjs/common';
import { ActorsService } from '../services/actors.service';

@Controller('actors')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Get('/')
  async getActorsData() {
    return await this.actorsService.getAllConflictsActors();
  }
}
