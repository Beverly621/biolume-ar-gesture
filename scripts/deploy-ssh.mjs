import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = '/Users/beverlykim/3-program-v2/biolume-ar-gesture';
const REPOSITORY_SSH = 'git@github.com:Beverly621/biolume-ar-gesture.git';
const SSH_PORT = '443';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      GIT_SSH_COMMAND: `ssh -p ${SSH_PORT}`
    },
    ...options
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} 执行失败。`);
  }
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (await exists(path.join(PROJECT_ROOT, '.env'))) {
    throw new Error('检测到项目源码目录内存在 .env，已中止部署。请移动到 /Users/beverlykim/1-use/5-biolume/.env。');
  }

  run('npm', ['run', 'build']);

  if (!(await exists(path.join(PROJECT_ROOT, '.git')))) {
    run('git', ['init']);
  }

  const remote = spawnSync('git', ['remote', 'get-url', 'origin'], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8'
  });

  if (remote.status !== 0) {
    run('git', ['remote', 'add', 'origin', REPOSITORY_SSH]);
  } else if (remote.stdout.trim() !== REPOSITORY_SSH) {
    run('git', ['remote', 'set-url', 'origin', REPOSITORY_SSH]);
  }

  run('git', ['add', '-A']);
  run('git', ['commit', '-m', 'feat: implement eco druid ar gesture vfx']);
  run('git', ['push', '-u', 'origin', 'HEAD']);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
