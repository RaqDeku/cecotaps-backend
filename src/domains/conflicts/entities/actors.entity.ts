import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conflicts } from './conflict.entity';

@Entity()
export class Actors {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  // Relation
  @ManyToMany(() => Conflicts, (conflict) => conflict.actors)
  @JoinTable({ name: 'conflict_actors' })
  conflict: Conflicts[];
}
