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
import { InterventionActions } from '../entities/intervention.actions.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Conflicts)
    private conflictsRepository: Repository<Conflicts>,
    @InjectRepository(Actors) private actorsRepository: Repository<Actors>,
    @InjectRepository(Regions) private regionRepository: Repository<Regions>,
    @InjectRepository(InterventionActions)
    private interventionActionsRepository: Repository<InterventionActions>,
  ) {}

  async getConflictsStats() {
    const result = await this.conflictsRepository
      .createQueryBuilder('conflicts')
      .select('COUNT(*)', 'totalConflicts')
      .addSelect(
        `SUM(CASE WHEN conflicts.status = :active THEN 1 ELSE 0 END)`,
        'activeConflicts',
      )
      .addSelect(
        `SUM(CASE WHEN conflicts.status = :resolved THEN 1 ELSE 0 END)`,
        'resolvedConflicts',
      )
      .addSelect(
        `SUM(CASE WHEN conflicts.approval_status = :pending THEN 1 ELSE 0 END)`,
        'pendingConflictsReports',
      )
      .addSelect(
        `SUM(CASE WHEN conflicts.severity = :high THEN 1 ELSE 0 END)`,
        'highSeverityConflicts',
      )
      .setParameters({
        active: ConflictStatus.ACTIVE,
        resolved: ConflictStatus.RESOLVED,
        pending: ConflictApprovalStatus.PENDING,
        high: ConflictSeverity.HIGH,
      })
      .getRawOne();

    return {
      totalConflicts: Number(result.totalConflicts),
      activeConflicts: Number(result.activeConflicts),
      resolvedConflicts: Number(result.resolvedConflicts),
      pendingConflictsReports: Number(result.pendingConflictsReports),
      highSeverityConflicts: Number(result.highSeverityConflicts),
    };
  }

  async actorsInvolvement() {
    const queryBuilder = this.actorsRepository
      .createQueryBuilder('actors')
      .leftJoin(
        'actors.conflicts',
        'conflicts',
        'conflicts.approval_status = :status AND conflicts.deleted_at IS NULL',
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
    const conflictsResolved = await this.conflictsRepository
      .createQueryBuilder('conflicts')
      .where('conflicts.status = :status AND conflicts.deleted_at IS NULL', {
        status: ConflictStatus.RESOLVED,
      })
      .getCount();

    const queryBuilder = this.interventionActionsRepository
      .createQueryBuilder('action')
      .leftJoin(
        'action.conflict',
        'conflicts',
        'conflicts.approval_status = :status AND conflicts.deleted_at IS NULL',
        { status: ConflictApprovalStatus.APPROVED },
      )
      .select('action.id', 'id')
      .addSelect('action.name', 'name')
      .addSelect('COUNT(DISTINCT conflicts.id)', 'conflict_count')
      .groupBy('action.id')
      .addGroupBy('action.name');

    const results = await queryBuilder.getRawMany<{
      id: number;
      name: string;
      conflict_count: string;
    }>();

    const totalConflicts = await this.conflictsRepository.count({
      where: { approval_status: ConflictApprovalStatus.APPROVED },
    });

    return [
      { name: 'Resolved', conflict_count: conflictsResolved },
      ...results,
    ].map((r) => ({
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
      // .where('conflict.approval_status = :status', {
      //   status: ConflictApprovalStatus.APPROVED,
      // })
      .select('region.id')
      .addSelect('region.name', 'name')
      .addSelect('COUNT(DISTINCT conflict.id)', 'conflict_count')
      .addSelect(
        `SUM(CASE WHEN conflict.severity = '${ConflictSeverity.HIGH}' THEN 1 ELSE 0 END)`,
        'high_count',
      )
      .addSelect(
        `SUM(CASE WHEN conflict.severity = '${ConflictSeverity.MEDIUM_HIGH}' THEN 1 ELSE 0 END)`,
        'high_medium_count',
      )
      .addSelect(
        `SUM(CASE WHEN conflict.severity = '${ConflictSeverity.MEDIUM}' THEN 1 ELSE 0 END)`,
        'medium_count',
      )
      .addSelect(
        `SUM(CASE WHEN conflict.severity = '${ConflictSeverity.MEDIUM_LOW}' THEN 1 ELSE 0 END)`,
        'low_medium_count',
      )
      .addSelect(
        `SUM(CASE WHEN conflict.severity = '${ConflictSeverity.LOW}' THEN 1 ELSE 0 END)`,
        'low_count',
      )
      .groupBy('region.id')
      .addGroupBy('region.name');

    const results = await queryBuilder.getRawMany<{
      id: number;
      name: string;
      conflict_count: string;
      high_count: string;
      high_medium_count: string;
      medium_count: string;
      low_medium_count: string;
      low_count: string;
    }>();

    return results.map((r) => ({
      id: r.id,
      name: r.name,
      breakdown: {
        extreme: Number(r.high_count),
        high_intensity: Number(r.high_medium_count),
        medium: Number(r.medium_count),
        low_intensity: Number(r.low_medium_count),
        latent: Number(r.low_count),
      },
      conflict_count: Number(r.conflict_count),
    }));
  }

  async conflictTrends() {
    return {
      conflict_by_types: await this.getConflictTypeValues(),
      conflict_by_time: await this.getConflictsByYear(),
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

  private async getConflictsByYear() {
    // Step 1: Find earliest year dynamically
    const [{ min_year }] = await this.conflictsRepository.query(`
      SELECT 
        EXTRACT(YEAR FROM MIN(COALESCE(conflict_date, date_reported))) AS min_year
      FROM conflicts
      WHERE COALESCE(conflict_date, date_reported) IS NOT NULL;
    `);

    const startYear = Number(min_year) || new Date().getFullYear();
    const endYear = new Date().getFullYear();

    const results = await this.conflictsRepository.query(
      `
      WITH years AS (
        SELECT generate_series(CAST($1 AS int), CAST($2 AS int), 1) AS year
      )
      SELECT 
        y.year,
        COUNT(c.id) FILTER (WHERE c.approval_status = $3) AS value
      FROM years y
      LEFT JOIN conflicts c
        ON EXTRACT(YEAR FROM COALESCE(c.conflict_date, c.date_reported)) = y.year
      GROUP BY y.year
      ORDER BY y.year;
      `,
      [startYear, endYear, ConflictApprovalStatus.APPROVED],
    );

    return results.map((r: { year: string; value: string }) => ({
      year: Number(r.year),
      value: Number(r.value),
    }));
  }

  private calculatePercentage(totalConflicts: number, count: number) {
    if (totalConflicts === 0) return 0;
    return (count / totalConflicts) * 100;
  }
}
