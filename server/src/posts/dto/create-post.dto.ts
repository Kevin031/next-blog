import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: '文章标题' })
  @IsNotEmpty({ message: '缺少文章标题' })
  readonly title: string;

  @ApiProperty({ description: '文章内容' })
  @IsNotEmpty({ message: '缺少文章内容' })
  readonly content: string;

  @ApiProperty({ description: '是否可见' })
  readonly visible: boolean;

  @ApiProperty({ description: '作者' })
  readonly author: string;

  @ApiProperty({ description: '封面图片' })
  readonly cover_url: string;

  @ApiProperty({ description: '标签ID数组', required: false })
  @IsOptional()
  @IsArray({ message: '标签ID必须是数组' })
  readonly tagIds?: number[];
}
