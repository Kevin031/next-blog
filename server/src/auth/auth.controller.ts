import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Headers,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Public } from '../common/public.decorator';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetAuthUserDto } from './dto/get-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @Public()
  @ApiOperation({ summary: '注册账号' })
  signup(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signup(createAuthDto);
  }

  @Post('/login')
  @Public()
  @ApiOperation({ summary: '登录账号' })
  login(@Body() loginData: CreateAuthDto) {
    return this.authService.login(loginData);
  }

  @Get('/user')
  @ApiOperation({ summary: '查询当前账号信息' })
  @ApiOkResponse({
    description: '成功获取用户列表',
    type: GetAuthUserDto,
    isArray: true, // 如果是数组需要指定
  })
  getUser(@Request() req: any) {
    return this.authService.getUser(req.user.username);
  }

  @Get('/user-profile')
  @ApiOperation({ summary: '查询当前用户完整信息（包含用户资料）' })
  getUserWithProfile(@Request() req: any) {
    return this.authService.getUserWithProfile(req.user.username);
  }

  @Get('/to-hex')
  @Public()
  @ApiOperation({ summary: '原始字符串转换为hash编码' })
  toHex(@Query() query: { str: string }) {
    return this.authService.toHex(query.str);
  }
}
