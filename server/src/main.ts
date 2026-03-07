import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filter/http-exception/http-exception.filter';
import { TransformInterceptor } from './core/interceptor/transform/transform.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

/**
 * 验证必需的环境变量
 */
function validateEnv() {
  const requiredVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWD',
    'DB_DATABASE',
    'JWT_SECRET',
    'REDIS_PASSWORD',
  ];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ 缺少必需的环境变量: ${missing.join(', ')}\n` +
        `请检查 .env 文件或参考 .env.example 配置环境变量。`,
    );
  }

  // 验证 JWT_SECRET 强度（已通过上面的检查确保存在）
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    console.warn(
      '⚠️  警告: JWT_SECRET 长度不足 32 个字符\n' +
        `当前长度: ${jwtSecret.length}\n` +
        '建议使用: openssl rand -base64 32 生成强密钥以提高安全性',
    );
  }

  console.log('✅ 环境变量验证通过');
}

async function bootstrap() {
  // 验证环境变量
  validateEnv();

  const app = await NestFactory.create(AppModule);

  // 设置 swagger 文档
  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('Blog API description')
    .setVersion('1.0')
    .addTag('blog')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(new ValidationPipe());

  // 注册全局错误过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 注册全局成功拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
