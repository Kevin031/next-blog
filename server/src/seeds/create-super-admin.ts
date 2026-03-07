import { DataSource } from 'typeorm';
import { AuthEntity } from '../auth/entities/auth.entity';
import { UserEntity } from '../user/entities/user.entity';
import * as bcrypt from 'bcryptjs';

/**
 * 创建超级管理员账户
 *
 * 使用方式:
 * 1. 确保已设置环境变量 SUPER_USERNAME 和 SUPER_PASSWORD
 * 2. 运行: bun run src/seeds/create-super-admin.ts
 *
 * 环境变量:
 * - SUPER_USERNAME: 超级管理员用户名（默认: Super）
 * - SUPER_PASSWORD: 超级管理员密码（默认: 自动生成）
 */

async function createSuperAdmin() {
  console.log('开始创建超级管理员账户...\n');

  // 从环境变量读取配置
  const username = process.env.SUPER_USERNAME || 'Super';
  let password = process.env.SUPER_PASSWORD;

  // 如果没有提供密码，自动生成强密码
  if (!password) {
    const crypto = await import('crypto');
    password = crypto.randomBytes(16).toString('base64').slice(0, 24);
    console.log(`⚠️  未设置 SUPER_PASSWORD 环境变量`);
    console.log(`🔑 自动生成的密码: ${password}\n`);
  }

  // 创建数据库连接
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWD,
    database: process.env.DB_DATABASE || 'blog',
    entities: [AuthEntity, UserEntity],
    synchronize: false, // 种子脚本不需要同步
  });

  try {
    await dataSource.initialize();
    console.log('✅ 数据库连接成功\n');

    const authRepository = dataSource.getRepository(AuthEntity);
    const userRepository = dataSource.getRepository(UserEntity);

    // 检查超级管理员是否已存在
    const existingAdmin = await authRepository.findOne({
      where: { username },
    });

    if (existingAdmin) {
      console.log(`⚠️  用户 "${username}" 已存在`);
      console.log('如需重置，请先删除现有账户\n');

      // 询问是否更新密码
      const updatePassword = process.env.UPDATE_PASSWORD === 'true';
      if (updatePassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await authRepository.update({ username }, { password: hashedPassword });
        console.log('✅ 密码已更新\n');
      }

      await dataSource.destroy();
      return;
    }

    // 使用事务确保数据一致性
    await dataSource.transaction(async (manager) => {
      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建认证记录
      const auth = manager.create(AuthEntity, {
        username,
        password: hashedPassword,
        email: process.env.SUPER_EMAIL || 'admin@localhost',
        roles: ['R_SUPER', 'R_ADMIN'],
        isActive: true,
      });

      const savedAuth = await manager.save(auth);

      // 创建用户档案
      const user = manager.create(UserEntity, {
        nickname: '超级管理员',
        email: process.env.SUPER_EMAIL || 'admin@localhost',
        status: 'active',
        auth: savedAuth,
      });

      await manager.save(user);
    });

    console.log('✅ 超级管理员账户创建成功\n');
    console.log('=================================');
    console.log(`用户名: ${username}`);
    console.log(`密码: ${password}`);
    console.log('=================================\n');
    console.log('⚠️  重要提示:');
    console.log('1. 请妥善保管以上凭据');
    console.log('2. 首次登录后建议立即修改密码');
    console.log('3. 请勿将凭据提交到版本控制系统\n');
  } catch (error) {
    console.error('❌ 创建超级管理员失败:', error.message);
    if (error.detail) {
      console.error('详细信息:', error.detail);
    }
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// 运行脚本
createSuperAdmin()
  .then(() => {
    console.log('脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
