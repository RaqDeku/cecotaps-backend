import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Districts } from '../districts/districts.entity';
import { ConflictLocations } from '../conflicts/entities/conflict.location.entity';

@Entity()
export class Regions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  name: string;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  // Relations
  @OneToMany(() => Districts, (district) => district.region)
  districts: Districts[];

  @OneToMany(() => ConflictLocations, (loc) => loc.region)
  conflict_locations: ConflictLocations[];
}
