import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Districts } from '../districts/districts.entity';
import { ConflictLocations } from '../conflicts/entities/conflict.location.entity';

@Entity()
export class Regions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  name: string;

  // Relations
  @OneToMany(() => Districts, (district) => district.region)
  districts: Districts[];

  @OneToMany(() => ConflictLocations, (loc) => loc.region)
  conflict_locations: ConflictLocations[];
}
