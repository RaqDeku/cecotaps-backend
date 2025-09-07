import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Districts } from './districts.entity';
import { DistrictsService } from './districts.service';
import { DistrictController } from './districts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Districts])],
  controllers: [DistrictController],
  providers: [DistrictsService],
})
export class DistrictsModule {}
