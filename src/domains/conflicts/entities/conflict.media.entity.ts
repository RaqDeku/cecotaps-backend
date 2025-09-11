import { Column, Entity } from 'typeorm';
import * as typeorm from 'typeorm';
import { Conflicts } from './conflict.entity';

@Entity()
export class ConflictUploads {
  @typeorm.PrimaryGeneratedColumn()
  id: number;

  @typeorm.Column()
  conflict_id: number;

  @typeorm.Column()
  url: string;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  //Relations
  @typeorm.ManyToOne(() => Conflicts, (conflict) => conflict.media_uploads)
  @typeorm.JoinColumn({ name: 'conflict_id' })
  conflict: Conflicts;
}
