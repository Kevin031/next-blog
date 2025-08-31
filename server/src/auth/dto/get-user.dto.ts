import { ApiProperty } from '@nestjs/swagger';
import { GetUserDto as UserDto } from '../../user/dto/get-user.dto';

export class GetAuthUserDto {
  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: 'id' })
  id: number;

  @ApiProperty({ description: '用户信息' })
  user: UserDto;
}
