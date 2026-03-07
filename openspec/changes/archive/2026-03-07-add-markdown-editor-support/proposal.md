## 为什么

后端已实现文章类型支持（markdown 和 rich-text），但前端目前只支持富文本编辑。需要实现前端 Markdown 编辑功能，为用户提供更多编辑选择。

## 变更内容

- **新增**：ArtMarkdownEditor 组件（基于 md-editor-v3）
- **修改**：文章编辑页面，添加编辑器类型选择功能
- **修改**：文章列表页面，添加类型标识列
- **更新**：前端类型定义，添加 content_type 字段

## 功能 (Capabilities)

### 新增功能
- `markdown-editor`: Markdown 编辑器组件，提供基础的 Markdown 编辑和预览功能

### 修改功能
- `post-management`: 文章管理功能，支持选择和切换编辑器类型

## 影响

**前端代码**：
- `admin-web/src/components/core/forms/art-markdown-editor/` - 新增组件目录
- `admin-web/src/views/posts/edit.vue` - 修改编辑页面
- `admin-web/src/views/posts/list.vue` - 修改列表页面
- `admin-web/src/typings/api.d.ts` - 更新类型定义

**依赖项**：
- 使用已安装的 `md-editor-v3` (v4.17.0)
- 使用已安装的 `highlight.js` (v11.10.0) 进行代码高亮

**API**：
- 后端已支持 content_type 字段，无需修改后端 API
