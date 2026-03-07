import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';
import { TagEntity } from '../tags/entities/tag.entity';

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
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  async create(
    post: Partial<PostEntity>,
    username: string,
  ): Promise<PostEntity> {
    const { title, tagIds } = post as any;
    const doc = await this.postRepository.findOne({ where: { title } });
    if (doc) {
      throw new HttpException('文章已存在', 401);
    }

    // 处理标签关联
    let tags: TagEntity[] = [];
    if (tagIds && tagIds.length > 0) {
      tags = await this.tagRepository.findByIds(tagIds);
      // 更新标签 count
      await this.updateTagsCount(tagIds, 1);
    }

    return await this.postRepository.save({
      ...post,
      author: username,
      tags,
    });
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    current?: number;
    size?: number;
    tagId?: number;
  }): Promise<PostsRo> {
    // 兼容两种分页参数格式：page/pageSize 和 current/size
    const page = params.page ?? params.current ?? 1;
    const pageSize = params.pageSize ?? params.size ?? 10;
    const tagId = params.tagId;

    // 构建查询条件
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('post.create_time', 'DESC');

    // 如果有标签筛选条件
    if (tagId) {
      queryBuilder.andWhere('tag.id = :tagId', { tagId });
    }

    const [list, totalCount] = await queryBuilder.getManyAndCount();

    return {
      list,
      count: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  }

  async findById(id: number): Promise<PostEntity> {
    const doc = await this.postRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!doc) {
      throw new HttpException('文章不存在', 401);
    }
    return doc;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const existPost = await this.postRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!existPost) {
      throw new HttpException('文章不存在', 401);
    }

    // 处理标签变更
    const { tagIds } = updatePostDto as any;
    if (tagIds !== undefined) {
      // 获取旧标签 ID
      const oldTagIds = existPost.tags?.map((tag) => tag.id) || [];

      // 计算需要增加和减少的标签
      const newTags = tagIds.filter((id: number) => !oldTagIds.includes(id));
      const removedTags = oldTagIds.filter((id) => !tagIds.includes(id));

      // 更新标签 count
      if (newTags.length > 0) {
        await this.updateTagsCount(newTags, 1);
      }
      if (removedTags.length > 0) {
        await this.updateTagsCount(removedTags, -1);
      }

      // 加载新标签
      const tags = await this.tagRepository.findByIds(tagIds);
      existPost.tags = tags;
    }

    const updatePost = this.postRepository.merge(existPost, updatePostDto);
    return this.postRepository.save(updatePost);
  }

  async remove(id: number) {
    const existPost = await this.postRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!existPost) {
      throw new HttpException('文章不存在', 401);
    }

    // 减少相关标签的 count
    if (existPost.tags && existPost.tags.length > 0) {
      const tagIds = existPost.tags.map((tag) => tag.id);
      await this.updateTagsCount(tagIds, -1);
    }

    return await this.postRepository.remove(existPost);
  }

  // 更新标签使用次数
  private async updateTagsCount(tagIds: number[], delta: number) {
    await this.tagRepository
      .createQueryBuilder()
      .update(TagEntity)
      .set({ count: () => `count + ${delta}` })
      .where('id IN (:...tagIds)', { tagIds })
      .execute();
  }
}
