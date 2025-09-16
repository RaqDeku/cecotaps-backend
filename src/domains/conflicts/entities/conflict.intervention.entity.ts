import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conflicts } from './conflict.entity';
import { Actors } from './actors.entity';

@Entity()
export class ConflictInterventions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conflict_id: number;

  @Column({ type: 'date', nullable: false })
  date: Date;

  @Column({ type: 'text', nullable: false })
  outcome: string;

  @Column({ nullable: false })
  description: string;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  // Relations
  @ManyToOne(() => Conflicts, (conflict) => conflict.interventions)
  @JoinColumn({ name: 'conflict_id' })
  conflict: Conflicts;

  @ManyToMany(() => Actors, (actor) => actor.interventions, { cascade: true })
  @JoinTable({
    name: 'conflict_intervention_actors',
    joinColumn: {
      name: 'conflict_intervention_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: { name: 'actor_id', referencedColumnName: 'id' },
  })
  actors: Actors[];
}
