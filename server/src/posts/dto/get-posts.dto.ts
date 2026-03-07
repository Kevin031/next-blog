import { IsOptional, IsIn, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

export class GetPostsDto {
  @ApiProperty({ required: false, description: '页码（与 current 二选一）' })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false, description: '每页条数（与 size 二选一）' })
  @IsOptional()
  @IsNumber()
  pageSize?: number;

  @ApiProperty({ required: false, description: '当前页码（与 page 二选一）' })
  @IsOptional()
  @IsNumber()
  current?: number;

  @ApiProperty({ required: false, description: '每页条数（与 pageSize 二选一）' })
  @IsOptional()
  @IsNumber()
  size?: number;

  @ApiProperty({ required: false, description: '标签ID，用于筛选该标签下的文章' })
  @IsOptional()
  @IsNumber()
  tagId?: number;

  @ApiProperty({ required: false, enum: ['create_time', 'update_time'], description: '排序字段：create_time（创建时间）或 update_time（更新时间）' })
  @IsOptional()
  @IsIn(['create_time', 'update_time'])
  orderBy?: 'create_time' | 'update_time';

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'], description: '排序方向：ASC（升序）或 DESC（降序）' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC';
}
