import { ApiProperty } from '@nestjs/swagger';

export class GetTagDto {
  @ApiProperty({ description: '标签ID' })
  id: number;

  @ApiProperty({ description: '标签名称' })
  name: string;

  @ApiProperty({ description: '使用次数' })
  count: number;

  @ApiProperty({ description: '创建时间' })
  createTime: Date;
}
