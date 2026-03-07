/**
 * 测试文章格式类型功能
 */

import { DataSource } from 'typeorm';
import { PostEntity } from '../src/posts/entities/post.entity';
import { TagEntity } from '../src/tags/entities/tag.entity';

async function testPostContentType() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWD,
    database: process.env.DB_DATABASE || 'blog',
    entities: [PostEntity, TagEntity],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ 数据库连接成功\n');

    const postRepository = dataSource.getRepository(PostEntity);

    // 测试 5.1：创建文章指定格式类型 (markdown)
    console.log('📝 测试 5.1：创建文章指定格式类型 (markdown)');
    const post1 = new PostEntity();
    post1.title = '测试 Markdown 格式';
    post1.content = '# 测试内容\n\n这是 Markdown 格式的文章';
    post1.author = 'test_user';
    post1.visible = true;
    post1.content_type = 'markdown';
    const savedPost1 = await postRepository.save(post1);
    console.log('✓ 创建成功，ID:', savedPost1.id);
    console.log('✓ content_type:', savedPost1.content_type);
    console.log('✓ 内容类型正确:', savedPost1.content_type === 'markdown' ? '是' : '否');
    console.log();

    // 测试 5.1：创建文章指定格式类型 (rich-text)
    console.log('📝 测试 5.1：创建文章指定格式类型 (rich-text)');
    const post2 = new PostEntity();
    post2.title = '测试富文本格式';
    post2.content = '<p>这是富文本格式的文章</p>';
    post2.author = 'test_user';
    post2.visible = true;
    post2.content_type = 'rich-text';
    const savedPost2 = await postRepository.save(post2);
    console.log('✓ 创建成功，ID:', savedPost2.id);
    console.log('✓ content_type:', savedPost2.content_type);
    console.log('✓ 内容类型正确:', savedPost2.content_type === 'rich-text' ? '是' : '否');
    console.log();

    // 测试 5.2：创建文章未指定格式类型
    console.log('📝 测试 5.2：创建文章未指定格式类型');
    const post3 = new PostEntity();
    post3.title = '测试默认格式';
    post3.content = '测试默认值内容';
    post3.author = 'test_user';
    post3.visible = true;
    // 不设置 content_type
    const savedPost3 = await postRepository.save(post3);
    console.log('✓ 创建成功，ID:', savedPost3.id);
    console.log('✓ content_type:', savedPost3.content_type);
    console.log('✓ 默认值正确:', savedPost3.content_type === 'markdown' ? '是' : '否');
    console.log();

    // 测试 5.3：更新文章格式类型
    console.log('📝 测试 5.3：更新文章格式类型');
    savedPost3.content_type = 'rich-text';
    const updatedPost = await postRepository.save(savedPost3);
    console.log('✓ 更新成功');
    console.log('✓ 新 content_type:', updatedPost.content_type);
    console.log('✓ 更新正确:', updatedPost.content_type === 'rich-text' ? '是' : '否');
    console.log();

    // 测试 5.5：获取文章详情
    console.log('📝 测试 5.5：获取文章详情');
    const foundPost = await postRepository.findOne({ where: { id: savedPost1.id } });
    if (foundPost) {
      console.log('✓ 查询成功');
      console.log('✓ 包含 content_type:', foundPost.content_type);
      console.log('✓ content_type 值:', foundPost.content_type);
    } else {
      console.log('✗ 查询失败');
    }
    console.log();

    // 测试 5.6：获取文章列表
    console.log('📝 测试 5.6：获取文章列表');
    const allPosts = await postRepository.find({
      where: { author: 'test_user' },
      take: 5,
    });
    console.log('✓ 查询成功，找到', allPosts.length, '篇测试文章');
    console.log('✓ 所有文章都包含 content_type:',
      allPosts.every(post => post.content_type) ? '是' : '否');
    console.log('✓ 不同格式类型的文章:');
    const markdownCount = allPosts.filter(post => post.content_type === 'markdown').length;
    const richTextCount = allPosts.filter(post => post.content_type === 'rich-text').length;
    console.log(`  - markdown: ${markdownCount} 篇`);
    console.log(`  - rich-text: ${richTextCount} 篇`);
    console.log();

    // 测试 5.4：非法格式类型验证（在 API 层，这里只测试数据库层可以存储）
    console.log('📝 测试 5.4：数据库层非法格式类型（API 层会拦截）');
    const post4 = new PostEntity();
    post4.title = '测试非法格式';
    post4.content = '测试内容';
    post4.author = 'test_user';
    post4.visible = true;
    post4.content_type = 'html'; // 非法值
    const savedPost4 = await postRepository.save(post4);
    console.log('✓ 数据库层可以存储非法值（需要在 API 层验证）');
    console.log('✓ content_type:', savedPost4.content_type);
    console.log('⚠️  注意：非法值的验证应在 API 层通过 @IsIn 验证器实现');
    console.log();

    // 清理测试数据
    console.log('🧹 清理测试数据...');
    await postRepository.delete({ author: 'test_user' });
    console.log('✓ 清理完成');
    console.log();

    console.log('🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await dataSource.destroy();
  }
}

testPostContentType();
