import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ImpactAssessments } from './impact.assessment.entity';

@Entity()
export class PropertyDamages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  impact_assessment_id: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  //Relations
  @ManyToOne(
    () => ImpactAssessments,
    (impactAssessment) => impactAssessment.property_damages,
  )
  @JoinColumn({ name: 'impact_assessment_id' })
  impact_assessment: ImpactAssessments;
}
