import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReportConflictDto } from '../dto/report.conflict.dto';
import { ConflictService } from '../services/conflict.service';

@Controller('conflicts')
export class ConflictController {
  constructor(private readonly conflictService: ConflictService) {}

  @Post('/report')
  async reportConflict(@Body() reportConflictDto: ReportConflictDto) {
    return await this.conflictService.reportConflict(reportConflictDto);
  }

  @Get('/locations')
  async getConflictsLocations() {
    return await this.conflictService.getConflictsLocations();
  }
}
