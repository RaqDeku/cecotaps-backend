import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterventionActions } from '../entities/intervention.actions.entity';

@Injectable()
export class ConflictInterventionActionsService {
  constructor(
    @InjectRepository(InterventionActions)
    private interventionActionsRepository: Repository<InterventionActions>,
  ) {}

  async getAllConflictInterventionActions(): Promise<InterventionActions[]> {
    return await this.interventionActionsRepository.find();
  }
}
