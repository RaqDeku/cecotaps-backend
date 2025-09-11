import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConflictLocations } from './conflict.location.entity';
import { ConflictUploads } from './conflict.media.entity';
import { Actors } from './actors.entity';
import { ConflictReporters } from './conflict.reporter.entity';
import { ConflictApprovalStatus } from '../constants/conflict.statuses';
import { RootCauses } from './conflict.root.cause.entity';
import { InformationSources } from './conflict.info.source.entity';

@Entity()
export class Conflicts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  conflict_type: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: false })
  location_id: number;

  @Column({ nullable: true })
  severity: string;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'date', nullable: false })
  date_reported: Date;

  @Column({ type: 'timestamp', nullable: false })
  last_updated: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  reported_by: number;

  @Column({
    nullable: false,
    enum: [
      ConflictApprovalStatus.PENDING,
      ConflictApprovalStatus.APPROVED,
      ConflictApprovalStatus.REJECTED,
    ],
    default: `"${ConflictApprovalStatus.PENDING}"`,
  })
  approval_status: string;

  @Column()
  approved_by: number;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  //Relations
  @OneToOne(() => ConflictLocations, (location) => location.conflict, {
    cascade: true,
  })
  @JoinColumn({ name: 'location_id' })
  location: ConflictLocations;

  @OneToMany(() => ConflictUploads, (upload) => upload.conflict, {
    cascade: true,
  })
  media_uploads: ConflictUploads[];

  @ManyToMany(() => Actors, (actor) => actor.conflict, { cascade: true })
  @JoinTable({
    name: 'conflict_actors',
    joinColumn: { name: 'conflict_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'actor_id', referencedColumnName: 'id' },
  })
  actors: Actors[];

  @ManyToOne(() => ConflictReporters, (reporter) => reporter.conflicts, {
    cascade: true,
  })
  @JoinColumn({ name: 'reported_by' })
  reporter: ConflictReporters;

  @OneToMany(() => RootCauses, (rootCause) => rootCause.conflict, {
    cascade: true,
  })
  root_causes: RootCauses[];

  @OneToMany(() => InformationSources, (source) => source.conflict, {
    cascade: true,
  })
  information_sources: InformationSources[];
}
