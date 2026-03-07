/**
 * 简化的登录测试 - 直接用 SQL
 */

import { DataSource } from 'typeorm';
import * as bcryptjs from 'bcryptjs';

async function testLogin() {
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

    // 查找 admin 用户
    const result = await dataSource.query(
      `SELECT * FROM auth WHERE username = 'admin' LIMIT 1`
    );

    if (result.length === 0) {
      console.log('❌ 未找到 admin 用户');
      return;
    }

    const admin = result[0];
    console.log('📋 Admin 用户信息:');
    console.log('  ID:', admin.id);
    console.log('  用户名:', admin.username);
    console.log('  是否激活:', admin.isActive);
    console.log('  角色:', admin.roles);

    // 测试密码
    const testPassword = 'admin123456';
    console.log('\n🔐 测试密码验证:');
    console.log('  输入密码:', testPassword);
    console.log('  数据库密码长度:', admin.password.length);

    const compareResult = bcryptjs.compareSync(testPassword, admin.password);
    console.log('  验证结果:', compareResult ? '✅ 密码正确' : '❌ 密码错误');

    // 如果密码错误，尝试重新设置
    if (!compareResult) {
      console.log('\n🔧 正在重置密码为 admin123456...');
      const newHash = bcryptjs.hashSync(testPassword, 10);
      await dataSource.query(
        `UPDATE auth SET password = ? WHERE username = 'admin'`,
        [newHash]
      );
      console.log('✅ 密码已重置');
    }

    // 测试 JWT
    console.log('\n🎫 JWT 配置:');
    console.log('  JWT_SECRET 存在:', !!process.env.JWT_SECRET);
    console.log('  JWT_SECRET 长度:', process.env.JWT_SECRET?.length);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await dataSource.destroy();
  }
}

testLogin();
