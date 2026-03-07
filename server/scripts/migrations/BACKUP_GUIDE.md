# 数据迁移备份指南

## 前置检查

在执行任何数据库迁移之前，请确保：

1. ✅ 备份脚本已经过测试
2. ✅ 有足够的磁盘空间用于备份
3. ✅ 备份期间数据库负载较低
4. ✅ 有数据库管理员权限
5. ✅ 了解数据库连接信息

## 备份步骤

### 1. 备份整个数据库

```bash
# 使用 mysqldump 备份整个数据库
mysqldump -h <host> -u <username> -p<password> <database_name> > backup_$(date +%Y%m%d_%H%M%S).sql

# 示例
mysqldump -h localhost -u root -pPassword123 blog > backup_20260307_143000.sql
```

### 2. 备份指定表

如果只需要备份 posts 表：

```bash
mysqldump -h <host> -u <username> -p<password> <database_name> posts > posts_backup_$(date +%Y%m%d_%H%M%S).sql

# 示例
mysqldump -h localhost -u root -pPassword123 blog posts > posts_backup_20260307_143000.sql
```

### 3. 压缩备份文件

为了节省空间，建议压缩备份文件：

```bash
# 压缩
gzip backup_20260307_143000.sql

# 或者在备份时直接压缩
mysqldump -h localhost -u root -pPassword123 blog | gzip > backup_20260307_143000.sql.gz
```

### 4. 验证备份文件

确保备份文件完整且可读：

```bash
# 检查文件大小
ls -lh backup_20260307_143000.sql.gz

# 检查文件内容（仅查看头部）
zcat backup_20260307_143000.sql.gz | head -20

# 统计表数量
zcat backup_20260307_143000.sql.gz | grep "CREATE TABLE" | wc -l
```

## 存储建议

1. **本地存储**：保留至少 3 个最近的备份
2. **远程存储**：将备份文件上传到远程服务器或云存储
3. **加密**：敏感数据应加密存储
4. **命名规范**：使用日期时间命名，便于管理和查找

## 恢复测试

在正式迁移前，建议在测试环境验证备份的可用性：

```bash
# 创建测试数据库
mysql -u root -p -e "CREATE DATABASE blog_test_backup;"

# 恢复备份
mysql -u root -p blog_test_backup < backup_20260307_143000.sql

# 或恢复压缩的备份
gunzip < backup_20260307_143000.sql.gz | mysql -u root -p blog_test_backup

# 验证数据
mysql -u root -p blog_test_backup -e "SELECT COUNT(*) FROM posts;"
```

## 应急联系

如果备份过程中出现问题：

1. 立即停止备份过程
2. 记录错误信息
3. 联系数据库管理员
4. 不要删除现有的其他备份

## 定期备份建议

对于生产环境，建议：

- **每日备份**：在业务低峰期进行
- **每周完整备份**：包括所有表和数据
- **保留策略**：保留至少 30 天的备份历史
- **异地备份**：定期将备份传输到异地存储

## 注意事项

⚠️ **重要提醒**：

1. 备份过程中数据库性能可能会受到影响
2. 备份文件包含敏感数据，请妥善保管
3. 测试环境验证是必须的步骤
4. 不要在生产环境未经测试的情况下执行迁移
5. 备份文件应设置适当的访问权限

```bash
# 设置备份文件权限
chmod 600 backup_20260307_143000.sql.gz
```

## 回滚准备

备份完成后，确保知道如何回滚：

1. 保留原始备份文件
2. 记录回滚命令
3. 准备回滚计划文档
4. 通知相关人员回滚可能性

## 检查清单

在开始迁移前，确认以下所有项：

- [ ] 已完成完整数据库备份
- [ ] 备份文件已验证可读
- [ ] 备份文件已安全存储
- [ ] 测试环境已验证恢复流程
- [ ] 迁移脚本已审查
- [ ] 回滚计划已准备
- [ ] 相关人员已通知
- [ ] 迁移时间窗口已确认
