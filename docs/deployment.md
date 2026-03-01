# 发版部署文档

## 概述

项目采用 **基于路径的自动触发部署**，当代码 push 到 `main` 分支时，根据变化的文件路径自动触发对应服务的 CI/CD 流程。

## 架构总览

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   GitHub Push   │ ───> │  GitHub Actions  │ ───> │   生产环境      │
│   (main branch) │      │  (自动构建+部署)  │      │   (阿里云服务器)│
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

## 服务部署流程

### 1. admin-web (管理后台) - 静态文件部署

**工作流文件**: [`.github/workflows/admin-deploy.yml`](../.github/workflows/admin-deploy.yml)

**触发条件**:
- 分支: `main`
- 路径: `admin-web/**` 有变化

**部署流程**:
```
1. Bun + Vite 构建生产环境静态资源
2. 通过 SSH rsync 同步 dist 目录到服务器
3. 目标路径: /www/wwwroot/admin-web.kevinlau.cn/
```

**部署命令** (本地手动部署):
```bash
cd admin-web
bun install
bun run build
# 然后手动上传 dist 目录到服务器
```

---

### 2. server (NestJS 后端) - Docker 部署

**工作流文件**: [`.github/workflows/server-deploy.yml`](../.github/workflows/server-deploy.yml)

**触发条件**:
- 分支: `main`
- 路径: `server/**` 有变化

**部署流程**:
```
1. Docker 多阶段构建镜像
2. 推送到阿里云容器镜像服务
   └─ crpi-ixqtkyv5jyilbxg5.cn-guangzhou.personal.cr.aliyuncs.com/kevinlau/blog-server:latest
3. SSH 到服务器执行部署:
   - docker pull 拉取新镜像
   - docker stop/rm 停止并删除旧容器
   - docker run 启动新容器
```

**Dockerfile**: [`server/Dockerfile`](../server/Dockerfile)

多阶段构建:
- **builder**: 安装所有依赖 + 执行 `bun run build`
- **deps**: 只安装生产依赖
- **production**: 复制 dist + 生产依赖 → 最小镜像

**运行配置**:
```bash
容器名: blog-server
端口映射: 20238:3000
环境变量: -v /www/wwwroot/blog-server.kevinlau.cn/.env:/app/.env
```

**本地手动构建**:
```bash
cd server
docker build -t blog-server:local .
docker run -d --name blog-server -p 3000:3000 \
  -v $(pwd)/.env:/app/.env blog-server:local
```

---

### 3. lite-server (Hono 轻量服务) - Docker 部署

**工作流文件**: [`.github/workflows/lite-server-deploy.yml`](../.github/workflows/lite-server-deploy.yml)

**触发条件**:
- 分支: `main`
- 路径: `lite-server/**` 有变化

**部署流程**: 与 server 类似

**Dockerfile**: [`lite-server/Dockerfile`](../lite-server/Dockerfile)

单阶段构建:
- 直接复制源码 + 依赖
- 启动命令: `bun run src/index.ts` (支持热重载)

---

## 部署架构图

```
                        GitHub Actions
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  ┌───────────┐       ┌───────────┐       ┌─────────────┐
  │ admin-web │       │  server   │       │ lite-server │
  │           │       │           │       │             │
  │ Vite 构建 │       │Docker 构建│       │Docker 构建  │
  └─────┬─────┘       └─────┬─────┘       └──────┬──────┘
        │                   │                   │
        ▼                   ▼                   ▼
  ┌───────────┐       ┌───────────┐       ┌─────────────┐
  │   SSH     │       │阿里云镜像  │       │阿里云镜像    │
  │ rsync     │       │  推送     │       │   推送      │
  └─────┬─────┘       └─────┬─────┘       └──────┬──────┘
        │                   │                   │
        ▼                   ▼                   ▼
  ┌─────────────────────────────────────────────────────┐
  │              阿里云生产服务器                        │
  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
  │  │ 静态文件    │  │ Docker容器   │  │ Docker容器   │ │
  │  │ :5173       │  │ :20238      │  │ (待定端口)   │ │
  │  └─────────────┘  └─────────────┘  └─────────────┘ │
  └─────────────────────────────────────────────────────┘
```

---

## GitHub Secrets 配置

在 GitHub 仓库设置中配置以下密钥:

| 密钥名称 | 说明 | 用途 |
|---------|------|------|
| `SERVER_HOST` | 服务器 IP 或域名 | SSH 连接地址 |
| `SERVER_USERNAME` | SSH 用户名 | SSH 登录用户 |
| `SERVER_SSH_KEY` | SSH 私钥 | SSH 认证 |
| `DOCKER_USERNAME` | 阿里云镜像用户名 | 镜像仓库登录 |
| `DOCKER_PASSWORD` | 阿里云镜像密码 | 镜像仓库登录 |

---

## 快速发版指南

### 方式一: 自动发版 (推荐)

```bash
# 1. 切换到 main 分支
git checkout main

# 2. 拉取最新代码
git pull origin main

# 3. 合并开发分支
git merge develop

# 4. 推送到远程触发 CI/CD
git push origin main
```

### 方式二: 手动发版

**admin-web**:
```bash
cd admin-web
bun run build
# 使用 scp 或 rsync 上传 dist 目录到服务器
```

**server / lite-server**:
```bash
cd server  # 或 lite-server
docker build -t your-image:tag .
docker push your-image:tag
# SSH 登录服务器执行部署脚本
```

---

## 环境变量说明

### server 环境变量

服务器上配置文件位置: `/www/wwwroot/blog-server.kevinlau.cn/.env`

```env
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWD=your_password
DB_DATABASE=blog
JWT_SECRET=your_jwt_secret
REDIS_PASSWORD=your_redis_password
PORT=3000
```

### admin-web 环境变量

- 开发环境: `admin-web/.env.development`
- 生产环境: 构建时使用 `.env.production` (需自行创建)

---

## 故障排查

### 查看部署状态

访问 GitHub Actions: https://github.com/你的用户名/next-blog/actions

### 查看 Docker 容器日志

```bash
# SSH 登录服务器后
docker logs blog-server
docker logs -f blog-server  # 实时查看
```

### 重启容器

```bash
docker restart blog-server
```

### 进入容器调试

```bash
docker exec -it blog-server sh
```

---

## 注意事项

1. **环境变量安全**: 永远不要将 `.env` 文件提交到 Git 仓库
2. **数据库同步**: server 的 TypeORM 配置 `synchronize: true` 会在启动时自动同步数据库结构，生产环境建议设为 `false`
3. **镜像标签**: 当前使用 `:latest` 标签，生产环境建议使用版本号或 commit hash
4. **端口冲突**: 确保服务器端口未被占用
5. **回滚**: 如需回滚，保留旧版本 Docker 镜像，切换镜像标签即可
