## 1. 数据层修改

- [x] 1.1 在 PostEntity 中添加 content_type 字段
  - 类型：VARCHAR(20)
  - 默认值：'markdown'
  - 位置：server/src/posts/entities/post.entity.ts

- [x] 1.2 验证数据库自动同步功能
  - 确认 TypeORM synchronize 配置为 true
  - 重启 NestJS 服务，验证 content_type 列是否自动创建
  - 检查现有数据是否自动填充默认值 'markdown'

## 2. DTO 层修改

- [x] 2.1 在 CreatePostDto 中添加 content_type 字段
  - 类型：string
  - 可选字段（@IsOptional）
  - 使用 @IsIn(['markdown', 'rich-text']) 验证器
  - 添加 @ApiProperty 文档说明
  - 位置：server/src/posts/dto/create-post.dto.ts

- [x] 2.2 在 UpdatePostDto 中添加 content_type 字段
  - 类型：string
  - 可选字段
  - 使用 @IsIn(['markdown', 'rich-text']) 验证器
  - 添加 @ApiProperty 文档说明
  - 位置：server/src/posts/dto/update-post.dto.ts

- [x] 2.3 在 GetPostDto 中添加 content_type 字段
  - 类型：string
  - 添加 @ApiProperty 文档说明
  - 位置：server/src/posts/dto/get-post.dto.ts

## 3. 服务层调整

- [x] 3.1 验证 PostsService 创建逻辑
  - 测试创建文章时未提供 content_type 是否使用默认值
  - 测试创建文章时提供 content_type 是否正确保存

- [x] 3.2 验证 PostsService 更新逻辑
  - 测试更新文章时修改 content_type 是否正确保存

- [x] 3.3 验证 PostsService 查询逻辑
  - 测试获取文章详情时是否返回 content_type 字段

## 4. API 文档更新

- [x] 4.1 更新 Swagger 文档
  - 访问 http://localhost:3000/docs
  - 确认创建文章接口包含 content_type 字段说明
  - 确认更新文章接口包含 content_type 字段说明
  - 确认获取文章详情接口包含 content_type 字段说明

## 5. 功能测试

- [x] 5.1 测试创建文章指定格式类型
  - 使用 POST /posts 创建文章，设置 content_type 为 'markdown'
  - 验证响应中 content_type 正确

- [x] 5.2 测试创建文章未指定格式类型
  - 使用 POST /posts 创建文章，不提供 content_type
  - 验证响应中 content_type 为 'markdown'

- [x] 5.3 测试更新文章格式类型
  - 使用 PUT /posts/:id 更新文章，修改 content_type 为 'rich-text'
  - 验证响应中 content_type 更新正确

- [x] 5.4 测试非法格式类型验证
  - 尝试使用非法值创建文章（如 content_type: 'html'）
  - 验证系统返回验证错误

- [x] 5.5 测试获取文章详情
  - 使用 GET /posts/:id 获取文章详情
  - 验证响应中包含 content_type 字段

- [x] 5.6 测试获取文章列表
  - 使用 GET /posts 获取文章列表
  - 验证响应中每篇文章都包含 content_type 字段
  - 验证不同格式类型的文章都能正确显示格式类型
