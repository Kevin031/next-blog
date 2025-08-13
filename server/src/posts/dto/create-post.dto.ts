import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: '文章标题' })
  @IsNotEmpty({ message: '缺少文章标题' })
  readonly title: string;

  @ApiProperty({ description: '文章内容' })
  @IsNotEmpty({ message: '缺少文章内容' })
  readonly content: string;

  @ApiProperty({ description: '作者' })
  readonly author: string;

  @ApiProperty({ description: '封面图片' })
  readonly cover_url: string;
}
