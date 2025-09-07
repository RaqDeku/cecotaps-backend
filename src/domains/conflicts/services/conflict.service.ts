import { Injectable } from '@nestjs/common';
import { ReportConflictDto } from '../dto/report.conflict.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Point, Repository } from 'typeorm';
import { Conflicts } from '../entities/conflict.entity';
import { ConflictLocations } from '../entities/conflict.location.entity';
import { ConflictReporter } from '../entities/conflict.reporter.entity';
import { Actors } from '../entities/actors.entity';
import { ConflictUploads } from '../entities/conflict.media.entity';

@Injectable()
export class ConflictService {
  constructor(
    @InjectRepository(Conflicts)
    private conflictRepository: Repository<Conflicts>,
    @InjectRepository(Actors)
    private conflictActorRepository: Repository<Actors>,
  ) {}

  async reportConflict(reportConflictDto: ReportConflictDto) {
    const {
      conflict_type,
      location,
      region_id,
      district_id,
      actors,
      media_uploads,
      reporter,
    } = reportConflictDto;

    try {
      const conflictLocation = new ConflictLocations();
      conflictLocation.geom = {
        type: 'Point',
        coordinates: [location.long, location.lat],
      } as unknown as Point;
      conflictLocation.region_id = region_id;
      conflictLocation.district_id = district_id;

      const conflict = new Conflicts();
      conflict.conflict_type = conflict_type;
      conflict.location = conflictLocation;

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
        const conflictReporter = new ConflictReporter();
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

  async getConflictsLocations() {
    return await this.conflictRepository.find({
      relations: ['location'],
    });
  }
}
