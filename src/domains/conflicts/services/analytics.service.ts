import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conflicts } from '../entities/conflict.entity';
import { Actors } from '../entities/actors.entity';
import { Repository } from 'typeorm';
import {
  ConflictApprovalStatus,
  ConflictSeverity,
  ConflictStatus,
} from '../constants/conflict.statuses';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Conflicts)
    private conflictsRepository: Repository<Conflicts>,
    @InjectRepository(Actors) private actorsRepository: Repository<Actors>,
  ) {}

  async getConflictsStats() {
    const queryBuilder =
      this.conflictsRepository.createQueryBuilder('conflicts');

    const totalConflicts = await queryBuilder.getCount();
    const activeConflicts = await queryBuilder
      .where('conflicts.status = :status', { status: ConflictStatus.ACTIVE })
      .getCount();
    const resolvedConflicts = await queryBuilder
      .where('conflicts.status = :status', { status: ConflictStatus.RESOLVED })
      .getCount();
    const pendingConflictsReports = await queryBuilder
      .where('conflicts.approval_status = :approvalStatus', {
        approvalStatus: ConflictApprovalStatus.PENDING,
      })
      .getCount();

    const highSeverityConflicts = await queryBuilder
      .where('conflicts.severity = :severity', {
        severity: ConflictSeverity.HIGH,
      })
      .getCount();

    return {
      totalConflicts,
      activeConflicts,
      resolvedConflicts,
      pendingConflictsReports,
      highSeverityConflicts,
    };
  }
}
