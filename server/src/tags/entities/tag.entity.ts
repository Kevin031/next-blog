import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostEntity } from '../../posts/entities/post.entity';

@Entity('tags')
export class TagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  name: string;

  @Column({ type: 'int', default: 0 })
  count: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @ManyToMany(() => PostEntity, (post) => post.tags)
  posts: PostEntity[];
}
