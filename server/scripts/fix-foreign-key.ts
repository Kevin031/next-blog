/**
 * 直接修复外键关系
 */

import { DataSource } from 'typeorm';

async function fixForeignKey() {
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
    console.log('✅ 数据库连接成功');

    // 直接更新外键
    await dataSource.query(`
      UPDATE users u
      SET u.auth_id = (
        SELECT a.id FROM auth a
        WHERE a.username = 'admin'
        ORDER BY a.id DESC
        LIMIT 1
      )
      WHERE u.id = 2
    `);

    console.log('✅ 外键修复成功');

    // 验证
    const result = await dataSource.query(`
      SELECT u.id, u.nickname, u.auth_id, a.username
      FROM users u
      LEFT JOIN auth a ON u.auth_id = a.id
      WHERE u.id = 2
    `);

    console.log('验证结果:', result);

  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await dataSource.destroy();
  }
}

fixForeignKey();
