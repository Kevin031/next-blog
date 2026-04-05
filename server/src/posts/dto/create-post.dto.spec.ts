import { validate } from 'class-validator';
import { CreatePostDto } from './create-post.dto';
import { UpdatePostDto } from './update-post.dto';

describe('CreatePostDto', () => {
  describe('content_type validation', () => {
    it('should allow valid "markdown" value', async () => {
      const dto = new CreatePostDto();
      dto.title = '测试标题';
      dto.content = '测试内容';
      dto.visible = true;
      dto.author = 'test';
      dto.cover_url = 'http://example.com/cover.jpg';
      dto.content_type = 'markdown';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow valid "rich-text" value', async () => {
      const dto = new CreatePostDto();
      dto.title = '测试标题';
      dto.content = '测试内容';
      dto.visible = true;
      dto.author = 'test';
      dto.cover_url = 'http://example.com/cover.jpg';
      dto.content_type = 'rich-text';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid "html" value', async () => {
      const dto = new CreatePostDto();
      dto.title = '测试标题';
      dto.content = '测试内容';
      dto.visible = true;
      dto.author = 'test';
      dto.cover_url = 'http://example.com/cover.jpg';
      dto.content_type = 'html';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('should reject invalid "pdf" value', async () => {
      const dto = new CreatePostDto();
      dto.title = '测试标题';
      dto.content = '测试内容';
      dto.visible = true;
      dto.author = 'test';
      dto.cover_url = 'http://example.com/cover.jpg';
      dto.content_type = 'pdf';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('should use default rich-text value when content_type is not set', async () => {
      const dto = new CreatePostDto();
      dto.title = '测试标题';
      dto.content = '测试内容';
      dto.visible = true;
      dto.author = 'test';
      dto.cover_url = 'http://example.com/cover.jpg';
      // 不设置 content_type，应该使用默认值 'rich-text'

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.content_type).toBe('rich-text');
    });
  });

  describe('required fields validation', () => {
    it('should pass validation when all required fields are provided', async () => {
      const dto = new CreatePostDto();
      dto.title = '测试标题';
      dto.content = '测试内容';
      dto.visible = true;
      dto.author = 'test';
      dto.cover_url = 'http://example.com/cover.jpg';
      dto.tagIds = [1, 2];

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when title is missing', async () => {
      const dto = new CreatePostDto();
      dto.title = '';
      dto.content = '测试内容';
      dto.visible = true;
      dto.author = 'test';
      dto.cover_url = 'http://example.com/cover.jpg';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
      expect(titleError.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when content is missing', async () => {
      const dto = new CreatePostDto();
      dto.title = '测试标题';
      dto.content = '';
      dto.visible = true;
      dto.author = 'test';
      dto.cover_url = 'http://example.com/cover.jpg';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const contentError = errors.find((e) => e.property === 'content');
      expect(contentError).toBeDefined();
      expect(contentError.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when title is empty string', async () => {
      const dto = new CreatePostDto();
      dto.title = '';
      dto.content = '测试内容';
      dto.visible = true;
      dto.author = 'test';
      dto.cover_url = 'http://example.com/cover.jpg';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
    });

    it('should fail validation when content is empty string', async () => {
      const dto = new CreatePostDto();
      dto.title = '测试标题';
      dto.content = '';
      dto.visible = true;
      dto.author = 'test';
      dto.cover_url = 'http://example.com/cover.jpg';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const contentError = errors.find((e) => e.property === 'content');
      expect(contentError).toBeDefined();
    });
  });

  describe('tagIds validation', () => {
    it('should fail validation when tagIds is not an array', async () => {
      const dto = new CreatePostDto();
      dto.title = '测试标题';
      dto.content = '测试内容';
      dto.visible = true;
      dto.author = 'test';
      dto.cover_url = 'http://example.com/cover.jpg';
      dto.tagIds = 'not-an-array' as any;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const tagIdsError = errors.find((e) => e.property === 'tagIds');
      expect(tagIdsError).toBeDefined();
      expect(tagIdsError.constraints).toHaveProperty('isArray');
    });

    it('should pass validation when tagIds is null (optional field)', async () => {
      const dto = new CreatePostDto();
      dto.title = '测试标题';
      dto.content = '测试内容';
      dto.visible = true;
      dto.author = 'test';
      dto.cover_url = 'http://example.com/cover.jpg';
      dto.tagIds = null;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when tagIds is undefined (optional field)', async () => {
      const dto = new CreatePostDto();
      dto.title = '测试标题';
      dto.content = '测试内容';
      dto.visible = true;
      dto.author = 'test';
      dto.cover_url = 'http://example.com/cover.jpg';
      // 不设置 tagIds

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when tagIds is an empty array', async () => {
      const dto = new CreatePostDto();
      dto.title = '测试标题';
      dto.content = '测试内容';
      dto.visible = true;
      dto.author = 'test';
      dto.cover_url = 'http://example.com/cover.jpg';
      dto.tagIds = [];

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});

describe('UpdatePostDto', () => {
  describe('content_type validation', () => {
    it('should allow valid "markdown" value', async () => {
      const dto = new UpdatePostDto();
      dto.content_type = 'markdown';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow valid "rich-text" value', async () => {
      const dto = new UpdatePostDto();
      dto.content_type = 'rich-text';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid "html" value', async () => {
      const dto = new UpdatePostDto();
      dto.content_type = 'html';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('should allow undefined content_type (optional field)', async () => {
      const dto = new UpdatePostDto();
      // 不设置 content_type

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when all fields are provided', async () => {
      const dto = new UpdatePostDto();
      dto.title = '更新标题';
      dto.content = '更新内容';
      dto.content_type = 'markdown';
      dto.cover_url = 'http://example.com/cover.jpg';
      dto.visible = true;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when no fields are provided', async () => {
      const dto = new UpdatePostDto();
      // 所有字段都不提供（全部可选）

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when only some fields are provided', async () => {
      const dto = new UpdatePostDto();
      dto.title = '仅更新标题';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
