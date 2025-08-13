import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';

export interface PostsRo {
  list: PostEntity[];
  count: number;
  totalPages: number;
  currentPage: number;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async create(post: Partial<PostEntity>): Promise<PostEntity> {
    const { title } = post;
    const doc = await this.postRepository.findOne({ where: { title } });
    if (doc) {
      throw new HttpException('文章已存在', 401);
    }
    return await this.postRepository.save(post);
  }

  async findAll({
    page = 1,
    pageSize = 10,
  }: {
    page: number;
    pageSize: number;
  }): Promise<PostsRo> {
    const [list, totalCount] = await this.postRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { create_time: 'DESC' },
    });
    return {
      list,
      count: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  }

  async findById(id: number): Promise<PostEntity> {
    const doc = await this.postRepository.findOne({ where: { id } });
    if (!doc) {
      throw new HttpException('文章不存在', 401);
    }
    return doc;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const existPost = await this.postRepository.findOne({ where: { id } });
    if (!existPost) {
      throw new HttpException('文章不存在', 401);
    }
    const updatePost = this.postRepository.merge(existPost, updatePostDto);
    return this.postRepository.save(updatePost);
  }

  async remove(id: number) {
    const existPost = await this.postRepository.findOne({ where: { id } });
    if (!existPost) {
      throw new HttpException('文章不存在', 401);
    }
    return await this.postRepository.remove(existPost);
  }
}
