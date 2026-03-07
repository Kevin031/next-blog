# 回滚清单：文章内容类型默认值修复

## 回滚触发条件

在以下情况下应该考虑回滚：

### 🚨 紧急回滚（立即执行）
- **服务崩溃**：后端服务无法启动或持续崩溃
- **数据丢失**：数据库数据意外丢失或损坏
- **严重性能问题**：系统响应时间超过阈值（如 >10s）
- **安全漏洞**：发现新的安全漏洞或数据泄露风险
- **关键功能失效**：核心业务功能完全不可用

### ⚠️ 计划回滚（24小时内）
- **用户投诉激增**：收到大量用户关于新功能的负面反馈
- **数据不一致**：发现数据与预期不符
- **回归问题**：已知功能出现新问题
- **测试失败**：关键测试用例无法通过

### 📋 审查回滚（评估后决定）
- **性能下降**：轻微但可接受的性能下降
- **用户体验问题**：非关键的用户体验改善空间
- **兼容性问题**：特定客户端或浏览器的兼容性问题

## 回滚决策流程

```
发现异常
    ↓
评估严重程度 (紧急/高/中/低)
    ↓
是否达到回滚触发条件？
    ↓
是 → 立即启动回滚流程
    ↓
否 → 记录问题，继续监控
```

## 回滚步骤

### 阶段 1：快速评估（5分钟）

1. **确认问题**
   - [ ] 识别问题的根本原因
   - [ ] 确定问题是否与此次变更相关
   - [ ] 评估问题的严重程度和影响范围

2. **检查日志**
   - [ ] 查看应用错误日志
   - [ ] 检查数据库错误日志
   - [ ] 分析访问日志和请求日志

3. **收集信息**
   - [ ] 记录错误信息
   - [ ] 收集受影响的用户数量
   - [ ] 评估业务影响程度

### 阶段 2：代码回滚（10分钟）

#### 方法 A：Git 回滚（推荐）

1. **停止服务**
   ```bash
   # 使用 systemd
   sudo systemctl stop blog-server

   # 或使用 PM2
   pm2 stop blog-server
   ```

2. **回滚到上一个稳定版本**
   ```bash
   # 查看提交历史
   git log --oneline -10

   # 回滚到部署前的提交
   git revert <commit-hash> --no-edit
   # 或使用 reset（如果确定不需要该提交）
   git reset --hard <commit-hash>
   ```

3. **重新部署**
   ```bash
   cd server
   bun run build
   bun run start:prod
   ```

**验证点**：
- [ ] 服务成功回滚到指定版本
- [ ] 构建过程无错误
- [ ] 服务启动成功

#### 方法 B：从备份恢复（应急）

1. **停止服务**
   ```bash
   sudo systemctl stop blog-server
   ```

2. **从备份恢复代码**
   ```bash
   # 如果有代码备份
   rm -rf /path/to/backup/server
   cp -r /path/to/backup/server /path/to/production/
   ```

3. **重新部署**
   ```bash
   cd /path/to/production/server
   bun run start:prod
   ```

### 阶段 3：数据库回滚（15分钟）

#### 方法 A：数据库 Schema 回滚

1. **执行回滚 SQL**
   ```bash
   cd server/scripts/migrations

   # 执行默认值回滚
   mysql -h <host> -u <user> -p<password> <database> -e "
     ALTER TABLE posts ALTER COLUMN content_type SET DEFAULT 'markdown';
   "

   # 验证回滚结果
   mysql -h <host> -u <user> -p<password> <database> -e "
     SELECT COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'posts'
     AND COLUMN_NAME = 'content_type';
   "
   ```

2. **验证数据完整性**
   ```sql
   -- 检查数据总数
   SELECT COUNT(*) as total_posts FROM posts;

   -- 检查 content_type 分布
   SELECT content_type, COUNT(*) as count
   FROM posts
   GROUP BY content_type;

   -- 检查最近的记录
   SELECT id, title, content_type, create_time
   FROM posts
   ORDER BY create_time DESC
   LIMIT 10;
   ```

**验证点**：
- [ ] 默认值已回滚到 'markdown'
- [ ] 数据完整性正常
- [ ] 无数据丢失或损坏

#### 方法 B：从备份恢复（如果执行了数据迁移）

1. **停止服务**
   ```bash
   sudo systemctl stop blog-server
   pm2 stop blog-server
   ```

2. **从备份恢复数据库**
   ```bash
   # 使用备份文件恢复
   mysql -h <host> -u <user> -p<password> <database> < backup_20260307_143000.sql

   # 或恢复压缩的备份
   gunzip < backup_20260307_143000.sql.gz | mysql -u <user> -p<password> <database>
   ```

3. **验证数据恢复**
   ```sql
   -- 检查恢复的数据
   SELECT COUNT(*) as total_posts FROM posts;

   -- 检查关键数据
   SELECT * FROM posts ORDER BY create_time DESC LIMIT 5;
   ```

4. **启动服务**
   ```bash
   cd server
   bun run start:prod
   ```

**验证点**：
- [ ] 数据库恢复成功
- [ ] 数据完整性正常
- [ ] 关键数据存在
- [ ] 服务启动正常

### 阶段 4：验证回滚（10分钟）

1. **健康检查**
   ```bash
   # 检查服务状态
   curl http://localhost:3000/health

   # 或使用 PM2
   pm2 status blog-server
   ```

2. **功能验证**
   ```bash
   # 测试创建文章 API
   curl -X POST http://localhost:3000/posts/create \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{
       "title": "回滚测试",
       "content": "测试内容",
       "visible": true,
       "author": "test"
     }'
   ```

3. **检查默认值**
   ```bash
   # 创建文章时不指定 content_type
   # 应该使用回滚后的默认值 'markdown'
   # 或保持原有行为
   ```

4. **验证 Swagger 文档**
   ```bash
   # 访问 Swagger 文档
   open http://localhost:3000/docs

   # 检查 POST /posts/create 接口的 content_type 默认值
   ```

**验证点**：
- [ ] 服务运行正常
- [ ] 健康检查通过
- [ ] API 功能正常
- [ ] 默认值行为符合预期
- [ ] 用户可以正常使用系统

## 回滚后监控

### 短期监控（2小时）
- [ ] 服务稳定性监控
- [ ] 错误率监控
- [ ] 性能指标监控
- [ ] 用户活动监控

### 中期监控（1天）
- [ ] 数据一致性检查
- [ ] 功能回归测试
- [ ] 用户体验评估
- [ ] 系统性能评估

## 应急联系人

在回滚过程中如需帮助，请联系：

- **技术负责人**：[姓名] - [联系方式]
- **DBA**：[姓名] - [联系方式]
- **运维团队**：[联系方式]
- **项目经理**：[联系方式]

## 回滚决策记录表

| 时间 | 问题描述 | 严重程度 | 回滚原因 | 回滚方法 | 完成时间 | 备注 |
|------|----------|------------|------------|------------|----------|------|
|      |          |            |            |            |          |      |

## 常见回滚场景

### 场景 1：代码编译失败
**症状**：构建过程中出现编译错误
**回滚步骤**：
1. 检查 Node.js 版本兼容性
2. 回退到上一个稳定版本
3. 重新构建和部署

### 场景 2：数据库迁移失败
**症状**：SQL 执行出错或超时
**回滚步骤**：
1. 停止数据库迁移
2. 检查数据库连接和权限
3. 从备份恢复数据库
4. 重新部署代码

### 场景 3：服务启动失败
**症状**：服务无法启动或立即崩溃
**回滚步骤**：
1. 检查应用日志
2. 回退代码到上一个版本
3. 恢复数据库（如果需要）
4. 重新启动服务

### 场景 4：功能异常
**症状**：新文章创建异常，默认值不正确
**回滚步骤**：
1. 热回滚代码（不停止服务）
2. 修改数据库默认值
3. 验证功能恢复正常

## 回滚后处理

### 1. 问题分析
- [ ] 详细记录问题原因
- [ ] 分析回滚的必要性
- [ ] 评估解决方案

### 2. 文档更新
- [ ] 更新故障报告
- [ ] 记录回滚过程
- [ ] 更新部署文档

### 3. 经验总结
- [ ] 总结经验教训
- [ ] 识别改进机会
- [ ] 更新最佳实践

### 4. 团队沟通
- [ ] 通知相关人员回滚完成
- [ ] 分享问题分析和解决方案
- [ ] 讨论后续改进计划

## 预防措施

### 1. 测试改进
- 加强集成测试覆盖
- 增加性能测试
- 完善回归测试

### 2. 部署流程优化
- 增加灰度发布
- 实施蓝绿部署
- 完善监控告警

### 3. 文档完善
- 更新故障排查指南
- 完善回滚文档
- 建立知识库

## 完成标准

回滚被视为成功当满足以下条件：

1. ✅ 代码成功回滚到稳定版本
2. ✅ 数据库状态已恢复
3. ✅ 服务运行正常
4. ✅ 所有关键功能可用
5. ✅ 用户可以正常使用系统
6. ✅ 无新的错误或问题
7. ✅ 监控指标恢复正常
8. ✅ 相关人员已通知

## 联系方式

- **紧急支持**：[联系方式]
- **技术支持**：[联系方式]
- **管理层**：[联系方式]

---

**⚠️ 重要提醒**：
- 回滚前务必确认备份可用
- 记录所有回滚步骤和时间
- 回滚后进行彻底的测试验证
- 及时通知所有相关人员
- 做好回滚后的问题处理准备
