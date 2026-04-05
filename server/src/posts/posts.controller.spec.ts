import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { TagEntity } from '../tags/entities/tag.entity';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  // Mock 数据
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

  // Mock Repository
  const mockPostRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    })),
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

  // Mock PostsService
  const mockPostsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
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
    })
      .overrideProvider(PostsService)
      .useValue(mockPostsService)
      .compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('应该从 req.user 提取 username 并调用 service.create', async () => {
      const createPostDto = {
        title: '新文章',
        content: '文章内容',
        visible: true,
        author: 'testuser',
        cover_url: '',
        content_type: 'rich-text',
      };

      const req = { user: { username: 'testuser' } };
      mockPostsService.create.mockResolvedValue(mockPost);

      const result = await controller.create(createPostDto, req);

      expect(mockPostsService.create).toHaveBeenCalledWith(
        createPostDto,
        'testuser',
      );
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAll', () => {
    it('应该正确传递查询参数并调用 service.findAll', async () => {
      const query = { page: 1, pageSize: 10 };
      const expectedResult = {
        list: [mockPost],
        count: 1,
        totalPages: 1,
        currentPage: 1,
      };

      mockPostsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(mockPostsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });

    it('应该支持 current/size 别名参数', async () => {
      const query = { current: 2, size: 20 };
      const expectedResult = {
        list: [mockPost],
        count: 1,
        totalPages: 1,
        currentPage: 2,
      };

      mockPostsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(mockPostsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findById', () => {
    it('应该正确解析路径参数 id 并调用 service.findById', async () => {
      mockPostsService.findById.mockResolvedValue(mockPostWithTag);

      const result = await controller.findById('1');

      expect(mockPostsService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPostWithTag);
    });

    it('应该正确转换 string 为 number', async () => {
      mockPostsService.findById.mockResolvedValue(mockPost);

      const result = await controller.findById('42');

      expect(mockPostsService.findById).toHaveBeenCalledWith(42);
      expect(result).toEqual(mockPost);
    });
  });

  describe('update', () => {
    it('应该正确处理参数并调用 service.update', async () => {
      const updatePostDto = {
        title: '更新后的文章',
        content: '更新后的内容',
      };

      const expectedResult = { ...mockPost, ...updatePostDto };
      mockPostsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updatePostDto);

      expect(mockPostsService.update).toHaveBeenCalledWith(1, updatePostDto);
      expect(result).toEqual(expectedResult);
    });

    it('应该正确转换 id 参数', async () => {
      const updatePostDto = { title: '更新' };
      mockPostsService.update.mockResolvedValue(mockPost);

      await controller.update('123', updatePostDto);

      expect(mockPostsService.update).toHaveBeenCalledWith(123, updatePostDto);
    });
  });

  describe('remove', () => {
    it('应该正确处理路径参数并调用 service.remove', async () => {
      mockPostsService.remove.mockResolvedValue(mockPost);

      const result = await controller.remove('1');

      expect(mockPostsService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPost);
    });

    it('应该正确转换 id 参数为 number', async () => {
      mockPostsService.remove.mockResolvedValue(mockPost);

      await controller.remove('999');

      expect(mockPostsService.remove).toHaveBeenCalledWith(999);
    });
  });
});
