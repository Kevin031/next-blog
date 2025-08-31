import { PostsRo } from './posts.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Public } from '../common/public.decorator';
import { GetPostDto } from './dto/get-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: '创建文章' })
  @Post('/create')
  async create(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    const username = req.user.username;
    return await this.postsService.create(createPostDto, username);
  }

  @ApiOperation({ summary: '获取所有文章' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: true,
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    description: '成功获取文章列表',
    type: GetPostDto,
    isArray: true, // 如果是数组需要指定
  })
  @Get()
  @Public()
  findAll(@Query() query): Promise<PostsRo> {
    return this.postsService.findAll(query);
  }

  @ApiOperation({ summary: '获取指定id的文章' })
  @Get(':id')
  @Public()
  async findById(@Param('id') id: string) {
    return await this.postsService.findById(+id);
  }

  @ApiOperation({ summary: '更新文章' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @ApiOperation({ summary: '删除文章' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
