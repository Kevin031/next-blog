import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiProperty({ description: '文章标题' })
  readonly title: string;

  @ApiProperty({ description: '文章内容' })
  readonly content: string;

  @ApiProperty({ description: '封面图片' })
  readonly cover_url: string;
}
