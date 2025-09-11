import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ReportConflictDto } from '../dto/report.conflict.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Point, Repository } from 'typeorm';
import { Conflicts } from '../entities/conflict.entity';
import { ConflictLocations } from '../entities/conflict.location.entity';
import { ConflictReporters } from '../entities/conflict.reporter.entity';
import { Actors } from '../entities/actors.entity';
import { ConflictUploads } from '../entities/conflict.media.entity';
import { ConflictApprovalStatus } from '../constants/conflict.statuses';
import { CursorPaginationDto } from '../../../common/pagination/cursor.pagination.dto';
import { ConflictResponses } from '../responses/conflicts.response';
import { CursorPaginator } from 'src/common/pagination/cursor.pagination';
import { EditConflictDto } from '../dto/edit.conflict.dto';
import { RootCauses } from '../entities/conflict.root.cause.entity';
import { InformationSources } from '../entities/conflict.info.source.entity';

@Injectable()
export class ConflictService extends CursorPaginator<Conflicts> {
  constructor(
    @InjectRepository(Conflicts)
    private readonly conflictRepository: Repository<Conflicts>,
    @InjectRepository(Actors)
    private readonly conflictActorRepository: Repository<Actors>,
    @InjectRepository(RootCauses)
    private readonly conflictRootCauseRepository: Repository<RootCauses>,
    @InjectRepository(InformationSources)
    private readonly conflictInfoSourceRepository: Repository<InformationSources>,
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

      if (actors?.length > 0) {
        conflict.actors = await this.conflictActorRepository.findBy({
          id: In(actors),
        });
      }

      if (media_uploads && media_uploads.length > 0) {
        conflict.media_uploads = media_uploads.map((url) => {
          const upload = new ConflictUploads();
          upload.url = url;
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
      throw error;
    }
  }

  async getConflictsReports(paginationDto: CursorPaginationDto) {
    const { cursor, before } = paginationDto;

    if (before && cursor) {
      throw new BadRequestException('Ambiguous pagination request');
    }

    const queryBuilder = this.conflictRepository
      .createQueryBuilder('conflicts')
      .leftJoinAndSelect('conflicts.reporter', 'reporter')
      .where('conflicts.approval_status = :status', {
        status: ConflictApprovalStatus.PENDING,
      });

    const result = await this.applyPagination(queryBuilder, paginationDto);
    return {
      ...result,
      data: ConflictResponses.conflictReports(result.data),
    };
  }

  async getAllConflicts(paginationDto: CursorPaginationDto, filters?: any) {
    const { cursor, before } = paginationDto;

    if (before && cursor) {
      throw new BadRequestException('Ambiguous pagination request');
    }

    const queryBuilder = this.conflictRepository
      .createQueryBuilder('conflicts')
      .innerJoinAndSelect('conflicts.location', 'location')
      .innerJoinAndSelect('location.district', 'district');

    const result = await this.applyPagination(queryBuilder, paginationDto);
    return {
      ...result,
      data: ConflictResponses.collection(result.data),
    };
  }

  async getConflictById(id: number) {
    const conflict = await this.conflictRepository.findOne({
      where: { id },
      relations: [
        'location.district',
        'actors',
        'media_uploads',
        'reporter',
        'root_causes',
        'information_sources',
      ],
    });

    if (!conflict) {
      throw new BadRequestException('Conflict not found');
    }

    return ConflictResponses.editConflictPayload(conflict);
  }

  async getConflictsLocations() {
    return await this.conflictRepository.find({
      where: {
        approval_status: ConflictApprovalStatus.APPROVED,
      },
      relations: ['location'],
    });
  }

  async approveConflict(id: number, editConflictDto: EditConflictDto) {
    const conflict = await this.conflictRepository.findOne({
      where: {
        id,
        approval_status: ConflictApprovalStatus.PENDING,
      },
    });

    if (!conflict) {
      throw new BadRequestException('Conflict not found');
    }

    try {
      await this.applyConflictEdits(conflict, editConflictDto);

      conflict.approval_status = ConflictApprovalStatus.APPROVED;
      conflict.last_updated = new Date();

      await this.conflictRepository.save(conflict);

      return { message: 'Conflict approved successfully' };
    } catch (error) {
      console.error('Error approving conflict:', error);
      throw new InternalServerErrorException('Failed to approve conflict');
    }
  }

  /**
   * Apply updates from DTO to an existing conflict entity.
   */
  private async applyConflictEdits(
    conflict: Conflicts,
    dto: EditConflictDto,
  ): Promise<void> {
    const { basic_info, details, actors } = dto;

    // Basic info
    if (basic_info) {
      conflict.title = basic_info.title ?? conflict.title;
      conflict.conflict_type = basic_info.type ?? conflict.conflict_type;
      conflict.severity = basic_info.severity ?? conflict.severity;
      conflict.status = basic_info.status ?? conflict.status;
    }

    // Details
    if (details) {
      conflict.description = details.description ?? conflict.description;

      const rootCauses = (details.root_causes ?? []).map((cause) =>
        this.createCause(cause, 'RootCause'),
      );

      const triggerEvents = (details.trigger_events ?? []).map((cause) =>
        this.createCause(cause, 'TriggerEvent'),
      );

      conflict.root_causes = [...rootCauses, ...triggerEvents];

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
  }

  /**
   * Factory for root cause/trigger event.
   */
  private createCause(description: string, type: 'RootCause' | 'TriggerEvent') {
    const cause = new RootCauses();
    cause.cause_type = type;
    cause.description = description;
    return cause;
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
}
