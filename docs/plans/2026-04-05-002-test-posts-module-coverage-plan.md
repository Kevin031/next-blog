---
title: test: Posts 模块单元测试覆盖
type: test
status: completed
date: 2026-04-05
origin: docs/brainstorms/2026-04-05-post-module-tests-requirements.md
---

# Posts 模块单元测试覆盖

## 概述

为 Posts 模块编写完善的单元测试，覆盖 Service 层、Controller 层和 DTO 验证。使用 Mock Repository 策略隔离数据库依赖，参考 Auth 模块的测试模式，确保代码质量和可维护性。

## 问题陈述

文章模块（Posts）当前测试覆盖率严重不足：
- PostsService 覆盖率：16.66%（语句），14.81%（行）
- PostsController 覆盖率：72.72%（语句），70%（行）

这增加了代码重构和功能迭代的风险。需要为核心业务逻辑和关键错误路径建立完善的单元测试。

## 需求追溯

### 核心需求

**Service 层测试（PostsService）**
- R1. 成功创建不带标签的文章
- R2. 成功创建带标签的文章，标签计数正确增加
- R3. 创建重复标题的文章时抛出 ConflictException
- R4. 创建时传入无效标签 ID（不存在的标签）的处理
- R5. 使用默认分页参数（page=1, pageSize=10）查询
- R6. 使用自定义 page/pageSize 参数查询
- R7. 使用 current/size 别名参数查询
- R8. 按 tagId 筛选文章
- R9. 空数据集返回空列表
- R10. 查询存在的文章成功返回（包含标签关联）
- R11. 查询不存在的文章抛出 NotFoundException
- R12. 仅更新文章内容（不涉及标签）
- R13. 更新文章标签，新增标签计数增加
- R14. 更新文章标签，移除标签计数减少
- R15. 更新不存在的文章抛出 NotFoundException
- R16. 更新为重复标题的处理
- R17. 删除不带标签的文章
- R18. 删除带标签的文章，相关标签计数正确减少
- R19. 删除不存在的文章抛出 NotFoundException

**Controller 层测试（PostsController）**
- R27. create 端点从 request.user 正确提取 username
- R28. findAll 端点正确处理查询参数
- R29. findById 端点正确解析路径参数 id
- R30. update 端点正确处理参数并调用 service
- R31. remove 端点正确处理路径参数

**DTO 验证测试**
- R33. 验证 title 必填
- R34. 验证 content 必填
- R35. 验证 tagIds 必须是数组格式
- R36. UpdatePostDto 所有字段可选
- R37. UpdatePostDto content_type 枚举验证

### 成功标准
**覆盖率指标**：
- PostsService 测试覆盖率 >= 70%
- PostsController 维持当前覆盖率水平（约 72%）
- 所有关键业务路径有测试覆盖
- 所有错误分支有测试覆盖

**测试质量标准**：
- 每个测试都有明确的断言，验证具体行为（非空测试）
- 测试描述能够作为 API 文档使用
- 测试套件能够在已知 bug 引入时失败
- 测试可以独立运行，不依赖外部服务（数据库）
- 测试执行速度快（每个测试文件 < 5 秒）

## 范围边界

**包含**：
- PostsService 的所有公共方法测试
- PostsController 的路由和请求处理测试
- CreatePostDto 和 UpdatePostDto 的验证测试

**不包含**：
- 集成测试（真实数据库连接）
- 端到端测试（E2E）
- 性能测试
- 其他模块（Tags, User, Auth）的测试
- 私有方法 `updateTagsCount` 的直接测试（通过公共方法间接验证）

## 上下文与研究

### 相关代码和模式

**参考测试文件**：
- `server/src/auth/auth.service.spec.ts` - Service 层测试模式
- `server/src/auth/auth.controller.spec.ts` - Controller 层测试模式
- `server/src/posts/dto/create-post.dto.spec.ts` - DTO 验证测试模式

**目标测试文件**：
- `server/src/posts/posts.service.spec.ts` - 需要完善
- `server/src/posts/posts.controller.spec.ts` - 需要完善
- `server/src/posts/dto/update-post.dto.spec.ts` - 需要创建

### 现有测试约定

**Mock Repository 模式**：
```typescript
const mockPostRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  merge: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
};

const mockTagRepository = {
  findByIds: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  }),
};
```

**测试结构模式**：
- 使用嵌套 `describe` 按功能分组
- AAA 模式（Arrange-Act-Assert）
- 每个测试前使用 `beforeEach` 设置 mock
- 使用 `jest.clearAllMocks()` 清理 mock 状态
- 异步测试使用 `async/await`
- 异常测试使用 `rejects.toThrow()`

### 技术栈

**测试框架**：
- Jest + ts-jest
- @nestjs/testing
- class-validator（DTO 验证）

**运行命令**：
```bash
bun run test              # 运行所有测试
bun run test:watch        # 监视模式
bun run test:cov          # 生成覆盖率报告
```

## 关键技术决策

**使用 Mock Repository 策略**：所有数据库操作使用 Jest mock，不依赖真实数据库连接。这确保测试隔离性和执行速度。

**测试私有方法的策略**：不直接测试私有方法 `updateTagsCount`，而是通过公共方法（create、update、remove）的测试来验证其副作用（标签计数变化）。

**Controller 测试范围**：Controller 层测试主要验证参数传递和 Service 调用，不重复测试业务逻辑。业务逻辑应在 Service 层测试中覆盖。

**DTO 验证测试补充**：CreatePostDto 已有部分测试（content_type），需要补充 title、content、tagIds 的必填验证测试。UpdatePostDto 需要新建测试文件。

**测试数据组织**：使用清晰的 mock 数据对象，避免魔法值。每个测试套件使用 `beforeEach` 设置一致的初始状态。

## 实施优先级

为提高实施效率，建议按以下优先级顺序实施：

| 优先级 | 单元 | 理由 |
|--------|------|------|
| **P0** | 单元 1-5 (Service 层) | 核心业务逻辑，覆盖率最低（16.66%），最高风险 |
| **P1** | 单元 6 (Controller) | 薄包装层，依赖 P0，风险较低 |
| **P1** | 单元 7 (CreatePostDto) | 输入验证，已有部分测试，补充成本低 |
| **P2** | 单元 8 (UpdatePostDto) | 价值有限（所有字段可选），可延后 |

**建议执行顺序**：
1. 从单元 2（findAll）开始，因为最简单
2. 然后单元 3（findById），测试单一查询
3. 接着单元 1（create），引入标签逻辑
4. 再单元 4（update）和单元 5（remove），处理复杂边缘情况
5. 最后单元 6-8，Controller 和 DTO 测试

## 实现单元

- [ ] **单元 1: 完善 PostsService.create() 测试**

**目标**：覆盖文章创建的所有场景，包括成功路径、错误处理和标签关联逻辑。

**需求**：R1, R2, R3, R4

**优先级**：P0（核心业务逻辑，覆盖率最低）

**依赖**：无

**文件**：
- Modify: `server/src/posts/posts.service.spec.ts`

**方法**：
- 添加嵌套 describe 块组织测试
- 设置 mock 数据对象（mockPost、mockTags、mockCreatePostDto）
- 使用 beforeEach 清理 mock 状态

**测试场景**：
- **Happy path**:
  - 创建不带标签的文章成功，验证 save 调用和返回值
  - 创建带标签的文章成功，验证 findByIds、updateTagsCount、save 调用
- **Error path**:
  - 标题重复时抛出 ConflictException，验证异常类型和消息
  - 传入无效标签 ID（部分不存在）时，验证 findByIds 调用和逻辑处理
- **Integration**:
  - 验证标签 count 增加（通过 verify TagRepository.createQueryBuilder 调用）

**验证**：
- 运行 `bun run test posts.service.spec.ts` 通过
- 覆盖率报告中 create 方法达到 90%+ 覆盖

---

- [ ] **单元 2: 完善 PostsService.findAll() 测试**

**目标**：覆盖文章列表查询的所有场景，包括分页参数兼容性和标签筛选。

**需求**：R5, R6, R7, R8, R9

**优先级**：P0（核心业务逻辑）

**依赖**：无

**文件**：
- Modify: `server/src/posts/posts.service.spec.ts`

**方法**：
- 设置 createQueryBuilder 的链式调用 mock
- 验证分页元数据计算（totalPages、currentPage）

**测试场景**：
- **Happy path**:
  - 使用默认分页参数（page=1, pageSize=10）查询，返回正确分页信息
  - 使用自定义 page/pageSize 参数，验证 skip 和 take 计算
  - 使用 current/size 别名参数，验证参数映射正确
  - 按 tagId 筛选文章，验证 andWhere 调用
- **Edge case**:
  - 空数据集返回空列表，验证 list=[] 和 count=0
  - 最后一页数据不足 pageSize，验证计算正确

**验证**：
- 分页元数据计算正确（totalPages = Math.ceil(totalCount / pageSize)）
- createQueryBuilder 的链式调用验证

---

- [ ] **单元 3: 完善 PostsService.findById() 测试**

**目标**：覆盖根据 ID 查询文章的场景，包括成功路径和错误处理。

**需求**：R10, R11

**优先级**：P0（核心业务逻辑）

**依赖**：无

**文件**：
- Modify: `server/src/posts/posts.service.spec.ts`

**方法**：
- 设置 findOne mock 返回带标签的文章对象
- 验证 relations 配置

**测试场景**：
- **Happy path**:
  - 查询存在的文章成功，验证 findOne 调用（包含 relations: ['tags']）
  - 返回的文章包含关联的标签数组
- **Error path**:
  - 查询不存在的文章抛出 NotFoundException，验证异常类型和消息
  - findOne 返回 null 时触发异常

**验证**：
- findOne 调用包含 `relations: ['tags']`
- 异常消息匹配 "文章不存在"

---

- [ ] **单元 4: 完善 PostsService.update() 测试**

**目标**：覆盖文章更新的所有场景，包括内容更新、标签变更和错误处理。

**需求**：R12, R13, R14, R15, R16

**优先级**：P0（核心业务逻辑）

**依赖**：无

**文件**：
- Modify: `server/src/posts/posts.service.spec.ts`

**方法**：
- 设置 findOne 返回 existPost（带旧标签）
- 设置 findByIds 返回新标签
- 验证 merge、save、updateTagsCount 调用

**测试场景**：
- **Happy path**:
  - 仅更新文章内容（不涉及标签），验证 merge 和 save 调用，标签不变
  - 更新文章标签（新增标签），验证新标签 count 增加，旧标签不变
  - 更新文章标签（移除标签），验证旧标签 count 减少，新标签不变
  - 同时更新内容和标签，验证所有操作正确执行
- **Error path**:
  - 更新不存在的文章抛出 NotFoundException
  - 更新为重复标题抛出 ConflictException（如果有其他文章使用该标题）
- **Edge case**:
  - 传入空 tagIds 数组，验证移除所有旧标签
  - 传入相同 tagIds，验证不调用 updateTagsCount

**验证**：
- merge 保留原有数据
- updateTagsCount 计算正确的 delta（增减）

---

- [ ] **单元 5: 完善 PostsService.remove() 测试**

**目标**：覆盖文章删除的所有场景，包括成功路径、错误处理和标签计数更新。

**需求**：R17, R18, R19

**优先级**：P0（核心业务逻辑）

**依赖**：无

**文件**：
- Modify: `server/src/posts/posts.service.spec.ts`

**方法**：
- 设置 findOne 返回 existPost（带标签或不带标签）
- 验证 remove 和 updateTagsCount 调用

**测试场景**：
- **Happy path**:
  - 删除不带标签的文章，验证 remove 调用，不调用 updateTagsCount
  - 删除带标签的文章，验证 remove 调用和标签 count 减少
  - 标签计数更新使用正确的 tagIds 和 delta=-1
- **Error path**:
  - 删除不存在的文章抛出 NotFoundException，验证异常类型
- **Edge case**:
  - 文章有多个标签，验证所有标签 count 都减少
  - 标签 count 更新失败时的行为（如果适用）

**验证**：
- remove 调用使用正确的文章对象
- updateTagsCount 使用正确的 tagIds 数组

---

- [ ] **单元 6: 完善 PostsController 测试**

**目标**：覆盖 Controller 层的路由和请求处理，验证参数传递和 Service 调用。

**需求**：R27, R28, R29, R30, R31

**优先级**：P1（依赖 Service 层测试完成）

**依赖**：单元 1-5 完成（Service 层测试通过）

**文件**：
- Modify: `server/src/posts/posts.controller.spec.ts`

**方法**：
- Mock PostsService 的方法
- 创建 mock request 对象（包含 user）
- 验证 service 方法调用和参数传递

**测试场景**：
- **Happy path**:
  - POST /create 验证从 req.user 提取 username，调用 service.create
  - GET / 验证查询参数传递，调用 service.findAll
  - GET /:id 验证路径参数转换（string -> number），调用 service.findById
  - PATCH /:id 验证参数传递，调用 service.update
  - DELETE /:id 验证路径参数，调用 service.remove
- **Edge case**:
  - 传入无效的 id 参数（非数字字符串），验证转换处理

**验证**：
- 每个 controller 方法正确调用对应的 service 方法
- 参数类型转换正确（id: string -> number）
- request.user.username 正确提取

---

- [ ] **单元 7: 补充 CreatePostDto 验证测试**

**目标**：补充 CreatePostDto 的必填字段验证测试。

**需求**：R33, R34, R35

**优先级**：P1（输入验证，已有部分测试，补充成本低）

**依赖**：无

**文件**：
- Modify: `server/src/posts/dto/create-post.dto.spec.ts`

**方法**：
- 使用 class-validator 的 validate 函数
- 创建 DTO 实例并设置字段
- 验证错误类型和约束

**测试场景**：
- **Happy path**:
  - 所有必填字段都提供时验证通过
- **Error path**:
  - 缺少 title 时验证失败，验证 isNotEmpty 约束
  - 缺少 content 时验证失败，验证 isNotEmpty 约束
  - tagIds 传入非数组类型时验证失败，验证 isArray 约束
  - tagIds 传入 null 时验证通过（可选字段）
- **Edge case**:
  - title 为空字符串时验证失败
  - content 为空字符串时验证失败

**验证**：
- validate 返回的 errors 数组包含预期错误
- errors[0].constraints 包含正确的约束类型

---

- [ ] **单元 8: 创建 UpdatePostDto 验证测试**

**目标**：创建 UpdatePostDto 的验证测试文件。

**需求**：R36, R37

**优先级**：P2（价值有限，UpdatePostDto 使用 PartialType，所有字段可选，仅 content_type 枚举需要验证）

**依赖**：无

**文件**：
- Create: `server/src/posts/dto/update-post.dto.spec.ts`

**方法**：
- 参考 CreatePostDto 测试模式
- **注意**：UpdatePostDto 使用 `PartialType(CreatePostDto)`，所有字段可选。如果没有自定义验证规则，可以简化为仅测试 content_type 枚举验证。其他场景由 NestJS 的 PartialType 框架保障。
- 测试 content_type 枚举验证

**测试场景**：
- **Happy path**:
  - 所有字段都提供时验证通过
  - 所有字段都不提供时验证通过（全部可选）
  - 仅提供部分字段时验证通过
- **Error path**:
  - content_type 传入无效值时验证失败

**验证**：
- 测试文件可以独立运行
- 覆盖 UpdatePostDto 的所有验证规则

## 系统影响

**交互图**：
- PostsService 依赖 PostEntity 和 TagEntity 的 Repository
- PostsController 依赖 PostsService
- DTO 测试独立于其他层

**错误传播**：
- Service 层抛出的 ConflictException 和 NotFoundException 应正确传播到 Controller
- Controller 不应吞没或转换 Service 异常

**状态生命周期风险**：
- 无特殊状态管理风险
- 每个测试独立运行，使用 `jest.clearAllMocks()` 清理

**API 表面一致性**：
- 不修改公共 API
- 仅增加测试覆盖

**集成覆盖**：
- 单元测试不覆盖跨层集成
- 集成场景应在 E2E 测试中覆盖

**不变量**：
- 文章-标签关联通过 tagIds 数组维护
- 标签 count 通过 updateTagsCount 保持一致性
- 公开端点（GET /, GET /:id）无需认证

## 风险与依赖

| 风险 | 缓解措施 |
|------|----------|
| Mock Repository 设置复杂，链式调用容易出错 | 参考 auth.service.spec.ts 的成熟模式，使用 `mockReturnThis()` |
| 标签关联逻辑测试可能遗漏边缘情况 | 重点关注 tagIds 为空、全部替换、部分替换的场景 |
| 测试执行速度可能变慢 | 使用 jest.clearAllMocks() 确保隔离，避免不必要的数据库 mock |
| DTO 验证测试可能重复框架功能 | 仅测试自定义验证规则，不重复测试 class-validator 本身 |
| Controller 测试可能与 Service 测试重复 | Controller 测试聚焦参数传递，不重复测试业务逻辑 |

## 文档/运维说明

**开发者文档**：
- 无需更新开发者文档（测试内部实现）

**CI/CD**：
- 测试已在 CI 中配置（通过 bun run test）
- 新增测试不应延长 CI 执行时间超过 2 分钟

**监控**：
- 无监控影响（仅测试代码）

## 源和参考

**来源文档**：[Post Module Tests Requirements](../brainstorms/2026-04-05-post-module-tests-requirements.md)

**相关代码**：
- `server/src/posts/posts.service.ts` - Service 实现
- `server/src/posts/posts.controller.ts` - Controller 实现
- `server/src/auth/auth.service.spec.ts` - Service 测试模式
- `server/src/posts/dto/create-post.dto.spec.ts` - DTO 测试模式

**外部参考**：
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [class-validator Documentation](https://github.com/typestack/class-validator)
