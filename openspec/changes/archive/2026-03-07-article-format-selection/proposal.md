## 为什么

当前博客系统的文章编辑仅支持单一的内容格式，缺乏灵活性。不同的用户可能偏好使用富文本编辑器或 Markdown 编辑器来撰写文章。同时，前端在展示文章时需要知道内容的格式类型，以便正确渲染。这项变更将为文章系统提供格式选择功能，提升用户体验。

## 变更内容

- 在 PostEntity 中新增 `content_type` 字段，用于存储文章内容格式（rich-text 或 markdown）
- 在 CreatePostDto 和 UpdatePostDto 中新增 `content_type` 字段，允许创建和更新时指定格式
- 在 GetPostDto 中新增 `content_type` 字段，返回时标注格式类型
- 添加数据验证，确保 content_type 只能是有效值
- 数据库迁移：添加 content_type 列，现有数据默认为 markdown
- 文章列表接口自动包含 content_type 字段（通过 PostEntity）

## 功能 (Capabilities)

### 新增功能
- `article-format`: 支持文章编辑时选择富文本或 Markdown 格式，并在获取文章详情时返回格式类型

### 修改功能
- 无现有功能的需求变更

## 影响

**受影响的代码：**
- `server/src/posts/entities/post.entity.ts` - 添加 content_type 字段
- `server/src/posts/dto/create-post.dto.ts` - 添加 content_type 字段
- `server/src/posts/dto/update-post.dto.ts` - 添加 content_type 字段
- `server/src/posts/dto/get-post.dto.ts` - 添加 content_type 字段
- `server/src/posts/posts.service.ts` - 可能需要调整服务逻辑

**受影响的 API：**
- POST /posts - 创建文章接口
- PUT /posts/:id - 更新文章接口
- GET /posts/:id - 获取文章详情接口
- GET /posts - 获取文章列表接口

**受影响的系统：**
- MySQL 数据库 - 需要添加新列
- 前端 - 可能需要调整文章编辑和展示组件

**依赖项：**
- 无新增外部依赖
