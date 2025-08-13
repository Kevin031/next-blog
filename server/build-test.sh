#!/bin/bash

# 用于测试 Docker 镜像构建的脚本
echo "🔨 开始构建优化后的 Docker 镜像..."

# 构建镜像
docker build -t next-blog-server:optimized .

if [ $? -eq 0 ]; then
    echo "✅ 镜像构建成功！"
    
    # 检查镜像大小
    echo "📊 镜像大小对比："
    docker images next-blog-server:optimized --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
    
    echo ""
    echo "🧹 清理中间镜像..."
    docker image prune -f
    
    echo "✨ 优化完成！镜像体积应该从 700MB 减少到约 150-250MB"
else
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi
