/**
 * 数据修复脚本：修复 Auth 和 User 表的关联关系
 *
 * 使用方法：
 * 1. 确保 .env 配置正确
 * 2. 运行：bun run fix-user-auth-relation
 */

import { DataSource } from 'typeorm';
import { AuthEntity } from '../src/auth/entities/auth.entity';
import { UserEntity } from '../src/user/entities/user.entity';

async function fixRelations() {
  console.log('开始修复 Auth 和 User 的关联关系...');

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
    console.log('数据库连接成功');

    const authRepo = dataSource.getRepository(AuthEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    // 1. 找出所有没有 User 记录的 Auth 记录
    const authWithoutUser = await authRepo
      .createQueryBuilder('auth')
      .leftJoinAndSelect('auth.user', 'user')
      .where('auth.user IS NULL')
      .getMany();

    console.log(`找到 ${authWithoutUser.length} 个没有关联 User 的 Auth 记录`);

    // 2. 找出所有没有 Auth 记录的 User 记录
    const userWithoutAuth = await userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.auth', 'auth')
      .where('user.auth IS NULL')
      .getMany();

    console.log(`找到 ${userWithoutAuth.length} 个没有关联 Auth 的 User 记录`);

    // 3. 尝试通过用户名匹配
    let fixedCount = 0;
    for (const auth of authWithoutUser) {
      const user = await userRepo.findOne({
        where: { nickname: auth.username }, // 假设用户名和昵称相同
      });

      if (user && !user.auth) {
        // 将 User 关联到 Auth
        await userRepo.update(user.id, { auth: { id: auth.id } });
        console.log(`✅ 修复：Auth[${auth.username}] -> User[${user.nickname || user.id}]`);
        fixedCount++;
      }
    }

    console.log(`\n总共修复了 ${fixedCount} 条记录`);

    // 4. 显示剩余未修复的记录
    const remainingAuth = await authRepo
      .createQueryBuilder('auth')
      .leftJoinAndSelect('auth.user', 'user')
      .where('auth.user IS NULL')
      .getMany();

    if (remainingAuth.length > 0) {
      console.log('\n⚠️  以下 Auth 记录仍无法自动修复：');
      remainingAuth.forEach(auth => {
        console.log(`  - ${auth.username} (ID: ${auth.id})`);
      });
    }

  } catch (error) {
    console.error('修复失败:', error);
  } finally {
    await dataSource.destroy();
  }
}

fixRelations();
