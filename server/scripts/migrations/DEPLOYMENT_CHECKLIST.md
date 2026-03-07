# 部署清单：文章内容类型默认值修复

## 部署前准备

### 1. 环境检查
- [ ] 确认目标环境（开发/测试/生产）
- [ ] 备份当前数据库
- [ ] 记录当前数据库 schema 版本
- [ ] 通知相关人员部署计划
- [ ] 准备回滚方案

### 2. 依赖检查
- [ ] Node.js 版本符合要求 (>= 18.x)
- [ ] 数据库连接正常
- [ ] 磁盘空间充足（至少 1GB）
- [ ] 网络连接稳定

## 部署步骤

### 阶段 1：代码变更

1. **拉取最新代码**
   ```bash
   git pull origin main
   git checkout fix-content-type-default
   ```

2. **安装依赖**
   ```bash
   bun install
   ```

3. **构建后端服务**
   ```bash
   cd server
   bun run build
   ```

4. **验证构建**
   ```bash
   # 检查构建输出目录
   ls -la dist/
   ```

**验证点**：
- [ ] 代码编译成功
- [ ] 无编译错误或警告
- [ ] 构建产物完整

### 阶段 2：数据库更新

#### 选项 A：开发环境（TypeORM 同步）

1. **停止服务**
   ```bash
   # 停止后端服务
   sudo systemctl stop blog-server
   # 或使用 PM2
   pm2 stop blog-server
   ```

2. **启动服务（同步模式）**
   ```bash
   bun run dev
   ```

3. **验证表结构**
   ```sql
   SELECT
       COLUMN_NAME,
       COLUMN_DEFAULT
   FROM
       INFORMATION_SCHEMA.COLUMNS
   WHERE
       TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'posts'
       AND COLUMN_NAME = 'content_type';
   ```

**验证点**：
- [ ] 服务启动成功
- [ ] 数据库表结构已更新
- [ ] `content_type` 列默认值为 `'rich-text'`

#### 选项 B：生产环境（手动迁移）

1. **备份数据库**
   ```bash
   # 按照备份指南执行
   mysqldump -h <host> -u <user> -p<password> <database> > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **执行迁移脚本**
   ```bash
   cd server/scripts/migrations
   mysql -h <host> -u <user> -p<password> <database> < 20260307_fix_content_type_default.sql
   ```

3. **验证迁移结果**
   ```sql
   -- 检查默认值
   SELECT COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'posts'
   AND COLUMN_NAME = 'content_type';

   -- 结果应该为：rich-text
   ```

**验证点**：
- [ ] 数据库备份成功
- [ ] 迁移脚本执行无错误
- [ ] 默认值已正确更新
- [ ] 表结构一致

### 阶段 3：可选数据迁移

**⚠️ 重要提示**：此步骤为可选，仅在需要修正历史数据时执行。

1. **审查迁移数据**
   ```bash
   cd server/scripts/migrations
   mysql -h <host> -u <user> -p<password> <database> < 20260307_migrate_historical_content_type.sql
   ```

2. **检查迁移脚本输出**
   - 查看临时表数据
   - 确认更新的文章数量
   - 检查前 10 条数据示例

3. **执行迁移**
   ```sql
   -- 在脚本中取消 COMMIT 的注释
   COMMIT;
   ```

4. **验证结果**
   ```sql
   -- 检查更新的记录数
   SELECT COUNT(*) as updated_rich_text_posts
   FROM posts
   WHERE content_type = 'rich-text'
     AND (
         (content LIKE '%<%' AND content LIKE '%>%')
         OR content LIKE '%<p>%'
         OR content LIKE '%<div>%'
         -- ... 其他条件
     );
   ```

**验证点**：
- [ ] 迁移脚本执行成功
- [ ] 更新的数据符合预期
- [ ] 无数据丢失或错误修改
- [ ] 性能影响可接受

### 阶段 4：服务启动和验证

1. **重启后端服务**
   ```bash
   cd server
   bun run start:prod
   ```

2. **健康检查**
   ```bash
   # 检查服务是否正常运行
   curl http://localhost:3000/health

   # 或使用 PM2
   pm2 status blog-server
   ```

3. **API 功能测试**
   ```bash
   # 测试创建文章接口
   curl -X POST http://localhost:3000/posts/create \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{
       "title": "测试文章",
       "content": "<p>富文本内容</p>",
       "visible": true,
       "author": "test"
     }'

   # 验证响应中的 content_type
   ```

4. **验证 Swagger 文档**
   ```bash
   # 访问 Swagger 文档
   open http://localhost:3000/docs

   # 检查 POST /posts/create 接口的 content_type 默认值
   # 应该显示为 "rich-text"
   ```

**验证点**：
- [ ] 服务启动成功
- [ ] 健康检查通过
- [ ] API 接口响应正常
- [ ] Swagger 文档显示正确默认值
- [ ] 新文章默认使用 'rich-text' 类型
- [ ] 显式指定 'markdown' 仍正常工作

### 阶段 5：回归测试

1. **运行单元测试**
   ```bash
   cd server
   bun test src/posts/dto/create-post.dto.spec.ts
   ```

2. **运行集成测试**
   ```bash
   bun test
   ```

3. **手动测试场景**
   - [ ] 创建新文章（不指定 content_type）→ 应为 'rich-text'
   - [ ] 创建新文章（指定 content_type: 'markdown'）→ 应为 'markdown'
   - [ ] 创建新文章（指定 content_type: 'rich-text'）→ 应为 'rich-text'
   - [ ] 尝试创建文章（指定无效 content_type）→ 应返回错误

**验证点**：
- [ ] 所有测试通过
- [ ] 功能行为符合预期
- [ ] 无回归问题

## 部署后监控

### 1. 短期监控（24小时）
- [ ] 监控服务错误率
- [ ] 检查数据库查询性能
- [ ] 关注用户反馈
- [ ] 监控 API 响应时间

### 2. 中期监控（1周）
- [ ] 分析错误日志
- [ ] 检查数据一致性
- [ ] 评估性能影响
- [ ] 收集用户体验反馈

### 3. 长期监控（1个月）
- [ ] 评估变更效果
- [ ] 更新文档
- [ ] 优化配置
- [ ] 准备后续改进计划

## 应急联系人

- **技术负责人**：[姓名] - [联系方式]
- **DBA**：[姓名] - [联系方式]
- **运维团队**：[联系方式]
- **项目经理**：[联系方式]

## 部署时间建议

- **最佳时机**：业务低峰期（如凌晨 2:00-6:00）
- **预计停机时间**：5-15 分钟
- **通知提前期**：至少 24 小时
- **回滚窗口期**：部署后 2 小时内

## 检查清单总结

**部署前**：
- [ ] 所有准备工作完成
- [ ] 备份已验证
- [ ] 相关人员已通知
- [ ] 回滚计划已准备

**部署中**：
- [ ] 代码部署成功
- [ ] 数据库迁移成功
- [ ] 服务启动正常
- [ ] 基本功能验证通过

**部署后**：
- [ ] 所有测试通过
- [ ] 监控正常
- [ ] 无用户投诉
- [ ] 文档已更新

## 完成标准

部署被视为成功当满足以下条件：

1. ✅ 代码成功部署并运行
2. ✅ 数据库默认值已更新为 'rich-text'
3. ✅ Swagger API 文档显示正确默认值
4. ✅ 新文章默认使用 'rich-text' 类型
5. ✅ 所有测试通过
6. ✅ 服务稳定运行 24 小时
7. ✅ 无关键错误报告
