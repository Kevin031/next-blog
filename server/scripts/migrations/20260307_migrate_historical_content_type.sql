-- 历史数据迁移脚本：修正错误的内容类型
-- 日期：2026-03-07
-- 描述：将 content_type 为 'markdown' 但内容包含 HTML 标签的文章修正为 'rich-text'
-- 注意：此脚本谨慎执行，仅更新明显错误的数据

-- 使用事务确保迁移的原子性
START TRANSACTION;

-- 创建临时表记录将要更新的数据（用于审查）
CREATE TEMPORARY TABLE IF NOT EXISTS posts_to_migrate AS
SELECT
    id,
    title,
    content_type,
    SUBSTRING(content, 1, 100) as content_preview
FROM
    posts
WHERE
    content_type = 'markdown'
    AND (
        (content LIKE '%<%' AND content LIKE '%>%')  -- 包含 HTML 标签
        OR content LIKE '%<p>%'                     -- 包含段落标签
        OR content LIKE '%<div>%'                    -- 包含 div 标签
        OR content LIKE '%<span>%'                   -- 包含 span 标签
        OR content LIKE '%<strong>%'                  -- 包含 strong 标签
        OR content LIKE '%<em>%'                     -- 包含 em 标签
        OR content LIKE '%<img %%'                    -- 包含图片标签
        OR content LIKE '%<a %%'                      -- 包含链接标签
        OR content LIKE '%style=%'                     -- 包含样式属性
        OR content LIKE '%class=%'                     -- 包含 class 属性
    );

-- 显示将要更新的数据（审查用）
SELECT COUNT(*) as total_posts_to_migrate FROM posts_to_migrate;
SELECT * FROM posts_to_migrate LIMIT 10;

-- 执行实际的数据更新
UPDATE posts
SET content_type = 'rich-text'
WHERE content_type = 'markdown'
  AND (
      (content LIKE '%<%' AND content LIKE '%>%')  -- 包含 HTML 标签
      OR content LIKE '%<p>%'                     -- 包含段落标签
      OR content LIKE '%<div>%'                    -- 包含 div 标签
      OR content LIKE '%<span>%'                   -- 包含 span 标签
      OR content LIKE '%<strong>%'                  -- 包含 strong 标签
      OR content LIKE '%<em>%'                     -- 包含 em 标签
      OR content LIKE '%<img %%'                    -- 包含图片标签
      OR content LIKE '%<a %%'                      -- 包含链接标签
      OR content LIKE '%style=%'                     -- 包含样式属性
      OR content LIKE '%class=%'                     -- 包含 class 属性
  );

-- 验证更新结果
SELECT COUNT(*) as updated_posts
FROM posts
WHERE content_type = 'rich-text'
  AND (
      (content LIKE '%<%' AND content LIKE '%>%')  -- 包含 HTML 标签
      OR content LIKE '%<p>%'                     -- 包含段落标签
      OR content LIKE '%<div>%'                    -- 包含 div 标签
      OR content LIKE '%<span>%'                   -- 包含 span 标签
      OR content LIKE '%<strong>%'                  -- 包含 strong 标签
      OR content LIKE '%<em>%'                     -- 包含 em 标签
      OR content LIKE '%<img %%'                    -- 包含图片 标签
      OR content LIKE '%<a %%'                      -- 包含链接标签
      OR content LIKE '%style=%'                     -- 包含样式属性
      OR content LIKE '%class=%'                     -- 包含 class 属性
  );

-- 提交事务（确认无误后移除此注释）
-- COMMIT;
-- 回滚事务（如果发现问题）
-- ROLLBACK;

-- 清理临时表
DROP TEMPORARY TABLE IF EXISTS posts_to_migrate;

-- 注意事项：
-- 1. 执行前务必备份数据库
-- 2. 先在测试环境验证迁移结果
-- 3. 检查 SELECT * FROM posts_to_migrate LIMIT 10 的结果确认数据无误
-- 4. 确认无误后，取消 COMMIT 的注释并执行
-- 5. 如果发现问题，使用 ROLLBACK 回滚

-- 回滚方案：
-- 如果发现迁移错误，可以执行以下命令回滚：
-- 1. 从备份恢复数据库
-- 或者
-- 2. 手动修正个别错误数据
