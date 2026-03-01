# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 [bhvr](https://bhvr.dev) 模板的 TypeScript 全栈 Monorepo 博客系统，使用 Bun 作为运行时和包管理器，Turbo 进行构建编排。

### 技术栈

- **运行时**: Bun 1.2.4
- **构建编排**: Turbo
- **前端**: Vue 3 + Vite + Element Plus
- **后端**: NestJS + TypeORM + MySQL
- **轻量服务**: Hono (lite-server)

### 工作区结构

```
├── admin-web/      # Vue 3 管理后台 (Element Plus + Pinia)
├── server/         # NestJS 后端 API (TypeORM + MySQL + Redis)
├── lite-server/    # Hono 轻量级服务
```

## 通用命令

```bash
# 安装依赖 (使用 Bun)
bun install

# 开发模式 - 启动所有工作区
bun run dev
# 或使用 turbo
turbo dev

# 单独启动工作区
bun run dev:admin-web    # 启动管理后台 (默认端口由 .env 决定)
bun run dev:server       # 启动 NestJS 服务 (默认 3000)
bun run dev:lite-server  # 启动 Hono 服务

# 构建
bun run build           # 构建所有工作区
bun run build:admin-web # 构建管理后台
bun run build:server    # 构建 NestJS 服务
bun run build:lite-server # 构建 Hono 服务

# 代码检查
bun run lint           # Lint 所有工作区
bun run type-check     # TypeScript 类型检查
bun run test           # 运行测试
```

## 架构说明

### server (NestJS 后端)

- **入口**: [server/src/main.ts](server/src/main.ts)
- **模块**: [server/src/app.module.ts](server/src/app.module.ts)
- **数据库**: TypeORM + MySQL，配置通过环境变量
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWD`, `DB_DATABASE`
  - `synchronize: true` - 自动根据实体创建表（生产环境建议关闭）
- **认证**: JWT + Passport
  - 全局 JWT Guard: [server/src/auth/jwt-auth.grard.ts](server/src/auth/jwt-auth.grard.ts)
  - 公开接口使用 `@Public()` 装饰器
- **API 文档**: Swagger，访问 `/docs`
- **全局拦截器**:
  - `TransformInterceptor` - 统一响应格式
  - `HttpExceptionFilter` - 全局错误处理

**NestJS 特定命令**:

```bash
cd server
bunx --bun nest start --watch    # 开发模式
bunx --bun nest build            # 构建
bun run start:prod               # 生产模式运行构建后的代码
```

### admin-web (Vue 3 管理后台)

- **入口**: [admin-web/src/main.ts](admin-web/src/main.ts)
- **路由**: `src/router/` - 使用 `initRouter()` 初始化
- **状态管理**: `src/store/` - 使用 Pinia
- **UI 框架**: Element Plus
- **自动导入**:
  - 组件自动从 `src/components/` 导入
  - Vue API 自动导入 (vue, vue-router, pinia, @vueuse/core)
  - Element Plus 组件按需导入

**路径别名** (在 [vite.config.ts](admin-web/vite.config.ts)):

- `@` → `src/`
- `@views` → `src/views/`
- `@imgs` → `src/assets/img/`
- `@icons` → `src/assets/icons/`
- `@utils` → `src/utils/`
- `@stores` → `src/store/`
- `@styles` → `src/assets/styles/`

**开发服务器配置**:

- 端口: `VITE_PORT` (从 .env 读取)
- API 代理: `/api` → `VITE_API_PROXY_URL`

### lite-server (Hono 轻量服务)

- **入口**: [lite-server/src/index.ts](lite-server/src/index.ts)
- 使用 Bun 原生运行
- 热重载: `bun run --hot src/index.ts`

### 服务地址

| 服务           | 地址                       | 说明         |
| -------------- | -------------------------- | ------------ |
| admin-web      | http://localhost:5173      | Vue 管理后台 |
| server API     | http://localhost:3000      | NestJS 后端  |
| server Swagger | http://localhost:3000/docs | API 文档     |
| lite-server    | http://localhost:3001      | Hono 服务    |

## 环境变量

### server/.env

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWD=your_password
DB_DATABASE=blog
PORT=3000
```

### admin-web/.env.development

```
VITE_PORT=5173
VITE_API_URL=/api
VITE_API_PROXY_URL=http://localhost:3000
VITE_BASE_URL=/
```

## 数据库实体

当前主要的实体 (位于 `server/src/`):

- `posts/entities/post.entity.ts` - 文章
- `user/entities/user.entity.ts` - 用户
- `auth/entities/auth.entity.ts - 认证

## 认证流程

1. 使用 JWT 进行身份验证
2. 大部分接口需要认证 (全局 JwtAuthGuard)
3. 使用 `@Public()` 装饰器标记公开接口
4. Token 通过 `Authorization: Bearer <token>` 传递

## 代码风格

- 使用 ESLint + Prettier
- admin-web 有额外的 stylelint 配置
- 提交前会运行 lint-staged
- 使用 Commitizen 进行规范化提交 (`bun run commit`)
