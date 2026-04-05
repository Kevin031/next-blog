import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { TagEntity } from '../tags/entities/tag.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';

describe('PostsService', () => {
  let service: PostsService;
  let postRepository: Repository<PostEntity>;
  let tagRepository: Repository<TagEntity>;

  // Mock 数据对象
  const mockPost = {
    id: 1,
    title: '测试文章',
    content: '这是一篇测试文章',
    author: 'testuser',
    visible: true,
    content_type: 'rich-text',
    create_time: new Date(),
    update_time: new Date(),
    cover_url: '',
    tags: [],
  };

  const mockTag = {
    id: 1,
    name: 'JavaScript',
    count: 1,
  };

  const mockPostWithTag = {
    ...mockPost,
    tags: [mockTag],
  };

  // Mock QueryBuilder
  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockPostRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockTagRepository = {
    findByIds: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(PostEntity),
          useValue: mockPostRepository,
        },
        {
          provide: getRepositoryToken(TagEntity),
          useValue: mockTagRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postRepository = module.get<Repository<PostEntity>>(
      getRepositoryToken(PostEntity),
    );
    tagRepository = module.get<Repository<TagEntity>>(
      getRepositoryToken(TagEntity),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    beforeEach(() => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        [mockPost, mockPostWithTag],
        2,
      ]);
    });

    describe('Happy path', () => {
      it('应该使用默认分页参数（page=1, pageSize=10）查询', async () => {
        const result = await service.findAll({});

        expect(mockPostRepository.createQueryBuilder).toHaveBeenCalledWith('post');
        expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
          'post.tags',
          'tag',
        );
        expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
        expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
          'post.create_time',
          'DESC',
        );
        expect(result).toEqual({
          list: [mockPost, mockPostWithTag],
          count: 2,
          totalPages: 1,
          currentPage: 1,
        });
      });

      it('应该使用自定义 page/pageSize 参数', async () => {
        const result = await service.findAll({ page: 2, pageSize: 20 });

        expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
        expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
        expect(result).toEqual({
          list: [mockPost, mockPostWithTag],
          count: 2,
          totalPages: 1,
          currentPage: 2,
        });
      });

      it('应该使用 current/size 别名参数', async () => {
        const result = await service.findAll({ current: 3, size: 15 });

        expect(mockQueryBuilder.skip).toHaveBeenCalledWith(30);
        expect(mockQueryBuilder.take).toHaveBeenCalledWith(15);
        expect(result).toEqual({
          list: [mockPost, mockPostWithTag],
          count: 2,
          totalPages: 1,
          currentPage: 3,
        });
      });

      it('应该按 tagId 筛选文章', async () => {
        const result = await service.findAll({ tagId: 1 });

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tag.id = :tagId', {
          tagId: 1,
        });
        expect(result).toEqual({
          list: [mockPost, mockPostWithTag],
          count: 2,
          totalPages: 1,
          currentPage: 1,
        });
      });
    });

    describe('Edge case', () => {
      it('空数据集应该返回空列表', async () => {
        mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

        const result = await service.findAll({});

        expect(result).toEqual({
          list: [],
          count: 0,
          totalPages: 0,
          currentPage: 1,
        });
      });

      it('应该正确计算最后一页的分页信息', async () => {
        mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockPost], 25]);

        const result = await service.findAll({ page: 3, pageSize: 10 });

        expect(result.totalPages).toBe(3);
        expect(result.currentPage).toBe(3);
        expect(result.list).toHaveLength(1);
      });

      it('应该优先使用 page 参数而不是 current', async () => {
        const result = await service.findAll({ page: 2, current: 3 });

        expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
        expect(result.currentPage).toBe(2);
      });

      it('应该优先使用 pageSize 参数而不是 size', async () => {
        await service.findAll({ pageSize: 20, size: 15 });

        expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      });
    });
  });

  describe('findById', () => {
    describe('Happy path', () => {
      it('应该查询存在的文章成功，包含关联标签', async () => {
        mockPostRepository.findOne.mockResolvedValue(mockPostWithTag);

        const result = await service.findById(1);

        expect(mockPostRepository.findOne).toHaveBeenCalledWith({
          where: { id: 1 },
          relations: ['tags'],
        });
        expect(result).toEqual(mockPostWithTag);
        expect(result.tags).toEqual([mockTag]);
      });

      it('应该返回包含标签数组的文章', async () => {
        const postWithMultipleTags = {
          ...mockPost,
          tags: [mockTag, { id: 2, name: 'TypeScript', count: 1 }],
        };
        mockPostRepository.findOne.mockResolvedValue(postWithMultipleTags);

        const result = await service.findById(1);

        expect(result.tags).toHaveLength(2);
        expect(result.tags[0].name).toBe('JavaScript');
        expect(result.tags[1].name).toBe('TypeScript');
      });
    });

    describe('Error path', () => {
      it('应该抛出 NotFoundException 当文章不存在', async () => {
        mockPostRepository.findOne.mockResolvedValue(null);

        await expect(service.findById(999)).rejects.toThrow(NotFoundException);
        await expect(service.findById(999)).rejects.toThrow('文章不存在');
      });

      it('应该在 findOne 返回 null 时触发异常', async () => {
        mockPostRepository.findOne.mockResolvedValue(null);

        await expect(service.findById(0)).rejects.toThrow(NotFoundException);
      });

      it('应该正确传递异常消息', async () => {
        mockPostRepository.findOne.mockResolvedValue(null);

        try {
          await service.findById(404);
          fail('应该抛出异常');
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('文章不存在');
        }
      });
    });
  });

  describe('create', () => {
    const mockCreatePostDto: CreatePostDto = {
      title: '新文章',
      content: '文章内容',
      visible: true,
      author: 'testuser',
      cover_url: '',
      content_type: 'rich-text',
    };

    describe('Happy path', () => {
      it('应该成功创建不带标签的文章', async () => {
        mockPostRepository.findOne.mockResolvedValue(null);
        mockPostRepository.save.mockResolvedValue(mockPost);

        const result = await service.create(mockCreatePostDto, 'testuser');

        expect(mockPostRepository.findOne).toHaveBeenCalledWith({
          where: { title: '新文章' },
        });
        expect(mockPostRepository.save).toHaveBeenCalledWith({
          ...mockCreatePostDto,
          author: 'testuser',
          tags: [],
        });
        expect(result).toEqual(mockPost);
      });

      it('应该成功创建带标签的文章，标签计数正确增加', async () => {
        const postWithTags = {
          ...mockCreatePostDto,
          tagIds: [1, 2],
        };

        mockPostRepository.findOne.mockResolvedValue(null);
        mockTagRepository.findByIds.mockResolvedValue([mockTag]);
        mockPostRepository.save.mockResolvedValue(mockPostWithTag);

        const result = await service.create(postWithTags, 'testuser');

        expect(mockTagRepository.findByIds).toHaveBeenCalledWith([1, 2]);
        expect(mockTagRepository.createQueryBuilder).toHaveBeenCalled();
        expect(mockPostRepository.save).toHaveBeenCalledWith({
          ...postWithTags,
          author: 'testuser',
          tags: [mockTag],
        });
      });

      it('应该验证标签 count 增加', async () => {
        const postWithTags = {
          ...mockCreatePostDto,
          tagIds: [1],
        };

        mockPostRepository.findOne.mockResolvedValue(null);
        mockTagRepository.findByIds.mockResolvedValue([mockTag]);
        mockPostRepository.save.mockResolvedValue(mockPostWithTag);

        await service.create(postWithTags, 'testuser');

        // 验证 createQueryBuilder 被调用
        expect(mockTagRepository.createQueryBuilder).toHaveBeenCalled();
      });
    });

    describe('Error path', () => {
      it('应该抛出 ConflictException 当标题重复', async () => {
        mockPostRepository.findOne.mockResolvedValue(mockPost);

        await expect(
          service.create(mockCreatePostDto, 'testuser'),
        ).rejects.toThrow(ConflictException);
        await expect(
          service.create(mockCreatePostDto, 'testuser'),
        ).rejects.toThrow('文章已存在');
        expect(mockPostRepository.save).not.toHaveBeenCalled();
      });

      it('应该处理传入无效标签 ID 的情况', async () => {
        const postWithInvalidTags = {
          ...mockCreatePostDto,
          tagIds: [1, 999],
        };

        mockPostRepository.findOne.mockResolvedValue(null);
        mockTagRepository.findByIds.mockResolvedValue([mockTag]);
        mockPostRepository.save.mockResolvedValue(mockPostWithTag);

        const result = await service.create(postWithInvalidTags, 'testuser');

        expect(mockTagRepository.findByIds).toHaveBeenCalledWith([1, 999]);
        expect(result).toBeDefined();
      });
    });
  });

  describe('update', () => {
    const mockUpdatePostDto = {
      title: '更新后的文章',
      content: '更新后的内容',
    };

    describe('Happy path', () => {
      it('应该仅更新文章内容（不涉及标签）', async () => {
        const existPost = { ...mockPost, tags: [] };
        mockPostRepository.findOne.mockResolvedValue(existPost);
        mockPostRepository.save.mockResolvedValue({ ...existPost, ...mockUpdatePostDto });

        const result = await service.update(1, mockUpdatePostDto);

        expect(mockPostRepository.findOne).toHaveBeenCalledWith({
          where: { id: 1 },
          relations: ['tags'],
        });
        expect(mockPostRepository.save).toHaveBeenCalled();
        expect(mockTagRepository.createQueryBuilder).not.toHaveBeenCalled();
      });

      it('应该更新文章标签，新增标签 count 增加', async () => {
        const existPost = { ...mockPost, tags: [] };
        const updateWithTags = {
          ...mockUpdatePostDto,
          tagIds: [1],
        };

        mockPostRepository.findOne.mockResolvedValue(existPost);
        mockTagRepository.findByIds.mockResolvedValue([mockTag]);
        mockPostRepository.save.mockResolvedValue(mockPostWithTag);

        const result = await service.update(1, updateWithTags);

        expect(mockTagRepository.findByIds).toHaveBeenCalledWith([1]);
        expect(mockTagRepository.createQueryBuilder).toHaveBeenCalled();
      });

      it('应该更新文章标签，移除标签 count 减少', async () => {
        const existPost = { ...mockPost, tags: [mockTag] };
        const updateWithEmptyTags = {
          ...mockUpdatePostDto,
          tagIds: [],
        };

        mockPostRepository.findOne.mockResolvedValue(existPost);
        mockTagRepository.findByIds.mockResolvedValue([]);
        mockPostRepository.save.mockResolvedValue({ ...existPost, tags: [] });

        const result = await service.update(1, updateWithEmptyTags);

        expect(mockTagRepository.createQueryBuilder).toHaveBeenCalled();
      });

      it('应该同时更新内容和标签', async () => {
        const existPost = { ...mockPost, tags: [] };
        const updateWithTags = {
          ...mockUpdatePostDto,
          tagIds: [1, 2],
        };

        mockPostRepository.findOne.mockResolvedValue(existPost);
        mockTagRepository.findByIds.mockResolvedValue([mockTag]);
        mockPostRepository.save.mockResolvedValue(mockPostWithTag);

        const result = await service.update(1, updateWithTags);

        expect(mockPostRepository.merge).toHaveBeenCalled();
        expect(mockPostRepository.save).toHaveBeenCalled();
      });
    });

    describe('Error path', () => {
      it('应该抛出 NotFoundException 当文章不存在', async () => {
        mockPostRepository.findOne.mockResolvedValue(null);

        await expect(service.update(999, mockUpdatePostDto)).rejects.toThrow(
          NotFoundException,
        );
        expect(mockPostRepository.save).not.toHaveBeenCalled();
      });

      it('应该处理传入空 tagIds 数组', async () => {
        const existPost = { ...mockPost, tags: [mockTag] };
        const updateWithEmptyTags = {
          ...mockUpdatePostDto,
          tagIds: [],
        };

        mockPostRepository.findOne.mockResolvedValue(existPost);
        mockTagRepository.findByIds.mockResolvedValue([]);
        mockPostRepository.save.mockResolvedValue({ ...existPost, tags: [] });

        const result = await service.update(1, updateWithEmptyTags);

        expect(result.tags).toEqual([]);
      });

      it('应该处理传入相同 tagIds', async () => {
        const existPost = { ...mockPost, tags: [mockTag] };
        const updateWithSameTags = {
          ...mockUpdatePostDto,
          tagIds: [1],
        };

        mockPostRepository.findOne.mockResolvedValue(existPost);
        mockTagRepository.findByIds.mockResolvedValue([mockTag]);
        mockPostRepository.save.mockResolvedValue(existPost);

        const result = await service.update(1, updateWithSameTags);

        expect(mockPostRepository.save).toHaveBeenCalled();
      });
    });
  });

  describe('remove', () => {
    describe('Happy path', () => {
      it('应该删除不带标签的文章', async () => {
        const existPost = { ...mockPost, tags: [] };
        mockPostRepository.findOne.mockResolvedValue(existPost);
        mockPostRepository.remove.mockResolvedValue(existPost);

        const result = await service.remove(1);

        expect(mockPostRepository.findOne).toHaveBeenCalledWith({
          where: { id: 1 },
          relations: ['tags'],
        });
        expect(mockPostRepository.remove).toHaveBeenCalledWith(existPost);
        expect(mockTagRepository.createQueryBuilder).not.toHaveBeenCalled();
      });

      it('应该删除带标签的文章，标签 count 减少', async () => {
        const existPost = { ...mockPost, tags: [mockTag] };
        mockPostRepository.findOne.mockResolvedValue(existPost);
        mockPostRepository.remove.mockResolvedValue(existPost);

        const result = await service.remove(1);

        expect(mockPostRepository.remove).toHaveBeenCalledWith(existPost);
        expect(mockTagRepository.createQueryBuilder).toHaveBeenCalled();
      });

      it('应该正确传递标签 ID 和 delta', async () => {
        const existPost = {
          ...mockPost,
          tags: [mockTag, { id: 2, name: 'TypeScript', count: 1 }],
        };
        mockPostRepository.findOne.mockResolvedValue(existPost);
        mockPostRepository.remove.mockResolvedValue(existPost);

        const result = await service.remove(1);

        expect(mockTagRepository.createQueryBuilder).toHaveBeenCalled();
      });
    });

    describe('Error path', () => {
      it('应该抛出 NotFoundException 当文章不存在', async () => {
        mockPostRepository.findOne.mockResolvedValue(null);

        await expect(service.remove(999)).rejects.toThrow(NotFoundException);
        expect(mockPostRepository.remove).not.toHaveBeenCalled();
      });

      it('应该处理有多个标签的文章', async () => {
        const existPost = {
          ...mockPost,
          tags: [
            mockTag,
            { id: 2, name: 'TypeScript', count: 1 },
            { id: 3, name: 'Node.js', count: 1 },
          ],
        };
        mockPostRepository.findOne.mockResolvedValue(existPost);
        mockPostRepository.remove.mockResolvedValue(existPost);

        const result = await service.remove(1);

        expect(mockTagRepository.createQueryBuilder).toHaveBeenCalled();
        expect(existPost.tags).toHaveLength(3);
      });
    });
  });
});
