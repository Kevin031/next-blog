import * as fs from 'fs';
import * as path from 'path';

function parseEnv() {
  const localEnv = path.resolve('.env');

  if (!fs.existsSync(localEnv)) {
    throw new Error('缺少环境配置文件');
  }

  const filePath = localEnv;
  return { path: filePath };
}
export default parseEnv();
