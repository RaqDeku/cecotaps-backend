import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conflicts } from './conflict.entity';

@Entity()
export class InterventionActions {
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

  //Relations
  @ManyToMany(() => Conflicts, (conflict) => conflict.interventions_actions)
  // @JoinTable({ name: 'conflict_intervention_actions' })
  conflict: Conflicts[];
}
