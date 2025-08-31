import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

export type Role = 'R_SUPER' | 'R_ADMIN' | 'R_USER';

@Entity('auth')
export class AuthEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({
    type: 'json',
  })
  roles: Role[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 与 UserEntity 建立一对一关联
  @OneToOne(() => UserEntity, (user) => user.auth)
  user: UserEntity;
}
