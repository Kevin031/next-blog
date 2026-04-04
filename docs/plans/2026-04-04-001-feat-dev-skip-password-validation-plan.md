---
title: feat: 开发环境跳过密码验证
type: feat
status: active
date: 2026-04-04
---

# feat: 开发环境跳过密码验证

## Overview

在开发环境下，通过环境变量控制跳过密码验证，允许输入任何密码登录，提高开发效率。此功能仅用于开发和测试环境，生产环境强制校验密码。

## Problem Frame

开发人员频繁需要登录测试不同账号，每次都需要输入正确密码影响开发效率。需要在开发环境提供便利的登录方式，同时确保生产环境的安全性不受影响。

## Requirements Trace

- R1. 开发环境下，输入任何密码都能成功登录（用户必须存在且未被禁用）
- R2. 生产环境必须强制校验密码，不能受任何配置影响
- R3. 通过环境变量控制是否跳过密码验证
- R4. 跳过密码验证时，应在日志中记录（便于审计）

## Scope Boundaries

- 不修改用户注册逻辑
- 不修改账号禁用检查逻辑
- 不修改 JWT token 生成和验证逻辑
- 仅影响登录接口的密码验证环节

## Context & Research

### Relevant Code and Patterns

- `server/src/auth/auth.service.ts` - 认证服务，包含 `login` 方法
- `server/src/auth/auth.controller.ts` - 认证控制器
- `server/.env.example` - 环境变量示例文件
- 项目使用 `@nestjs/config` 管理环境变量（需验证）
- 当前使用 `bcryptjs.compare` 进行密码验证

### Institutional Learnings

项目尚未建立 `docs/solutions/` 目录，无相关学习文档。

### External References

无外部参考需求 - 这是一个简单的环境配置功能，本地模式已足够清晰。

## Key Technical Decisions

- **使用独立的环境变量 `SKIP_PASSWORD_VALIDATION`**: 相比直接依赖 `NODE_ENV`，独立的开关更明确，避免误判。只有在显式设置为 `true` 时才跳过验证。
- **使用 ConfigService 注入而非 process.env**: 遵循 NestJS 最佳实践，通过依赖注入 ConfigService 访问环境变量，保持架构一致性和可测试性。
- **保留用户存在性和禁用状态检查**: 即使跳过密码验证，仍然验证用户必须存在且未被禁用，避免测试无意义的场景。
- **使用 NestJS 内置 Logger**: 使用 `new Logger(AuthService.name)` 进行日志记录，保持框架一致性和结构化日志能力。

## Open Questions

### Resolved During Planning

- **如何区分开发和生产环境？**: 使用独立的环境变量 `SKIP_PASSWORD_VALIDATION`，而不是依赖 `NODE_ENV`，更明确且不易出错。

### Deferred to Implementation

- **日志记录的格式和级别**: 实现时根据项目现有的日志库选择合适的级别（如 `warn`）和格式。

## Implementation Units

- [ ] **Unit 0: 添加环境变量类型定义（可选）**

**Goal:** 为 ConfigService 添加类型定义，确保类型安全。

**Requirements:** R3

**Dependencies:** None

**Files:**
- Create: `server/src/config/interfaces/env-config.interface.ts` (或类似路径)
- Modify: `server/src/app.module.ts`

**Approach:**
1. 创建环境变量接口定义 `SKIP_PASSWORD_VALIDATION?: string`
2. 在 ConfigModule.forRoot 中使用 validate 函数（如果尚未配置）
3. 为 ConfigService 添加泛型参数：`ConfigService<EnvConfig>`

**Patterns to follow:**
- 遵循 @nestjs/config 最佳实践
- 如果项目已有环境变量验证模式，遵循现有模式

**Test scenarios:**
- Test expectation: none -- 类型定义，无行为测试

**Verification:**
- TypeScript 类型检查通过
- configService.get() 返回正确的类型而非 any

- [ ] **Unit 2: 修改认证服务添加密码验证开关**

**Goal:** 在认证服务的 login 方法中添加环境变量检查，根据配置决定是否跳过密码验证。

**Requirements:** R1, R2, R3, R4

**Dependencies:** Unit 0 (如果选择添加类型定义)

**Files:**
- Modify: `server/src/auth/auth.service.ts`
- Modify: `server/src/app.module.ts` (可能需要更新 ConfigModule 配置)
- Test: `server/src/auth/auth.service.spec.ts`

**Approach:**
1. 在 AuthService 构造函数中注入 ConfigService
2. 在 `login` 方法中，使用 `configService.get<string>('SKIP_PASSWORD_VALIDATION') === 'true'` 检查配置
3. 如果为 true，跳过 `bcryptjs.compare` 调用，但仍检查用户存在性和禁用状态
4. 使用 NestJS Logger 记录警告日志：`this.logger.warn('跳过密码验证', { username: loginData.username })`
5. 创建完整的测试模块，mock 所有依赖：
   - ConfigService（返回不同的 SKIP_PASSWORD_VALIDATION 值）
   - authRepository 和 userRepository（使用 TypeORM mock repository）
   - RedisService, JwtService, DataSource（使用 Jest mock）
6. 编写单元测试，覆盖两种场景（跳过验证和正常验证）

**Patterns to follow:**
- 保持现有的错误处理模式（`BadRequestException`）
- 遵循现有的代码风格和不可变原则

**Test scenarios:**
- **Happy path behaviors:**
  - Scenario: SKIP_PASSWORD_VALIDATION=true，输入错误密码，用户存在且未禁用 -> 登录成功，返回 token，并记录警告日志
  - Scenario: SKIP_PASSWORD_VALIDATION=false，输入正确密码，用户存在且未禁用 -> 登录成功，返回 token
- **Edge cases:**
  - Scenario: SKIP_PASSWORD_VALIDATION=true，用户不存在 -> 返回"用户名或密码错误"
  - Scenario: SKIP_PASSWORD_VALIDATION=true，用户被禁用 -> 返回"账号已被禁用"
  - Scenario: SKIP_PASSWORD_VALIDATION 未设置 -> 执行正常密码验证
- **Error and failure paths:**
  - Scenario: SKIP_PASSWORD_VALIDATION=false，输入错误密码 -> 返回"用户名或密码错误"

**Verification:**
- 单元测试通过，覆盖所有场景
- 手动测试：设置 `SKIP_PASSWORD_VALIDATION=true`，使用错误密码能成功登录
- 手动测试：设置 `SKIP_PASSWORD_VALIDATION=false`，使用错误密码登录失败

- [ ] **Unit 3: 更新环境配置文件**

**Goal:** 在环境变量示例文件中添加 `SKIP_PASSWORD_VALIDATION` 配置项及说明。

**Requirements:** R3

**Dependencies:** None

**Files:**
- Modify: `server/.env.example`
- Modify: `server/.env` (开发环境配置)

**Approach:**
1. 在 `.env.example` 中添加 `SKIP_PASSWORD_VALIDATION=true` 并注释说明用途
2. 在开发环境的 `.env` 文件中启用此配置
3. 确保 `.env` 文件不会被提交到版本控制（已在 `.gitignore` 中）

**Patterns to follow:**
- 遵循现有的环境变量配置格式
- 添加清晰的注释说明

**Test scenarios:**
- Test expectation: none -- 配置文件更新，无行为测试

**Verification:**
- `.env.example` 文件包含新配置项及说明
- 开发环境 `.env` 文件已启用配置

- [ ] **Unit 4: 更新项目文档**

**Goal:** 在项目文档中记录开发环境跳过密码验证的使用说明和安全注意事项。

**Requirements:** R3, R4

**Dependencies:** Unit 2

**Files:**
- Modify: `CLAUDE.md`

**Approach:**
1. 在 `CLAUDE.md` 的"备忘"或"常见问题"部分添加开发环境免密登录说明
2. 明确说明此功能仅用于开发和测试环境
3. 提醒生产环境必须禁用此功能

**Patterns to follow:**
- 遵循现有的文档格式

**Test scenarios:**
- Test expectation: none -- 文档更新，无行为测试

**Verification:**
- `CLAUDE.md` 包含清晰的使用说明和安全提醒

## System-Wide Impact

- **Interaction graph:** 无跨模块影响，仅修改认证服务的密码验证逻辑
- **Error propagation:** 保持现有的异常处理模式
- **State lifecycle risks:** 无状态生命周期风险
- **API surface parity:** 仅影响登录接口，不影响其他认证相关接口
- **Integration coverage:** 单元测试足以覆盖，无需集成测试
- **Unchanged invariants:** JWT token 生成逻辑、用户注册逻辑、账号禁用检查逻辑均保持不变

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| 误将 `SKIP_PASSWORD_VALIDATION=true` 提交到版本控制 | `.env` 文件已在 `.gitignore` 中，仅提交 `.env.example` |
| 生产环境误启用此功能 | 文档中明确警告，代码审查时检查生产环境配置 |
| 跳过验证时无日志记录 | 实现时添加警告日志 |

## Documentation / Operational Notes

- 在 `CLAUDE.md` 中添加使用说明
- 生产环境部署时，确保 `SKIP_PASSWORD_VALIDATION` 未设置或设置为 `false`
- 建议在 CI/CD 流程中添加检查，确保生产环境配置正确

## Sources & References

- Related code: `server/src/auth/auth.service.ts`
