---
date: 2026-04-05
topic: post-module-tests
---

# 文章模块单元测试

## Problem Frame

文章模块（Posts）目前测试覆盖严重不足，Service 和 Controller 层仅有一个定义测试。这增加了代码重构和功能迭代的风险。需要为核心业务逻辑和关键错误路径建立完善的单元测试，确保代码质量和可维护性。

## Requirements

### Service 层测试 (PostsService)

**创建文章 (create)**
- R1. 成功创建不带标签的文章
- R2. 成功创建带标签的文章，标签计数正确增加
- R3. 创建重复标题文章时抛出 ConflictException
- R4. 创建时传入无效标签 ID（不存在的标签）的处理

**查询文章 (findAll)**
- R5. 使用默认分页参数（page=1, pageSize=10）查询
- R6. 使用自定义 page/pageSize 参数查询
- R7. 使用 current/size 别名参数查询
- R8. 按 tagId 筛选文章
- R9. 空数据集返回空列表

**查询单篇文章 (findById)**
- R10. 查询存在的文章成功返回（包含标签关联）
- R11. 查询不存在的文章抛出 NotFoundException

**更新文章 (update)**
- R12. 仅更新文章内容（不涉及标签）
- R13. 更新文章标签，新增标签计数增加
- R14. 更新文章标签，移除标签计数减少
- R15. 更新不存在的文章抛出 NotFoundException
- R16. 更新为重复标题的处理

**删除文章 (remove)**
- R17. 删除不带标签的文章
- R18. 删除带标签的文章，相关标签计数正确减少
- R19. 删除不存在的文章抛出 NotFoundException

**私有方法 (updateTagsCount)**
- R20. 正确增加标签计数（delta > 0）
- R21. 正确减少标签计数（delta < 0）

### Controller 层测试 (PostsController)

**路由定义**
- R22. POST /create - 创建文章
- R23. GET / - 获取文章列表
- R24. GET /:id - 获取单篇文章
- R25. PATCH /:id - 更新文章
- R26. DELETE /:id - 删除文章

**请求处理**
- R27. create 端点从 request.user 正确提取 username
- R28. findAll 端点正确处理查询参数
- R29. findById 端点正确解析路径参数 id
- R30. update 端点正确处理参数并调用 service
- R31. remove 端点正确处理路径参数

**公开路由**
- R32. 验证 findAll 和 findById 使用 @Public() 装饰器

### DTO 验证增强

**CreatePostDto**
- R33. 验证 title 必填
- R34. 验证 content 必填
- R35. 验证 tagIds 必须是数组格式

**UpdatePostDto**
- R36. 所有字段可选（PartialType）
- R37. 验证 content_type 枚举值

## Success Criteria

- PostsService 和 PostsController 测试覆盖率 >= 70%
- 所有关键业务路径有测试覆盖
- 所有错误分支有测试覆盖
- 测试可以独立运行，不依赖外部服务（数据库）
- 测试执行速度快（每个测试文件 < 5 秒）

## Scope Boundaries

- **不包含**：集成测试（真实数据库连接）
- **不包含**：端到端测试（E2E）
- **不包含**：性能测试
- **不包含**：其他模块（Tags, User, Auth）的测试

## Key Decisions

- **使用 Mock Repository**：所有数据库操作使用 Jest mock，不依赖真实数据库连接
- **测试隔离**：每个测试用例独立运行，不依赖其他测试的状态
- **遵循现有模式**：参考 Auth 模块的测试风格和结构

## Dependencies / Assumptions

- 项目使用 Jest 作为测试框架
- 使用 @nestjs/testing 提供的测试工具
- 已有 CreatePostDto 和 UpdatePostDto 的验证测试

## Next Steps

→ `/ce:plan` 生成详细的测试实现计划
