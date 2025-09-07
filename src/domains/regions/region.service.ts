import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Regions } from './region.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Districts } from '../districts/districts.entity';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(Regions)
    private regionRepository: Repository<Regions>,
  ) {}

  async getAll(): Promise<Regions[]> {
    return this.regionRepository.find();
  }

  async getRegionDistricts(regionId: number): Promise<Districts[]> {
    const region = await this.regionRepository.findOne({
      where: { id: regionId },
      relations: ['districts'],
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    return region.districts;
  }
}
