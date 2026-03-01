# 构建阶段
FROM oven/bun:1 AS builder

WORKDIR /app

# 复制所有文件
COPY . .

# 安装依赖
RUN bun install

# 生产阶段
FROM oven/bun:1-alpine AS production

WORKDIR /app

COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY tsconfig.json ./

EXPOSE 3000

# 启动
CMD ["bun", "run", "src/index.ts"]