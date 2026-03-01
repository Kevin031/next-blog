import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: '标签名称' })
  @IsNotEmpty({ message: '缺少标签名称' })
  @MaxLength(30, { message: '标签名称不能超过30个字符' })
  readonly name: string;
}
