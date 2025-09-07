import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actors } from './entities/actors.entity';
import { ActorsController } from './controllers/actors.controller';
import { ActorsService } from './services/actors.service';
import { ConflictController } from './controllers/conflict.controller';
import { ConflictService } from './services/conflict.service';
import { Conflicts } from './entities/conflict.entity';
import { ConflictLocations } from './entities/conflict.location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Actors, Conflicts, ConflictLocations])],
  controllers: [ActorsController, ConflictController],
  providers: [ActorsService, ConflictService],
})
export class ConflictsModule {}
