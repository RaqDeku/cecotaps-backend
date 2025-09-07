import { Module } from '@nestjs/common';
import { RegionService } from './region.service';
import { RegionController } from './region.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Regions } from './region.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Regions])],
  controllers: [RegionController],
  providers: [RegionService],
})
export class RegionModule {}
