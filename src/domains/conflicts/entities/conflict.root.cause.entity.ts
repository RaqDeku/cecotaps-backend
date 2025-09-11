import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conflicts } from './conflict.entity';

@Entity()
export class RootCauses {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conflict_id: number;

  @Column({ enum: ['RootCause', 'TriggerEvent'], nullable: false })
  cause_type: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  // Relation
  @ManyToOne(() => Conflicts, (conflict) => conflict.root_causes)
  @JoinColumn({ name: 'conflict_id' })
  conflict: Conflicts;
}
