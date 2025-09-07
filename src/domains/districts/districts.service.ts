import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Districts } from './districts.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DistrictsService {
  constructor(
    @InjectRepository(Districts)
    private districtsRepository: Repository<Districts>,
  ) {}

  async getAllDistricts(): Promise<Districts[]> {
    return await this.districtsRepository.find();
  }

  async getDistrictsById(id: number): Promise<Districts> {
    const district = await this.districtsRepository.findOne({ where: { id } });
    if (!district) {
      throw new BadRequestException('District not found');
    }

    return district;
  }
}
