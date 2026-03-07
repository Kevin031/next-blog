import { DataSource } from 'typeorm';
import { AuthEntity } from '../auth/entities/auth.entity';
import { UserEntity } from '../user/entities/user.entity';

/**
 * 检查和修复数据库中的用户角色
 */

async function fixUserRoles() {
  console.log('开始检查用户角色...\n');

  // 创建数据库连接
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

    const authRepository = dataSource.getRepository(AuthEntity);

    // 获取所有用户
    const users = await authRepository.find();
    console.log(`📊 数据库中共有 ${users.length} 个用户\n`);

    let updatedCount = 0;

    for (const user of users) {
      console.log(`用户: ${user.username}`);

      // 检查角色
      if (!user.roles || user.roles.length === 0) {
        console.log(`  ⚠️  角色为空，正在修复...`);

        // 为超级管理员设置 R_SUPER 角色
        if (user.username === 'Super') {
          user.roles = ['R_SUPER', 'R_ADMIN'];
          console.log(`  ✅ 设置角色为: R_SUPER, R_ADMIN`);
          updatedCount++;
        }
        // 为 Admin 设置 R_ADMIN 角色
        else if (user.username === 'Admin') {
          user.roles = ['R_ADMIN'];
          console.log(`  ✅ 设置角色为: R_ADMIN`);
          updatedCount++;
        }
        // 其他用户设置为 R_USER
        else {
          user.roles = ['R_USER'];
          console.log(`  ✅ 设置角色为: R_USER`);
          updatedCount++;
        }

        await authRepository.save(user);
      } else {
        console.log(`  ✅ 角色: ${user.roles.join(', ')}`);
      }

      console.log('');
    }

    console.log('=================================');
    console.log(`✅ 检查完成，共更新 ${updatedCount} 个用户的角色`);
    console.log('=================================\n');

    if (updatedCount > 0) {
      console.log('💡 提示: 请重新登录以使角色生效\n');
    }
  } catch (error) {
    console.error('❌ 检查用户角色失败:', error.message);
    if (error.detail) {
      console.error('详细信息:', error.detail);
    }
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// 运行脚本
fixUserRoles()
  .then(() => {
    console.log('脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
