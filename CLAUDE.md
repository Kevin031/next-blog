# CLAUDE.md

本文件为 Claude Code 提供项目特定的架构决策和开发约定。

## 项目结构

```
admin-web/      # Vue 3 管理后台
server/         # NestJS 后端 API
lite-server/    # Hono 轻量服务
```

**服务地址**:
| 服务 | 地址 | 说明 |
|------|------|------|
| admin-web | http://localhost:5173 | 管理后台 |
| server | http://localhost:3000 | API 服务 |
| swagger | http://localhost:3000/docs | API 文档 |
| lite-server | http://localhost:3001 | Hono 服务 |

## 必须遵循

**认证机制**:
- 全局 JWT Guard，所有接口默认需要认证
- 公开接口使用 `@Public()` 装饰器
- Token 通过 `Authorization: Bearer <token>` 传递

**环境变量**:
- `server/.env`: 数据库配置 (DB_HOST, DB_PORT, DB_USER, DB_PASSWD, DB_DATABASE)
- `admin-web/.env.development`: VITE_PORT, VITE_API_URL, VITE_API_PROXY_URL
- 敏感信息禁止硬编码，必须使用环境变量

**数据库约定**:
- TypeORM `synchronize: true` 自动创建表结构
- 实体位于 `server/src/*/entities/`
- 实体修改会自动同步到数据库

**路径别名** (admin-web):
- `@` → `src/`
- `@views` → `src/views/`
- `@utils` → `src/utils/`
- `@stores` → `src/store/`

**代码风格**:
- ESLint + Prettier 自动格式化
- admin-web 额外使用 stylelint
- 提交前自动运行 lint-staged
- 使用 `bun run commit` 规范化提交

**不可变数据**:
- 始终创建新对象，禁止修改现有对象
- 使用 spread 操作符进行不可变更新

**错误处理**:
- 显式处理所有错误
- 用户友好的错误信息
- 服务器端记录详细错误上下文

**输入验证**:
- 在系统边界验证所有输入
- 后端使用 class-validator
- 前端使用 Zod

## 反模式

**禁止使用**:
- ❌ 硬编码密钥、密码、API Key
- ❌ 直接修改对象/数组 (mutation)
- ❌ `any` 类型 (使用 `unknown` + 类型收窄)
- ❌ `console.log` (使用日志库)
- ❌ 深层嵌套 (>4 层)
- ❌ 过长函数 (>50 行)
- ❌ 生产环境使用 `synchronize: true`

**数据库反模式**:
- ❌ SQL 注入 (使用参数化查询)
- ❌ N+1 查询 (使用 JOIN 或 batching)
- ❌ 无限制查询 (添加 LIMIT)

**安全反模式**:
- ❌ XSS (未转义用户输入)
- ❌ CSRF (未启用保护)

## 常用命令

```bash
# 开发
bun run dev                    # 启动所有工作区
bun run dev:admin-web          # 仅启动前端
bun run dev:server             # 仅启动后端

# 构建
bun run build                  # 构建所有工作区

# 代码质量
bun run lint                   # Lint 所有工作区
bun run type-check             # TypeScript 类型检查

# NestJS 特定
cd server
bunx --bun nest start --watch  # 开发模式
bun run seed:super-admin       # 创建超级管理员

# Git 提交
bun run commit                 # Commitizen 规范化提交
```

## 备忘

**自动导入** (admin-web):
- 组件从 `src/components/` 自动导入
- Vue API (vue, vue-router, pinia, @vueuse/core) 自动导入
- Element Plus 组件按需导入

**API 代理** (admin-web):
- 开发环境: `/api` → `VITE_API_PROXY_URL`
- 生产环境: 通过 `VITE_API_URL` 配置

**全局拦截器** (server):
- `TransformInterceptor` - 统一响应格式
- `HttpExceptionFilter` - 全局错误处理

**主要实体**:
- `posts/entities/post.entity.ts` - 文章
- `user/entities/user.entity.ts` - 用户
- `auth/entities/auth.entity.ts` - 认证
- `tags/entities/tag.entity.ts` - 标签

**开发环境免密登录**:
- 通过环境变量 `SKIP_PASSWORD_VALIDATION=true` 启用
- 启用后，可以使用任意密码登录（用户必须存在且未被禁用）
- **仅用于开发和测试环境，生产环境必须禁用**
- 跳过密码验证时会记录警告日志，便于审计
- 配置位置: `server/.env`

**常见问题**:
- 端口冲突: 修改 `.env` 中的端口配置
- 数据库连接失败: 检查环境变量和 MySQL 服务
- 依赖安装失败: 删除 `node_modules` + `bun.lockb` 重新安装
- 构建失败: 运行 `bun run type-check` 检查类型错误

**调试技巧**:
- 前端: Vue DevTools (已集成)
- 后端: NestJS CLI 插件
- 数据库: TypeORM 查询日志
- Redis: `redis-cli` 监控
