# 任务清单：修复文章类型默认值

## 1. 代码实现

- [x] 1.1 修改数据库实体默认值
  - 文件：`server/src/posts/entities/post.entity.ts`
  - 将 `@Column` 装饰器中的 `default: 'markdown'` 改为 `default: 'rich-text'`
  - 验证：检查文件内容确保默认值已更新

- [x] 1.2 修改 API DTO 文档默认值
  - 文件：`server/src/posts/dto/create-post.dto.ts`
  - 将 `@ApiProperty` 装饰器中的 `default: 'markdown'` 改为 `default: 'rich-text'`
  - 验证：检查 Swagger 文档是否显示正确的默认值

- [x] 1.3 添加 DTO 运行时默认值
  - 文件：`server/src/posts/dto/create-post.dto.ts`
  - 为 `content_type` 字段添加运行时默认值：`readonly content_type: string = 'rich-text'`
  - 验证：测试未传递 `content_type` 参数时是否使用默认值

## 2. 测试验证

- [x] 2.1 更新单元测试
  - 文件：`server/src/posts/dto/create-post.dto.spec.ts`
  - 更新测试用例中的默认值期望从 `'markdown'` 改为 `'rich-text'`
  - 验证：运行测试确保所有测试通过

- [x] 2.2 集成测试验证默认值
  - 测试场景：创建文章时不传递 `content_type` 参数
  - 验证：新创建的文章 `content_type` 字段为 `'rich-text'`
  - 测试场景：创建文章时传递 `content_type: 'markdown'`
  - 验证：使用用户指定的值而非默认值

- [x] 2.3 验证 Swagger API 文档
  - 启动后端服务并访问 `/docs`
  - 检查 POST `/posts/create` 接口的 `content_type` 字段默认值
  - 验证：显示为 `'rich-text'` 而非 `'markdown'`

## 3. 数据库验证

- [x] 3.1 验证开发环境表结构更新
  - 在开发环境重启后端服务
  - 检查 `posts` 表的 `content_type` 列默认值
  - 验证：数据库默认值为 `'rich-text'`

- [x] 3.2 编写生产环境数据库迁移 SQL
  - 创建 SQL 迁移脚本文件
  - 包含：`ALTER TABLE posts ALTER COLUMN content_type SET DEFAULT 'rich-text';`
  - 验证：SQL 语法正确，在测试环境执行成功

## 4. 可选：数据迁移

- [x] 4.1 创建历史数据迁移脚本
  - 创建 SQL 脚本文件用于修正历史错误数据
  - 使用启发式规则：`UPDATE posts SET content_type = 'rich-text' WHERE content_type = 'markdown' AND content LIKE '%<%>' AND content LIKE '%>%';`
  - 验证：脚本语法正确

- [x] 4.2 提供数据备份说明
  - 创建文档说明迁移前的备份步骤
  - 包含：`mysqldump` 备份命令
  - 验证：文档清晰易懂

- [x] 4.3 提供回滚方案
  - 创建回滚 SQL 脚本
  - 说明回滚条件和步骤
  - 验证：回滚方案可行

## 5. 文档和清理

- [x] 5.1 更新 API 文档注释
  - 检查所有与 `content_type` 相关的注释
  - 确保描述准确反映新的默认值
  - 验证：注释与代码实现一致

- [x] 5.2 代码检查和格式化
  - 运行 `bun run lint` 检查代码风格
  - 运行 `bun run type-check` 检查类型错误
  - 修复发现的所有问题
  - 验证：无 linting 或类型错误

- [x] 5.3 提交代码变更
  - 使用规范的提交信息：`fix: 修复文章内容类型默认值从 markdown 改为 rich-text`
  - 包含所有相关文件的变更
  - 验证：提交成功

## 6. 部署准备

- [x] 6.1 准备部署清单
  - 列出部署顺序：代码变更 → 数据库更新（可选数据迁移）
  - 说明每个步骤的验证点
  - 验证：清单完整可执行

- [x] 6.2 准备回滚清单
  - 列出回滚步骤
  - 包含代码回滚和数据库回滚方法
  - 验证：回滚方案可靠

## 验收标准

所有任务完成后，以下条件应该满足：

1. ✅ 新创建的文章（未指定 `content_type`）默认使用 `'rich-text'` 类型
2. ✅ Swagger API 文档显示正确的默认值 `'rich-text'`
3. ✅ 数据库表结构默认值为 `'rich-text'`
4. ✅ 显式传递 `content_type: 'markdown'` 时正常工作
5. ✅ 所有现有测试通过，新增测试覆盖默认值场景
6. ✅ 代码通过 linting 和类型检查
7. ✅ 提供完整的数据迁移脚本（可选执行）
8. ✅ 提供清晰的部署和回滚文档
