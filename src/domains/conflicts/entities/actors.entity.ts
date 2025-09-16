import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conflicts } from './conflict.entity';
import { ConflictInterventions } from './conflict.intervention.entity';

@Entity()
export class Actors {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  // Relation
  @ManyToMany(() => Conflicts, (conflict) => conflict.actors)
  @JoinTable({ name: 'conflict_actors' })
  conflict: Conflicts[];

  @ManyToMany(
    () => ConflictInterventions,
    (intervention) => intervention.actors,
  )
  interventions: ConflictInterventions[];
}
