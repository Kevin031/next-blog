/**
 * 清理孤立的 User 记录
 */

import { DataSource } from 'typeorm';

async function cleanupOrphanedUsers() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWD,
    database: process.env.DB_DATABASE || 'blog',
  });

  try {
    await dataSource.initialize();
    console.log('✅ 数据库连接成功\n');

    // 查找没有 authId 的用户
    const orphanedUsers = await dataSource.query(`
      SELECT id, nickname, createdAt FROM users WHERE authId IS NULL
    `);

    console.log(`📋 找到 ${orphanedUsers.length} 个没有认证信息的用户:`);
    console.table(orphanedUsers);

    if (orphanedUsers.length > 0) {
      // 询问是否删除
      console.log('\n⚠️  这些用户没有关联的认证信息，建议删除');
      console.log('如需删除，请手动执行 SQL:');
      orphanedUsers.forEach(u => {
        console.log(`DELETE FROM users WHERE id = ${u.id};`);
      });
    }

    // 验证 admin 账号
    const admin = await dataSource.query(`
      SELECT
        u.id, u.nickname, u.authId,
        a.id as auth_id, a.username, a.isActive
      FROM users u
      LEFT JOIN auth a ON u.authId = a.id
      WHERE a.username = 'admin'
      LIMIT 1
    `);

    console.log('\n✅ Admin 账号验证:');
    console.table(admin);

  } catch (error) {
    console.error('❌ 失败:', error);
  } finally {
    await dataSource.destroy();
  }
}

cleanupOrphanedUsers();
