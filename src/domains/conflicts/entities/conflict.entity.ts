import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConflictLocations } from './conflict.location.entity';
import { ConflictUploads } from './conflict.media.entity';
import { Actors } from './actors.entity';
import { ConflictReporter } from './conflict.reporter.entity';

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

  @Column({ enum: ['low', 'medium', 'high'], nullable: true })
  severity: string;

  @Column({ enum: ['active', 'ongoing', 'resolved'], nullable: true })
  status: string;

  @Column({ type: 'date', nullable: false })
  date_reported: Date;

  @Column({ type: 'timestamp', nullable: false })
  last_updated: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  reported_by: number;

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

  @OneToOne(() => ConflictReporter, (reporter) => reporter.conflict, {
    cascade: true,
  })
  @JoinColumn({ name: 'reported_by' })
  reporter: ConflictReporter;
}
