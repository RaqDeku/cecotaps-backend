import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import * as typeorm from 'typeorm';
import { Conflicts } from './conflict.entity';

@Entity()
export class ConflictReporters {
  @PrimaryGeneratedColumn()
  id: number;

  @typeorm.Column({ nullable: false })
  name: string;

  @typeorm.Column({ nullable: true })
  email?: string;

  @typeorm.Column({ nullable: false })
  phone: string;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  //Relations
  @OneToMany(() => Conflicts, (conflict) => conflict.reporter)
  conflicts: Conflicts[];
}
