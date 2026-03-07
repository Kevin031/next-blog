# 提案：修复文章类型默认值

## 为什么

当前文章系统存在数据一致性问题：前端默认使用富文本编辑器（rich-text），但后端数据库实体和 API DTO 都使用了 markdown 作为默认值，导致前端发送的数据在某些情况下被降级为 markdown 类型，与用户期望不符。这个问题影响数据准确性，需要统一默认值为 rich-text。

## 变更内容

- 修改数据库实体 `PostEntity` 的 `content_type` 字段默认值从 `'markdown'` 改为 `'rich-text'`
- 修改 API DTO `CreatePostDto` 的 `@ApiProperty` 装饰器默认值从 `'markdown'` 改为 `'rich-text'`
- 在 DTO 中添加运行时默认值处理，确保未传参数时使用 `'rich-text'`
- 处理数据库中已存在的错误数据（可选的数据迁移）

## 功能 (Capabilities)

### 新增功能
- `article-content-type-management`: 文章内容类型管理，包括默认值设置、类型验证和数据一致性保证

### 修改功能
（无现有规范需要修改，这是一个新系统的规范问题）

## 影响

### 代码影响
- `server/src/posts/entities/post.entity.ts` - 数据库实体定义
- `server/src/posts/dto/create-post.dto.ts` - 创建文章 DTO
- `admin-web/src/views/posts/edit.vue` - 前端编辑页面（已有正确默认值，无需修改）
- 可能需要添加数据迁移脚本来修复历史数据

### API 影响
- POST `/posts/create` - 默认值变更不会破坏 API，因为字段是可选的
- Swagger 文档会更新默认值显示

### 数据库影响
- `posts` 表的 `content_type` 列默认值变更
- 已有数据的 `content_type` 字段需要更新为正确值（建议但不强制）

### 用户影响
- 用户体验无感知变更（符合用户期望）
- 新创建的文章将正确使用 rich-text 类型
- 历史数据可能需要管理员手动修正
