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
import { GetPostsDto } from './dto/get-posts.dto';
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
    required: false,
    description: '页码（与 current 二选一）',
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    required: false,
    description: '每页条数（与 size 二选一）',
  })
  @ApiQuery({
    name: 'current',
    type: Number,
    required: false,
    description: '当前页码（与 page 二选一）',
  })
  @ApiQuery({
    name: 'size',
    type: Number,
    required: false,
    description: '每页条数（与 pageSize 二选一）',
  })
  @ApiQuery({
    name: 'tagId',
    type: Number,
    required: false,
    description: '标签ID，用于筛选该标签下的文章',
  })
  @ApiQuery({
    name: 'orderBy',
    type: String,
    required: false,
    description: '排序字段：create_time（创建时间）或 update_time（更新时间）',
    enum: ['create_time', 'update_time'],
  })
  @ApiQuery({
    name: 'orderDirection',
    type: String,
    required: false,
    description: '排序方向：ASC（升序）或 DESC（降序）',
    enum: ['ASC', 'DESC'],
  })
  @ApiOkResponse({
    description: '成功获取文章列表',
    type: GetPostDto,
    isArray: true,
  })
  @Get()
  @Public()
  findAll(@Query() query: GetPostsDto): Promise<PostsRo> {
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
