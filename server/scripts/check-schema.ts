/**
 * 检查表结构
 */

import { DataSource } from 'typeorm';

async function checkSchema() {
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

    // 查看 users 表结构
    const usersSchema = await dataSource.query(`DESCRIBE users`);
    console.log('📋 Users 表结构:');
    console.table(usersSchema);

    console.log('\n');

    // 查看 auth 表结构
    const authSchema = await dataSource.query(`DESCRIBE auth`);
    console.log('📋 Auth 表结构:');
    console.table(authSchema);

    console.log('\n');

    // 查看当前数据
    const users = await dataSource.query(`SELECT * FROM users LIMIT 3`);
    console.log('📋 Users 表数据:');
    console.table(users);

    console.log('\n');

    const auth = await dataSource.query(`SELECT * FROM auth LIMIT 3`);
    console.log('📋 Auth 表数据:');
    console.table(auth);

  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await dataSource.destroy();
  }
}

checkSchema();
