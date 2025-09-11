import { Districts } from 'src/domains/districts/districts.entity';
import { Regions } from 'src/domains/regions/region.entity';
import * as typeorm from 'typeorm';
import { Conflicts } from './conflict.entity';

@typeorm.Entity()
export class ConflictLocations {
  @typeorm.PrimaryGeneratedColumn()
  id: number;

  @typeorm.Column()
  region_id: number;

  @typeorm.Column()
  district_id: number;

  @typeorm.Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  geom: typeorm.Point;

  @typeorm.Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @typeorm.Column({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @typeorm.Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  //Relations
  @typeorm.ManyToOne(() => Regions, (region) => region.conflict_locations)
  @typeorm.JoinColumn({ name: 'region_id' })
  region: Regions;

  @typeorm.ManyToOne(() => Districts, (district) => district.conflict_locations)
  @typeorm.JoinColumn({ name: 'district_id' })
  district: Districts;

  @typeorm.OneToOne(() => Conflicts, (conflict) => conflict.location)
  conflict: Conflicts;
}
