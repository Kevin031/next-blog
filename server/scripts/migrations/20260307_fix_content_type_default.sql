-- 数据库迁移脚本：修复文章内容类型默认值
-- 日期：2026-03-07
-- 描述：将 posts 表的 content_type 列默认值从 'markdown' 改为 'rich-text'

-- 使用事务确保迁移的原子性
START TRANSACTION;

-- 修改 posts 表 content_type 列的默认值
ALTER TABLE posts ALTER COLUMN content_type SET DEFAULT 'rich-text';

-- 验证修改是否成功
SELECT
    COLUMN_NAME,
    COLUMN_DEFAULT
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'posts'
    AND COLUMN_NAME = 'content_type';

-- 提交事务
COMMIT;

-- 回滚脚本（如果需要回滚）：
-- ALTER TABLE posts ALTER COLUMN content_type SET DEFAULT 'markdown';
