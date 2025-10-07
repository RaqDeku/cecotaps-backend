import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ReportConflictDto } from '../dto/report.conflict.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Point, Repository } from 'typeorm';
import { Conflicts } from '../entities/conflict.entity';
import { ConflictLocations } from '../entities/conflict.location.entity';
import { ConflictReporters } from '../entities/conflict.reporter.entity';
import { Actors } from '../entities/actors.entity';
import { ConflictUploads } from '../entities/conflict.media.entity';
import { ConflictApprovalStatus } from '../constants/conflict.statuses';
import { CursorPaginationDto } from '../../../common/pagination/cursor.pagination.dto';
import { ConflictResponses } from '../responses/conflicts.response';
import { CursorPaginator } from 'src/common/pagination/cursor.pagination';
import {
  EditConflictDto,
  ImpactAssessment,
  Intervention,
} from '../dto/edit.conflict.dto';
import { RootCauses } from '../entities/conflict.root.cause.entity';
import { InformationSources } from '../entities/conflict.info.source.entity';
import { InterventionActions } from '../entities/intervention.actions.entity';
import { ConflictInterventions } from '../entities/conflict.intervention.entity';
import { ImpactAssessments } from '../entities/impact.assessment.entity';
import { PropertyDamages } from '../entities/property.damage.entity';
import { ConflictFilters } from '../dto/conflicts.filters.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeleteMediaEvent } from 'src/events/delete.media.event';

@Injectable()
export class ConflictService extends CursorPaginator<Conflicts> {
  constructor(
    @InjectRepository(Conflicts)
    private readonly conflictRepository: Repository<Conflicts>,
    @InjectRepository(Actors)
    private readonly conflictActorRepository: Repository<Actors>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async reportConflict(reportConflictDto: ReportConflictDto) {
    const {
      conflict_type,
      location,
      region_id,
      district_id,
      actors,
      media_uploads,
      conflict_date,
      reporter,
      description,
      severity,
    } = reportConflictDto;

    try {
      const conflictLocation = new ConflictLocations();
      conflictLocation.geom = {
        type: 'Point',
        coordinates: [location.lat, location.lng],
      } as unknown as Point;
      conflictLocation.region_id = region_id;
      conflictLocation.district_id = district_id;

      const conflict = new Conflicts();
      conflict.conflict_type = conflict_type;
      conflict.location = conflictLocation;
      conflict.description = description;
      conflict.severity = severity;
      conflict.conflict_date = conflict_date && new Date(conflict_date);

      if (actors?.length > 0) {
        conflict.actors = await this.conflictActorRepository.findBy({
          id: In(actors),
        });
      }

      if (media_uploads && media_uploads.length > 0) {
        conflict.media_uploads = media_uploads.map((imageUpload) => {
          const upload = this.createMediaUpload(imageUpload);
          upload.conflict = conflict;
          return upload;
        });
      }

      if (reporter) {
        const conflictReporter = new ConflictReporters();
        conflictReporter.name = reporter.name;
        conflictReporter.email = reporter?.email;
        conflictReporter.phone = reporter.phone;

        conflict.reporter = conflictReporter;
      }

      conflict.date_reported = new Date();
      conflict.last_updated = new Date();

      await this.conflictRepository.save(conflict);

      return { message: 'Conflict reported successfully' };
    } catch (error) {
      console.error('Error reporting conflict:', error);

      if (media_uploads && media_uploads.length > 0) {
        const deleteMediaEvent = new DeleteMediaEvent();
        deleteMediaEvent.media = media_uploads.map((u) => u.url);

        this.eventEmitter.emit('delete.uploaded-media', deleteMediaEvent);
      }

      throw error;
    }
  }

  async rejectConflict(conflictId: number) {
    return await this.dataSource.transaction(async (manager) => {
      const conflict = await manager.getRepository(Conflicts).findOne({
        where: { id: conflictId },
        relations: ['media_uploads', 'reporter', 'location', 'actors'],
      });

      if (!conflict) {
        throw new NotFoundException(`Conflict not found`);
      }

      if (conflict.media_uploads?.length > 0) {
        const deleteMediaEvent = new DeleteMediaEvent();
        deleteMediaEvent.media = conflict.media_uploads.map((m) => m.url);

        this.eventEmitter.emit('delete.uploaded-media', deleteMediaEvent);
      }

      await manager.remove(conflict);

      return 'Conflict report rejected successfully';
    });
  }

  async getConflictsReports(paginationDto: CursorPaginationDto) {
    const { cursor, before } = paginationDto;

    if (before && cursor) {
      throw new BadRequestException('Ambiguous pagination request');
    }

    const queryBuilder = this.conflictRepository
      .createQueryBuilder('conflicts')
      .leftJoinAndSelect('conflicts.reporter', 'reporter')
      .leftJoinAndSelect('conflicts.actors', 'actors')
      .where('conflicts.approval_status = :status', {
        status: ConflictApprovalStatus.PENDING,
      });

    return await this.applyPagination(queryBuilder, paginationDto);
  }

  async getAllConflicts(paginationDto: CursorPaginationDto, filters?: any) {
    const { cursor, before } = paginationDto;

    if (before && cursor) {
      throw new BadRequestException('Ambiguous pagination request');
    }

    const queryBuilder = this.conflictRepository
      .createQueryBuilder('conflicts')
      .innerJoinAndSelect('conflicts.location', 'location')
      .innerJoinAndSelect('location.district', 'district')
      .where('conflicts.approval_status = :status', {
        status: ConflictApprovalStatus.APPROVED,
      });

    return await this.applyPagination(queryBuilder, paginationDto);
  }

  private async getConflictBaseQuery(id: number, relations: string[] = []) {
    return await this.conflictRepository.findOne({
      where: { id },
      relations: [
        'location.district',
        'actors',
        'media_uploads',
        'reporter',
        'root_causes',
        'information_sources',
        ...relations,
      ],
    });
  }

  async getConflict(id: number) {
    const conflict = await this.getConflictBaseQuery(id, [
      'interventions_actions',
      'impact_assessments.property_damages',
    ]);

    if (!conflict) {
      throw new BadRequestException('Conflict not found');
    }

    return ConflictResponses.editConflictPayload(conflict);
  }

  async getConflictDetails(id: number) {
    const conflict = await this.getConflictBaseQuery(id, [
      'impact_assessments.property_damages',
      'interventions.actors',
      'location.region',
    ]);

    if (!conflict) {
      throw new BadRequestException('Conflict not found');
    }

    return ConflictResponses.conflictDetails(conflict);
  }

  async getConflictsLocations(conflictFilters: ConflictFilters) {
    const queryBuilder = this.conflictRepository
      .createQueryBuilder('conflict')
      .leftJoinAndSelect('conflict.location', 'location')
      .leftJoinAndSelect('location.district', 'district')
      .leftJoinAndSelect('location.region', 'region')
      .leftJoinAndSelect('conflict.actors', 'actors')
      .leftJoinAndSelect(
        'conflict.interventions_actions',
        'interventions_actions',
      )
      .where('conflict.approval_status = :approvalStatus', {
        approvalStatus: ConflictApprovalStatus.APPROVED,
      })
      .select([
        'conflict.id',
        'conflict.title',
        'conflict.conflict_type',
        'conflict.severity',
        'conflict.status',
        'conflict.date_reported',
        'location.geom',
        'district.name',
        'region.name',
      ]);

    this.applyConflictLocationsFilters(queryBuilder, conflictFilters);

    return await queryBuilder.getMany();
  }

  private applyConflictLocationsFilters(
    queryBuilder: any,
    filters: ConflictFilters,
  ) {
    const {
      from_date,
      to_date,
      districts,
      region_id,
      conflict_types,
      actors_involved,
      intervention_actions,
      status,
    } = filters;

    if (from_date && to_date) {
      queryBuilder.andWhere(
        '(conflict.date_reported BETWEEN :from_date AND :to_date OR conflict.conflict_date BETWEEN :from_date AND :to_date)',
        {
          from_date,
          to_date,
        },
      );
    }

    if (region_id) {
      queryBuilder.andWhere('region.id = :region_id', { region_id });
    }

    if (districts && districts?.length > 0) {
      queryBuilder.andWhere('district.id IN (:...districts)', {
        districts,
      });
    }

    if (conflict_types && conflict_types?.length > 0) {
      queryBuilder.andWhere('conflict.conflict_type IN (:...conflict_types)', {
        conflict_types,
      });
    }

    if (actors_involved && actors_involved?.length > 0) {
      queryBuilder.andWhere('actors.id IN (:...actors_involved)', {
        actors_involved,
      });
    }

    if (intervention_actions && intervention_actions?.length > 0) {
      queryBuilder.andWhere(
        'interventions_actions.id IN (:...intervention_actions)',
        {
          intervention_actions,
        },
      );
    }

    if (status) {
      queryBuilder.andWhere('conflict.status = :status', {
        status: status,
      });
    }
  }

  async approveConflict(id: number, editConflictDto: EditConflictDto) {
    const { media } = editConflictDto;

    return await this.dataSource.transaction(async (manager) => {
      const conflict = await manager.getRepository(Conflicts).findOne({
        where: {
          id,
          approval_status: ConflictApprovalStatus.PENDING,
        },
        relations: ['media_uploads'],
      });

      if (!conflict) {
        throw new BadRequestException('Conflict not found');
      }

      try {
        await this.applyConflictEdits(conflict, editConflictDto, manager);

        conflict.approval_status = ConflictApprovalStatus.APPROVED;
        conflict.last_updated = new Date();

        await manager.getRepository(Conflicts).save(conflict);

        return 'Conflict approved successfully';
      } catch (error) {
        console.error('Error approving conflict:', error);

        if (media && media.length > 0) {
          const deleteMediaEvent = new DeleteMediaEvent();
          deleteMediaEvent.media = media.map((u) => u.url);

          this.eventEmitter.emit('delete.uploaded-media', deleteMediaEvent);
        }

        throw new InternalServerErrorException('Failed to approve conflict');
      }
    });
  }

  async editConflict(id: number, editConflictDto: EditConflictDto) {
    const { media } = editConflictDto;

    return await this.dataSource.transaction(async (manager) => {
      const conflict = await manager.getRepository(Conflicts).findOne({
        where: {
          id,
        },
        relations: [
          'root_causes',
          'information_sources',
          'actors',
          'interventions',
          'media_uploads',
        ],
      });

      if (!conflict) {
        throw new BadRequestException('Conflict not found');
      }

      try {
        await this.applyConflictEdits(conflict, editConflictDto, manager);

        conflict.last_updated = new Date();

        await manager.getRepository(Conflicts).save(conflict);

        return 'Conflict edited successfully';
      } catch (error) {
        console.error('Error editing conflict:', error);

        if (media && media.length > 0) {
          const deleteMediaEvent = new DeleteMediaEvent();
          deleteMediaEvent.media = media.map((u) => u.url);

          this.eventEmitter.emit('delete.uploaded-media', deleteMediaEvent);
        }

        throw new InternalServerErrorException('Failed to edit conflict');
      }
    });
  }

  async deleteConflict(conflictId: number) {
    return await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(ConflictUploads)
        .softDelete({ conflict: { id: conflictId } });

      await manager
        .getRepository(ImpactAssessments)
        .softDelete({ conflict: { id: conflictId } });

      await manager
        .getRepository(RootCauses)
        .softDelete({ conflict: { id: conflictId } });

      const location = await manager.getRepository(ConflictLocations).findOne({
        where: { conflict: { id: conflictId } },
      });
      if (location) {
        await manager.getRepository(ConflictLocations).softDelete(location.id);
      }

      await manager.getRepository(Conflicts).softDelete(conflictId);

      return 'Conflict deleted successfully';
    });
  }

  /**
   * Apply updates from DTO to an existing conflict entity.
   */
  private async applyConflictEdits(
    conflict: Conflicts,
    dto: EditConflictDto,
    manager: EntityManager,
  ): Promise<void> {
    const {
      basic_info,
      details,
      actors,
      intervention,
      impact_assessment,
      media,
    } = dto;

    // Basic info
    if (basic_info) {
      conflict.title = basic_info.title ?? conflict.title;
      conflict.conflict_type = basic_info.type ?? conflict.conflict_type;
      conflict.severity = basic_info.severity ?? conflict.severity;
      conflict.status = basic_info.status ?? conflict.status;
      conflict.conflict_date =
        basic_info?.conflict_date !== undefined
          ? new Date(basic_info.conflict_date)
          : conflict?.conflict_date;

      if (basic_info.intervention_actions?.length > 0) {
        conflict.interventions_actions = await manager
          .getRepository(InterventionActions)
          .findBy({
            id: In(basic_info.intervention_actions),
          });
      }
    }

    // Details
    if (details) {
      conflict.description = details.description ?? conflict.description;

      if (conflict?.root_causes?.length > 0) {
        await manager.getRepository(RootCauses).delete({
          conflict_id: conflict.id,
        });
      }

      const rootCauses = (details.root_causes ?? []).map((cause) =>
        this.createCause(cause, 'RootCause'),
      );

      const triggerEvents = (details.trigger_events ?? []).map((cause) =>
        this.createCause(cause, 'TriggerEvent'),
      );

      conflict.root_causes = [...rootCauses, ...triggerEvents];

      if (conflict?.information_sources?.length > 0) {
        await manager.getRepository(InformationSources).delete({
          conflict_id: conflict.id,
        });
      }

      conflict.information_sources = (details.info_sources ?? []).map(
        (source) => this.createInfoSource(source.name, source.reference),
      );
    }

    // Actors
    if (actors?.length > 0) {
      conflict.actors = await this.conflictActorRepository.findBy({
        id: In(actors),
      });
    }

    // Interventions
    if (intervention) {
      conflict.interventions = [
        ...(conflict.interventions || []),
        await this.createIntervention(intervention, manager),
      ];
    }

    // Impact Assessment
    if (impact_assessment) {
      const impactAssessment = await manager
        .getRepository(ImpactAssessments)
        .findOne({
          where: {
            conflict_id: conflict?.id,
          },
        });

      if (impactAssessment) {
        const propertyRepo = manager.getRepository(PropertyDamages);

        await propertyRepo.delete({
          impact_assessment_id: impactAssessment?.id,
        });

        await manager.getRepository(ImpactAssessments).delete({
          conflict_id: conflict.id,
        });
      }

      conflict.impact_assessments =
        this.createImpactAssessment(impact_assessment);
    }

    // Media Upload
    if (media && media?.length > 0) {
      const mediaUploads = media?.map((image) => {
        return this.createMediaUpload(image, conflict);
      });

      conflict.media_uploads = [
        ...(conflict.media_uploads || []),
        ...mediaUploads,
      ];
    }
  }

  /**
   * Factory for root cause/trigger event.
   */
  private createCause(cause: any, type: 'RootCause' | 'TriggerEvent') {
    const conflictCause = new RootCauses();
    conflictCause.cause_type = type;
    conflictCause.description = cause;

    return conflictCause;
  }

  /**
   * Factory for info source.
   */
  private createInfoSource(name: string, reference: string) {
    const infoSource = new InformationSources();
    infoSource.source_name = name;
    infoSource.reference_link = reference;
    return infoSource;
  }

  private async createIntervention(
    intervention: Intervention,
    manager: EntityManager,
  ) {
    const conflictIntervention = new ConflictInterventions();
    conflictIntervention.description = intervention.description;
    conflictIntervention.date = intervention.date;
    conflictIntervention.outcome = intervention.outcome;

    if (intervention.actors?.length > 0) {
      conflictIntervention.actors = await manager.getRepository(Actors).findBy({
        id: In(intervention.actors),
      });
    }

    return conflictIntervention;
  }

  private createImpactAssessment(impactAssessment: ImpactAssessment) {
    const conflictImpactAssessment = new ImpactAssessments();
    conflictImpactAssessment.displacements = impactAssessment.displacements;
    conflictImpactAssessment.casualties = impactAssessment.casualties;

    if (impactAssessment.property_damages?.length > 0) {
      conflictImpactAssessment.property_damages = (
        impactAssessment.property_damages ?? []
      )?.map((damage) => this.createPropertyDamage(damage));
    }

    return conflictImpactAssessment;
  }

  private createPropertyDamage(description: string) {
    const propertyDamage = new PropertyDamages();
    propertyDamage.description = description;

    return propertyDamage;
  }

  private createMediaUpload(media: any, conflict?: Conflicts) {
    const upload = new ConflictUploads();
    upload.url = media.url;

    if (conflict) {
      upload.conflict = conflict;
    }

    return upload;
  }
}
