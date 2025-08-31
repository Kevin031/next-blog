import { ApiProperty } from '@nestjs/swagger';

export class GetPostDto {
  @ApiProperty({ description: '文章标题' })
  readonly title: string;

  @ApiProperty({ description: '文章内容' })
  readonly content: string;

  @ApiProperty({ description: '是否可见' })
  readonly visible: boolean;

  @ApiProperty({ description: '作者' })
  readonly author: string;

  @ApiProperty({ description: '封面图片' })
  readonly cover_url: string;

  @ApiProperty({ description: '创建时间' })
  readonly create_time: string;

  @ApiProperty({ description: '更新时间' })
  readonly update_time: string;

  @ApiProperty({ description: '状态' })
  readonly status: string;

  @ApiProperty({ description: 'ID' })
  readonly id: number;
}
