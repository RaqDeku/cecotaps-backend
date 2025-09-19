import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actors } from './entities/actors.entity';
import { ActorsController } from './controllers/actors.controller';
import { ActorsService } from './services/actors.service';
import { ConflictController } from './controllers/conflict.controller';
import { ConflictService } from './services/conflict.service';
import { Conflicts } from './entities/conflict.entity';
import { ConflictLocations } from './entities/conflict.location.entity';
import { InformationSources } from './entities/conflict.info.source.entity';
import { RootCauses } from './entities/conflict.root.cause.entity';
import { ConflictReporters } from './entities/conflict.reporter.entity';
import { ConflictUploads } from './entities/conflict.media.entity';
import { ImpactAssessments } from './entities/impact.assessment.entity';
import { InterventionActions } from './entities/intervention.actions.entity';
import { PropertyDamages } from './entities/property.damage.entity';
import { ConflictInterventions } from './entities/conflict.intervention.entity';
import { ConflictInterventionActionsService } from './services/interventions.service';
import { InterventionActionsController } from './controllers/interventions.controller';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsController } from './controllers/analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Actors,
      Conflicts,
      ConflictLocations,
      InformationSources,
      RootCauses,
      ConflictReporters,
      ConflictUploads,
      ImpactAssessments,
      InterventionActions,
      PropertyDamages,
      ConflictInterventions,
    ]),
  ],
  controllers: [
    ActorsController,
    ConflictController,
    InterventionActionsController,
    AnalyticsController,
  ],
  providers: [
    ActorsService,
    ConflictService,
    ConflictInterventionActionsService,
    AnalyticsService,
  ],
})
export class ConflictsModule {}
