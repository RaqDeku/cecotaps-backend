import { Controller, Get, Param } from '@nestjs/common';
import { RegionService } from './region.service';
import { Regions } from './region.entity';

@Controller('regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get()
  async getAllRegions(): Promise<Regions[]> {
    return await this.regionService.getAll();
  }

  @Get('/:region_id/districts')
  async getDistrictsByRegion(@Param('region_id') region_id: number) {
    return await this.regionService.getRegionDistricts(region_id);
  }
}
