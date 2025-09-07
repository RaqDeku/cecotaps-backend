import * as typeorm from 'typeorm';
import { Regions } from '../regions/region.entity';
import { ConflictLocations } from '../conflicts/entities/conflict.location.entity';

@typeorm.Entity()
export class Districts {
  @typeorm.PrimaryGeneratedColumn()
  id: number;

  @typeorm.Column({ length: 255, unique: true })
  name: string;

  @typeorm.Column()
  region_id: number;

  @typeorm.Column({
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
  })
  geom: typeorm.Polygon;

  // Relations
  @typeorm.ManyToOne(() => Regions, (region) => region.districts)
  @typeorm.JoinColumn({ name: 'region_id' })
  region: Regions;

  @typeorm.OneToMany(
    () => ConflictLocations,
    (conflictLocation) => conflictLocation.district,
  )
  conflict_locations: ConflictLocations[];
}
