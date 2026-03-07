import { GetUserDto } from './get-user.dto';
import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto extends GetUserDto {
  @ApiProperty({ description: '用户名', minLength: 2, maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: '密码（前端sha256加密后传输）', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
