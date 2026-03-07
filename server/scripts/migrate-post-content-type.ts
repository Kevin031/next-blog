/**
 * 迁移脚本：修复历史文章的 content_type 默认值问题
 *
 * 功能：
 * - 查询所有 content_type 为 'markdown' 的文章
 * - 基于启发式规则判断：如果内容包含 HTML 标签，则更新为 'rich-text'
 * - 显示详细的迁移统计信息
 *
 * 使用方法：
 * 1. 确保 .env 配置正确
 * 2. 运行：bun run scripts/migrate-post-content-type.ts
 * 3. 确认迁移结果
 *
 * 注意事项：
 * - 此脚本不会删除或修改文章内容，仅更新 content_type 字段
 * - 建议先备份数据库再执行
 * - 脚本是幂等的，多次执行不会产生副作用
 */

import { DataSource } from 'typeorm';
import { PostEntity } from '../src/posts/entities/post.entity';
import { TagEntity } from '../src/tags/entities/tag.entity';

// 启发式规则：判断内容是否包含 HTML 标签
function hasHtmlTags(content: string): boolean {
  // 简单的启发式规则：检查是否包含常见的 HTML 标签
  const htmlPatterns = [
    /<p>/i,      // 段落标签
    /<div/i,     // div 标签
    /<span/i,    // span 标签
    /<h[1-6]>/i, // 标题标签
    /<ul>/i,     // 无序列表
    /<ol>/i,     // 有序列表
    /<li>/i,     // 列表项
    /<br\s*\/?>/i, // 换行
    /<strong>/i, // 粗体
    /<em>/i,     // 斜体
    /<img/i,     // 图片
    /<a\s/i,     // 链接
  ];

  return htmlPatterns.some(pattern => pattern.test(content));
}

// 更安全的启发式规则：检查是否真正像富文本内容（排除代码块中的 HTML）
function isLikelyRichText(content: string): boolean {
  // 如果内容包含代码块，需要排除代码块中的 HTML
  // 这是一个简化的版本，实际应用中可能需要更复杂的解析

  // 检查是否包含代码块标记
  const hasCodeBlock = /```[\s\S]*?```/g.test(content);

  if (hasCodeBlock) {
    // 如果有代码块，排除代码块内容后再检查 HTML 标签
    const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');
    return hasHtmlTags(contentWithoutCodeBlocks);
  }

  // 没有代码块，直接检查
  return hasHtmlTags(content);
}

async function migratePostContentType() {
  console.log('========================================');
  console.log('📋 文章内容类型迁移工具');
  console.log('========================================\n');

  console.log('🔧 迁移规则：');
  console.log('   - 仅更新 content_type = "markdown" 的文章');
  console.log('   - 启发式规则：如果内容包含 HTML 标签，则判定为富文本');
  console.log('   - 不影响显式选择 markdown 格式的纯文本内容\n');

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

    // 查询所有 content_type 为 'markdown' 的文章
    console.log('🔍 查询需要检查的文章...');
    const markdownPosts = await postRepository.find({
      where: { content_type: 'markdown' },
      select: ['id', 'title', 'content', 'content_type', 'update_time'],
      order: { update_time: 'DESC' },
    });

    console.log(`✓ 找到 ${markdownPosts.length} 篇 markdown 类型的文章\n`);

    if (markdownPosts.length === 0) {
      console.log('🎉 没有需要迁移的文章，所有数据已是最新状态！');
      return;
    }

    // 分析哪些文章需要迁移
    const postsToMigrate = [];
    const postsToKeep = [];

    markdownPosts.forEach(post => {
      const shouldMigrate = isLikelyRichText(post.content);

      if (shouldMigrate) {
        postsToMigrate.push(post);
      } else {
        postsToKeep.push(post);
      }
    });

    console.log('📊 迁移分析结果：');
    console.log(`   - 需要迁移到富文本：${postsToMigrate.length} 篇`);
    console.log(`   - 保持 markdown 格式：${postsToKeep.length} 篇\n`);

    if (postsToMigrate.length === 0) {
      console.log('✅ 没有发现需要迁移的文章，所有 markdown 文章都是纯文本格式！');
      return;
    }

    // 显示需要迁移的文章详情
    console.log('📝 需要迁移的文章列表（前 5 篇）：');
    postsToMigrate.slice(0, 5).forEach((post, index) => {
      console.log(`   ${index + 1}. [ID:${post.id}] ${post.title}`);
      console.log(`      内容预览: ${post.content.substring(0, 50)}...`);
    });

    if (postsToMigrate.length > 5) {
      console.log(`   ... 还有 ${postsToMigrate.length - 5} 篇\n`);
    } else {
      console.log();
    }

    // 执行迁移
    console.log('🚀 开始迁移...\n');

    let successCount = 0;
    let failCount = 0;
    const errors: Array<{ id: number; title: string; error: string }> = [];

    for (const post of postsToMigrate) {
      try {
        // 使用 update 语句直接更新，避免触发 TypeORM 的默认值逻辑
        await postRepository.update(post.id, { content_type: 'rich-text' });
        successCount++;
        console.log(`✓ [ID:${post.id}] ${post.title} → rich-text`);
      } catch (error) {
        failCount++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push({ id: post.id, title: post.title, error: errorMsg });
        console.log(`✗ [ID:${post.id}] ${post.title} → 迁移失败: ${errorMsg}`);
      }
    }

    console.log('\n========================================');
    console.log('📊 迁移完成统计');
    console.log('========================================');
    console.log(`✅ 成功迁移: ${successCount} 篇`);
    console.log(`❌ 迁移失败: ${failCount} 篇`);

    if (errors.length > 0) {
      console.log('\n❌ 失败详情：');
      errors.forEach(err => {
        console.log(`   [ID:${err.id}] ${err.title}`);
        console.log(`   错误: ${err.error}\n`);
      });
    }

    // 验证迁移结果
    console.log('\n🔍 验证迁移结果...');

    const updatedMarkdownPosts = await postRepository.count({
      where: { content_type: 'markdown' },
    });

    const updatedRichTextPosts = await postRepository.count({
      where: { content_type: 'rich-text' },
    });

    console.log(`✓ 当前 markdown 文章数: ${updatedMarkdownPosts}`);
    console.log(`✓ 当前 rich-text 文章数: ${updatedRichTextPosts}`);

    if (failCount === 0) {
      console.log('\n🎉 迁移全部成功！');
      console.log('💡 提示：刷新前端页面即可看到更新后的内容类型显示');
    } else {
      console.log('\n⚠️  部分文章迁移失败，请检查错误日志并手动处理');
    }

  } catch (error) {
    console.error('\n❌ 迁移失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
    }
  } finally {
    await dataSource.destroy();
    console.log('\n数据库连接已关闭');
  }
}

migratePostContentType();
