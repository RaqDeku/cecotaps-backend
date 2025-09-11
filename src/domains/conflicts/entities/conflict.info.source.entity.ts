import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conflicts } from './conflict.entity';

@Entity()
export class InformationSources {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  source_name: string;

  @Column({ nullable: true })
  reference_link: string;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  // Relations
  @ManyToOne(() => Conflicts, (conflict) => conflict.information_sources)
  @JoinColumn({ name: 'conflict_id' })
  conflict: Conflicts;
}
