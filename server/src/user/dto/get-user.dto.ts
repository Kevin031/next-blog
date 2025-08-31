import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsDateString,
} from 'class-validator';

export class GetUserDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'banned'])
  status?: string;
}
