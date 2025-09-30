import { Controller, Get, Param } from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { Districts } from './districts.entity';
import { Public } from '../admin/auth.guard';

@Controller('districts')
export class DistrictController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Public()
  @Get('/')
  async getAllDistricts(): Promise<Districts[]> {
    return await this.districtsService.getAllDistricts();
  }

  @Public()
  @Get('/:region_id')
  async getDistrictsByRegionId(
    @Param('region_id') region_id: number,
  ): Promise<Districts> {
    return await this.districtsService.getDistrictsById(region_id);
  }
}
