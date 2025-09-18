import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conflicts } from '../entities/conflict.entity';
import { Actors } from '../entities/actors.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Conflicts)
    private conflictsRepository: Repository<Conflicts>,
    @InjectRepository(Actors) private actorsRepository: Repository<Actors>,
  ) {}

  async getConflictsStats() {}
}
