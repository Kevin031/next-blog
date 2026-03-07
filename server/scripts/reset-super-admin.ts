/**
 * 紧急恢复脚本：创建或重置超级管理员账号
 *
 * 使用方法：
 * 1. 确保 .env 配置正确
 * 2. 运行：bun run scripts/reset-super-admin.ts
 */

import { DataSource } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { AuthEntity } from '../src/auth/entities/auth.entity';
import { UserEntity } from '../src/user/entities/user.entity';
import { Role } from '../src/auth/entities/auth.entity';

async function resetSuperAdmin() {
  console.log('========================================');
  console.log('🔧 超级管理员账号恢复工具');
  console.log('========================================\n');

  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWD,
    database: process.env.DB_DATABASE || 'blog',
    entities: [AuthEntity, UserEntity],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ 数据库连接成功\n');

    const authRepo = dataSource.getRepository(AuthEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    // 配置超管账号
    const SUPER_ADMIN = {
      username: 'admin',
      password: 'admin123456',
      email: 'admin@example.com',
      nickname: '超级管理员',
    };

    console.log('📋 当前配置：');
    console.log(`   用户名: ${SUPER_ADMIN.username}`);
    console.log(`   密码: ${SUPER_ADMIN.password}`);
    console.log(`   邮箱: ${SUPER_ADMIN.email}\n`);

    // 检查是否已存在
    let existingAuth = await authRepo.findOne({
      where: { username: SUPER_ADMIN.username },
      relations: ['user'],
    });

    if (existingAuth) {
      console.log('⚠️  检测到已存在的账号，正在重置...');
      console.log(`   ID: ${existingAuth.id}`);
      console.log(`   用户名: ${existingAuth.username}`);
      console.log(`   关联User: ${existingAuth.user ? '✅' : '❌ 无'}\n`);

      // 删除旧的用户记录（如果存在）
      if (existingAuth.user) {
        await userRepo.remove(existingAuth.user);
        console.log('   🗑️  已删除旧的 User 记录');
      }

      // 删除旧的 Auth 记录
      await authRepo.remove(existingAuth);
      console.log('   🗑️  已删除旧的 Auth 记录\n');
    }

    // 使用事务创建新账号
    await dataSource.transaction(async (manager) => {
      // 1. 创建 Auth 记录
      const hashedPassword = bcryptjs.hashSync(SUPER_ADMIN.password, 10);
      const newAuth = manager.create(AuthEntity, {
        username: SUPER_ADMIN.username,
        password: hashedPassword,
        email: SUPER_ADMIN.email,
        roles: ['R_SUPER'] as Role[],
        isActive: true,
      });

      const savedAuth = await manager.save(AuthEntity, newAuth);
      console.log(`✅ Auth 记录创建成功 (ID: ${savedAuth.id})`);

      // 2. 创建 User 记录并关联 Auth
      const newUser = new UserEntity();
      newUser.nickname = SUPER_ADMIN.nickname;
      newUser.phone = null;
      newUser.avatar = null;
      newUser.bio = '系统超级管理员';
      newUser.gender = null;
      newUser.birthday = null;
      newUser.location = null;
      newUser.status = 'active';
      newUser.auth = savedAuth;

      const savedUser = await manager.save(UserEntity, newUser);
      console.log(`✅ User 记录创建成功 (ID: ${savedUser.id})`);
      console.log(`   关联 auth_id: ${savedAuth.id}`);
    });

    console.log('\n========================================');
    console.log('🎉 超级管理员账号恢复成功！');
    console.log('========================================\n');
    console.log('📝 登录信息：');
    console.log(`   用户名: ${SUPER_ADMIN.username}`);
    console.log(`   密码: ${SUPER_ADMIN.password}`);
    console.log('\n⚠️  请登录后立即修改密码！\n');

    // 验证账号是否正常
    console.log('🔍 验证账号...');
    const verifyAuth = await authRepo.findOne({
      where: { username: SUPER_ADMIN.username },
      relations: ['user'],
    });

    if (verifyAuth && verifyAuth.user) {
      console.log('✅ 验证通过：账号关系正常');
      console.log(`   Auth ID: ${verifyAuth.id}`);
      console.log(`   User ID: ${verifyAuth.user.id}`);
      console.log(`   User.auth_id: ${verifyAuth.user.auth ? '✅' : '❌ NULL'}`);
    } else {
      console.log('❌ 验证失败：账号关系异常');
      console.log('   Auth:', verifyAuth ? '存在' : '不存在');
      console.log('   User:', verifyAuth?.user ? '存在' : '不存在');
    }

  } catch (error) {
    console.error('\n❌ 恢复失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
    }
  } finally {
    await dataSource.destroy();
    console.log('\n数据库连接已关闭');
  }
}

resetSuperAdmin();
