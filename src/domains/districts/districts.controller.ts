import { Controller, Get, Param } from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { Districts } from './districts.entity';

@Controller('districts')
export class DistrictController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Get('/')
  async getAllDistricts(): Promise<Districts[]> {
    return await this.districtsService.getAllDistricts();
  }

  @Get('/:district_id')
  async getDistrictsByRegionId(
    @Param('district_id') region_id: number,
  ): Promise<Districts> {
    return await this.districtsService.getDistrictsById(region_id);
  }
}
