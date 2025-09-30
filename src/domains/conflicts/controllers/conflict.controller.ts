import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ReportConflictDto } from '../dto/report.conflict.dto';
import { ConflictService } from '../services/conflict.service';
import { CursorPaginationDto } from '../../../common/pagination/cursor.pagination.dto';
import { EditConflictDto } from '../dto/edit.conflict.dto';
import { ApiResponse } from 'src/common/api.response';
import { ConflictResponses } from '../responses/conflicts.response';
import { ConflictFilters } from '../dto/conflicts.filters.dto';
import { AnalyticsService } from '../services/analytics.service';
import { Public } from 'src/domains/admin/auth.guard';

@Controller('conflicts')
export class ConflictController extends ApiResponse {
  constructor(
    private readonly conflictService: ConflictService,
    private readonly analyticsService: AnalyticsService,
  ) {
    super();
  }

  @Public()
  @Post('/report')
  async reportConflict(@Body() reportConflictDto: ReportConflictDto) {
    return await this.conflictService.reportConflict(reportConflictDto);
  }

  @Public()
  @Get('/locations')
  async getConflictsLocations(@Query() conflictFilters: ConflictFilters) {
    return this.response({
      data: await this.conflictService.getConflictsLocations(conflictFilters),
    });
  }

  @Get('/reports')
  async getConflictsReports(@Query() paginationDto: CursorPaginationDto) {
    const { data, meta } =
      await this.conflictService.getConflictsReports(paginationDto);

    return this.response({
      data: ConflictResponses.conflictReports(data),
      meta,
    });
  }

  @Get('/')
  async index(@Query() paginationDto: CursorPaginationDto) {
    const { data, meta } =
      await this.conflictService.getAllConflicts(paginationDto);

    return this.response({
      data: ConflictResponses.collection(data),
      meta,
    });
  }

  @Get('/:id')
  async show(@Param('id') id: number) {
    return this.response({
      data: await this.conflictService.getConflict(Number(id)),
    });
  }

  @Public()
  @Get('/:id/details')
  async showDetails(@Param('id') id: number) {
    return this.response({
      data: await this.conflictService.getConflictDetails(Number(id)),
    });
  }

  @Put('/:id')
  async editConflict(
    @Param('id') id: number,
    @Body() editConflictDto: EditConflictDto,
  ) {
    return await this.conflictService.editConflict(Number(id), editConflictDto);
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
