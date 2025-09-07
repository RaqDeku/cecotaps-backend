import { Entity } from 'typeorm';
import * as typeorm from 'typeorm';
import { Conflicts } from './conflict.entity';

@Entity()
export class ConflictReporter {
  @typeorm.PrimaryGeneratedColumn()
  id: number;

  @typeorm.Column()
  conflict_id: number;

  @typeorm.Column({ nullable: false })
  name: string;

  @typeorm.Column({ nullable: true })
  email?: string;

  @typeorm.Column({ nullable: false })
  phone: string;

  @typeorm.OneToOne(() => Conflicts, (conflict) => conflict.reporter)
  conflict: Conflicts;
}
