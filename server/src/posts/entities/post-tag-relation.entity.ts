import { Entity, PrimaryColumn } from 'typeorm';

@Entity('post_tags_relation')
export class PostTagRelationEntity {
  @PrimaryColumn({ name: 'post_id' })
  postId: number;

  @PrimaryColumn({ name: 'tag_id' })
  tagId: number;
}
