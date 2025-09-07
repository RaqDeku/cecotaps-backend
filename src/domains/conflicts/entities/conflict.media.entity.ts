import { Entity } from 'typeorm';
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

  //Relations
  @typeorm.ManyToOne(() => Conflicts, (conflict) => conflict.media_uploads)
  @typeorm.JoinColumn({ name: 'conflict_id' })
  conflict: Conflicts;
}
