FROM oven/bun:1 AS base

WORKDIR /app

COPY package*.json ./

RUN bun install

COPY . .

RUN bun run build:test

EXPOSE 3000

CMD ["bun", "run", "start"]