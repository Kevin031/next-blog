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
  });
});
