import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiProperty({ description: '文章标题', required: false })
  readonly title?: string;

  @ApiProperty({ description: '文章内容', required: false })
  readonly content?: string;

  @ApiProperty({ description: '封面图片', required: false })
  readonly cover_url?: string;

  @ApiProperty({ description: '是否可见', required: false })
  readonly visible?: boolean;
}
