import { Injectable } from '@nestjs/common';
import { Actors } from '../entities/actors.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ActorsService {
  constructor(
    @InjectRepository(Actors) private actorsRepository: Repository<Actors>,
  ) {}

  async getAllConflictsActors(): Promise<Actors[]> {
    return await this.actorsRepository.find();
  }
}
