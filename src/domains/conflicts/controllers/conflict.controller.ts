import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ReportConflictDto } from '../dto/report.conflict.dto';
import { ConflictService } from '../services/conflict.service';
import { CursorPaginationDto } from '../../../common/pagination/cursor.pagination.dto';
import { EditConflictDto } from '../dto/edit.conflict.dto';

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

  @Get('/reports')
  async getConflictsReports(@Query() paginationDto: CursorPaginationDto) {
    return await this.conflictService.getConflictsReports(paginationDto);
  }

  @Get('/')
  async index(@Query() paginationDto: CursorPaginationDto) {
    return await this.conflictService.getAllConflicts(paginationDto);
  }

  @Get('/:id')
  async show(@Param('id') id: number) {
    return await this.conflictService.getConflictById(Number(id));
  }

  @Put('/approve/:id')
  async approveConflict(
    @Param('id') id: number,
    @Body() editConflictDto: EditConflictDto,
  ) {
    return await this.conflictService.approveConflict(
      Number(id),
      editConflictDto,
    );
  }
}
