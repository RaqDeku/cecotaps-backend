import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Admin } from './admin.entity';

@Entity('verification_tokens')
export class Tokens {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'boolean', default: false })
  is_used: boolean;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'timestamp', nullable: false })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  // Relation
  @ManyToOne(() => Admin, (user) => user.tokens)
  @JoinColumn({ name: 'user_id' })
  user: Admin;
}
