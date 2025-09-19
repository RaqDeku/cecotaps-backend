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
import { Regions } from 'src/domains/regions/region.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Conflicts)
    private conflictsRepository: Repository<Conflicts>,
    @InjectRepository(Actors) private actorsRepository: Repository<Actors>,
    @InjectRepository(Regions) private regionRepository: Repository<Regions>,
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

  async actorsInvolvement() {
    const queryBuilder = this.actorsRepository
      .createQueryBuilder('actors')
      .leftJoin(
        'actors.conflicts',
        'conflicts',
        'conflicts.approval_status = :status',
        {
          status: ConflictApprovalStatus.APPROVED,
        },
      )
      .select('actors.id', 'id')
      .addSelect('actors.name', 'name')
      .addSelect('COUNT(DISTINCT conflicts.id)', 'conflict_count')
      .groupBy('actors.id');

    const results = await queryBuilder.getRawMany<{
      id: number;
      name: string;
      conflict_count: string;
    }>();

    const totalConflicts = await this.conflictsRepository.count({
      where: { approval_status: ConflictApprovalStatus.APPROVED },
    });

    return results.map((r) => ({
      id: r.id,
      name: r.name,
      percentage: this.calculatePercentage(
        totalConflicts,
        Number(r.conflict_count),
      ).toFixed(2),
    }));
  }

  async interventionsStats() {
    const queryBuilder = this.conflictsRepository
      .createQueryBuilder('conflicts')
      .leftJoin('conflicts.interventions_actions', 'interventions_actions')
      .select('interventions_actions.id', 'id')
      .addSelect('interventions_actions.name', 'name')
      .addSelect('COUNT(DISTINCT conflicts.id)', 'conflict_count')
      .where('conflicts.approval_status = :status', {
        status: ConflictApprovalStatus.APPROVED,
      })
      .groupBy('interventions_actions.id')
      .addGroupBy('interventions_actions.name');

    const results = await queryBuilder.getRawMany<{
      id: number;
      name: string;
      conflict_count: string;
    }>();

    const totalConflicts = await this.conflictsRepository.count({
      where: { approval_status: ConflictApprovalStatus.APPROVED },
    });

    return results.map((r) => ({
      id: r.id,
      name: r.name,
      percentage: this.calculatePercentage(
        totalConflicts,
        Number(r.conflict_count),
      ).toFixed(2),
    }));
  }

  async regionalBreakdown() {
    const queryBuilder = this.regionRepository
      .createQueryBuilder('region')
      .leftJoin('region.conflict_locations', 'conflict_location')
      .leftJoin('conflict_location.conflict', 'conflict')
      .select('region.id', 'id')
      .addSelect('region.name', 'name')
      .addSelect('COUNT(DISTINCT conflict.id)', 'conflict_count')
      .groupBy('region.id')
      .addGroupBy('region.name');

    return await queryBuilder.getRawMany<{
      id: number;
      name: string;
      conflict_count: string;
    }>();
  }

  async conflictTrends() {
    return {
      conflict_by_types: await this.getConflictTypeValues(),
      conflict_by_time: await this.getConflictsByTime(),
    };
  }

  private async getConflictTypeValues() {
    const conflictTypes = await this.conflictsRepository
      .createQueryBuilder('conflicts')
      .select('conflicts.conflict_type', 'conflict_type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('conflicts.conflict_type')
      .orderBy('conflicts.conflict_type')
      .getRawMany<{ conflict_type: string; count: string }>();

    return conflictTypes.map((t) => ({
      name: t.conflict_type,
      value: Number(t.count),
    }));
  }

  private async getConflictsByTime(year: number = new Date().getFullYear()) {
    const results = await this.conflictsRepository.query(
      `
    WITH months AS (
      SELECT generate_series(
        make_date($1, 1, 1),
        make_date($1, 12, 1),  
        interval '1 month'
      ) AS month_start
    )
    SELECT 
      TO_CHAR(m.month_start, 'Mon YY') AS month,
      COALESCE(COUNT(c.id), 0) AS value
    FROM months m
    LEFT JOIN conflicts c
      ON DATE_TRUNC('month', c.date_reported) = m.month_start
      AND c.approval_status = $2
    GROUP BY m.month_start
    ORDER BY m.month_start;
    `,
      [year, ConflictApprovalStatus.APPROVED],
    );

    return results.map((r: { month: string; value: string }) => ({
      month: r.month,
      value: Number(r.value),
    }));
  }

  private calculatePercentage(totalConflicts: number, count: number) {
    if (totalConflicts === 0) return 0;
    return (count / totalConflicts) * 100;
  }
}
