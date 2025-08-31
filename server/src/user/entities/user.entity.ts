import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { AuthEntity } from '../../auth/entities/auth.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nickname: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'banned'],
    default: 'active',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 与 AuthEntity 建立一对一关联
  @OneToOne(() => AuthEntity, (auth) => auth.user, { cascade: true })
  @JoinColumn()
  auth: AuthEntity;
}
