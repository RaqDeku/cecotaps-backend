import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Conflicts } from '../../conflicts/entities/conflict.entity';
import { Tokens } from './verification.tokens.entity';

@Entity('users')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean;

  @Column({ type: 'enum', enum: ['admin'], default: 'admin' })
  role: string;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  // Relation
  @OneToMany(() => Conflicts, (conflict) => conflict.admin)
  conflicts: Conflicts[];

  @OneToMany(() => Tokens, (token) => token.user)
  tokens: Tokens[];
}
