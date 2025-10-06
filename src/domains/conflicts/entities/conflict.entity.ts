import {
  Column,
  DeleteDateColumn,
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
import {
  ConflictApprovalStatus,
  ConflictStatus,
} from '../constants/conflict.statuses';
import { RootCauses } from './conflict.root.cause.entity';
import { InformationSources } from './conflict.info.source.entity';
import { ConflictInterventions } from './conflict.intervention.entity';
import { ImpactAssessments } from './impact.assessment.entity';
import { InterventionActions } from './intervention.actions.entity';
import { Admin } from 'src/domains/admin/entities/admin.entity';

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

  @Column({
    nullable: true,
    enum: [
      ConflictStatus.ACTIVE,
      ConflictStatus.RESOLVED,
      ConflictStatus.ONGOING,
    ],
  })
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

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  //Relations
  @OneToOne(() => Admin, (admin) => admin.conflicts)
  @JoinColumn({ name: 'approved_by' })
  admin: Admin;

  @OneToOne(() => ConflictLocations, (location) => location.conflict, {
    cascade: true,
  })
  @JoinColumn({ name: 'location_id' })
  location: ConflictLocations;

  @OneToMany(() => ConflictUploads, (upload) => upload.conflict, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  media_uploads: ConflictUploads[];

  @ManyToMany(() => Actors, (actor) => actor.conflicts, { cascade: true })
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
    orphanedRowAction: 'delete',
  })
  root_causes: RootCauses[];

  @OneToMany(() => InformationSources, (source) => source.conflict, {
    cascade: true,
  })
  information_sources: InformationSources[];

  @OneToMany(
    () => ConflictInterventions,
    (intervention) => intervention.conflict,
    {
      cascade: true,
    },
  )
  interventions: ConflictInterventions[];

  @OneToOne(
    () => ImpactAssessments,
    (impactAssessment) => impactAssessment.conflict,
    {
      cascade: true,
    },
  )
  impact_assessments: ImpactAssessments;

  @ManyToMany(() => InterventionActions, (action) => action.conflict, {
    cascade: true,
  })
  @JoinTable({
    name: 'conflict_intervention_actions',
    joinColumn: { name: 'conflict_id' },
    inverseJoinColumn: { name: 'intervention_action_id' },
  })
  interventions_actions: InterventionActions[];
}
