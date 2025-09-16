import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PropertyDamages } from './property.damage.entity';
import { Conflicts } from './conflict.entity';

@Entity()
export class ImpactAssessments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conflict_id: number;

  @Column({ nullable: true })
  casualties: number;

  @Column({ nullable: true })
  displacements: number;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  // Relations
  @OneToMany(
    () => PropertyDamages,
    (propertyDamage) => propertyDamage.impact_assessment,
    {
      cascade: true,
      orphanedRowAction: 'delete',
    },
  )
  property_damages: PropertyDamages[];

  @OneToOne(() => Conflicts, (conflict) => conflict.impact_assessments)
  @JoinColumn({ name: 'conflict_id' })
  conflict: Conflicts;
}
