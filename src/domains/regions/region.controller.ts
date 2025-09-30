import { Controller, Get, Param } from '@nestjs/common';
import { RegionService } from './region.service';
import { Regions } from './region.entity';
import { Public } from '../admin/auth.guard';

@Controller('regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Public()
  @Get()
  async getAllRegions(): Promise<Regions[]> {
    return await this.regionService.getAll();
  }

  @Public()
  @Get('/:region_id/districts')
  async getDistrictsByRegion(@Param('region_id') region_id: number) {
    return await this.regionService.getRegionDistricts(region_id);
  }
}
