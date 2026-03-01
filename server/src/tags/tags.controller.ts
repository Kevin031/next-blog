import { TagsRo } from './tags.service';
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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import {
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Public } from '../common/public.decorator';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @ApiOperation({ summary: '创建标签' })
  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    return await this.tagsService.create(createTagDto);
  }

  @ApiOperation({ summary: '获取所有标签' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'keyword',
    type: String,
    required: false,
  })
  @ApiOkResponse({
    description: '成功获取标签列表',
  })
  @Get()
  @Public()
  findAll(@Query() query): Promise<TagsRo> {
    return this.tagsService.findAll(query);
  }

  @ApiOperation({ summary: '获取指定id的标签' })
  @Get(':id')
  @Public()
  async findById(@Param('id') id: string) {
    return await this.tagsService.findById(+id);
  }

  @ApiOperation({ summary: '更新标签' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(+id, updateTagDto);
  }

  @ApiOperation({ summary: '删除标签' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(+id);
  }
}
