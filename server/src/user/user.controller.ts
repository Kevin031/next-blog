import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('/list')
  findAll(@Query() query: { page: number; pageSize: number }) {
    return this.userService.findAll(query);
  }

  // 获取关联认证信息的用户列表（支持搜索和筛选）
  @Get('/with-auth')
  getUsersWithAuth(
    @Query()
    query: {
      page: number;
      pageSize: number;
      status?: string;
      search?: string;
    },
  ) {
    return this.userService.getUsersWithAuth(query);
  }

  // 通过认证ID查询用户信息
  @Get('/by-auth/:authId')
  findByAuthId(@Param('authId') authId: string) {
    return this.userService.findByAuthId(+authId);
  }

  // 通过用户名查询用户信息
  @Get('/by-username/:username')
  findByUsername(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
