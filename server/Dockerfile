# 构建阶段
FROM oven/bun:1 AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json bun.lockb* ./

# 安装所有依赖（包括 devDependencies 用于构建）
RUN bun install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN bun run build

# 生产依赖阶段
FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lockb* ./

# 只安装生产依赖
RUN bun install --frozen-lockfile --production

# 生产阶段
FROM oven/bun:1-alpine AS production

WORKDIR /app

# 只复制必要的生产文件，减少镜像体积
# 改成从服务器读取
# COPY --from=builder /app/.env ./
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000

# 直接运行编译后的 JavaScript 文件，最稳定的方式
CMD ["bun", "dist/src/main.js"]