import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagEntity } from './entities/tag.entity';

export interface TagsRo {
  list: TagEntity[];
  count: number;
  totalPages: number;
  currentPage: number;
}

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  async create(tag: CreateTagDto): Promise<TagEntity> {
    const { name } = tag;
    const doc = await this.tagRepository.findOne({ where: { name } });
    if (doc) {
      throw new HttpException('标签名称已存在', 401);
    }
    return await this.tagRepository.save({ ...tag, count: 0 });
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    current?: number;
    size?: number;
    keyword?: string;
  }): Promise<TagsRo> {
    // 兼容两种分页参数格式：page/pageSize 和 current/size
    const page = params.page ?? params.current ?? 1;
    const pageSize = params.pageSize ?? params.size ?? 10;
    const keyword = params.keyword ?? '';

    const where = keyword ? { name: Like(`%${keyword}%`) } : {};
    const [list, totalCount] = await this.tagRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createTime: 'DESC' },
    });
    return {
      list,
      count: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  }

  async findById(id: number): Promise<TagEntity> {
    const doc = await this.tagRepository.findOne({ where: { id } });
    if (!doc) {
      throw new HttpException('标签不存在', 401);
    }
    return doc;
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    const existTag = await this.tagRepository.findOne({ where: { id } });
    if (!existTag) {
      throw new HttpException('标签不存在', 401);
    }

    // 如果要修改名称，检查新名称是否已存在
    if (updateTagDto.name && updateTagDto.name !== existTag.name) {
      const existing = await this.tagRepository.findOne({
        where: { name: updateTagDto.name },
      });
      if (existing) {
        throw new HttpException('标签名称已存在', 401);
      }
    }

    const updateTag = this.tagRepository.merge(existTag, updateTagDto);
    return this.tagRepository.save(updateTag);
  }

  async remove(id: number) {
    const existTag = await this.tagRepository.findOne({
      where: { id },
      relations: ['posts'],
    });

    if (!existTag) {
      throw new HttpException('标签不存在', 401);
    }

    // 检查标签是否被文章引用
    if (existTag.posts && existTag.posts.length > 0) {
      throw new HttpException(
        `该标签被 ${existTag.posts.length} 篇文章使用，无法删除`,
        401,
      );
    }

    return await this.tagRepository.remove(existTag);
  }
}
