import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsDateString,
  IsUrl,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetUserDto {
  @ApiPropertyOptional({ description: '昵称', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: '手机号', pattern: '^1[3-9]\\d{9}$' })
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/)
  phone?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({ description: '个人简介', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    description: '性别',
    enum: ['male', 'female', 'other'],
  })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({ description: '生日' })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ description: '地址', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional({
    description: '用户状态',
    enum: ['active', 'inactive', 'banned'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'banned'])
  status?: 'active' | 'inactive' | 'banned';
}
