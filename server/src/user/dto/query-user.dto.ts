import {
  IsOptional,
  IsInt,
  IsString,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryUserDto {
  @ApiPropertyOptional({ description: '当前页码', minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页条数',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: '用户状态',
    enum: ['active', 'inactive', 'banned'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'banned'])
  status?: string;

  @ApiPropertyOptional({ description: '模糊搜索（用户名、昵称、邮箱）' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '手机号精确搜索' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '创建开始时间' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: '创建结束时间' })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}
