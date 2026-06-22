import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const PROJECT_ROOT = process.env.BIOLUME_PROJECT_ROOT || process.cwd();
const GUIDE_ROOT = process.env.BIOLUME_GUIDE_ROOT || '/Users/beverlykim/1-use/5-biolume';
const ENV_FILE = path.join(GUIDE_ROOT, '.env');
const ASSET_ROOT = path.join(GUIDE_ROOT, 'eco_druid_assets');
const RUNTIME_ASSET_ROOT = path.join(PROJECT_ROOT, 'public/assets/eco_druid_assets');
const REPOSITORY_SSH = 'git@github.com:Beverly621/biolume-ar-gesture.git';
const SSH_PORT = '443';
const IS_CI = process.env.GITHUB_ACTIONS === 'true';
const REQUIRED_SKILL_FILES = [
  'src/EcoDruidVFXManager.js',
  'src/skills/skillRegistry.js',
  'src/xrHandGestures.js'
];

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    shell: false,
    ...options
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} 执行失败。`);
  }
}

function parseMajor(versionOutput) {
  const match = versionOutput.match(/v?(\d+)/);
  return match ? Number(match[1]) : 0;
}

async function ensureNode() {
  const nodeVersion = spawnSync('node', ['--version'], { encoding: 'utf8' }).stdout.trim();
  const npmVersion = spawnSync('npm', ['--version'], { encoding: 'utf8' }).stdout.trim();
  if (parseMajor(nodeVersion) < 18) {
    throw new Error(`Node.js 版本过低：${nodeVersion}，需要 >= 18.18.0。`);
  }
  console.log(`[biolume] Node ${nodeVersion}, npm ${npmVersion}`);
}

async function ensureDependencies() {
  const nodeModules = path.join(PROJECT_ROOT, 'node_modules');
  if (await exists(nodeModules)) {
    console.log('[biolume] node_modules 已存在，跳过依赖安装。');
    return;
  }

  console.log('[biolume] 未检测到 node_modules，开始 npm install。');
  run('npm', ['install']);
}

async function ensureExternalEnvSlot() {
  if (IS_CI) {
    console.log('[biolume] GitHub Actions 环境跳过外部 .env 创建。');
    return;
  }

  await fs.mkdir(GUIDE_ROOT, { recursive: true });
  if (!(await exists(ENV_FILE))) {
    const template = [
      '# Biolume AR Gesture 本地环境变量',
      '# 第三方 API Key 或接口参数只能写在此文件，禁止写入项目源码目录。',
      'VITE_BIOLUME_API_ENDPOINT=',
      ''
    ].join('\n');
    await fs.writeFile(ENV_FILE, template, { mode: 0o600 });
    console.log(`[biolume] 已创建外部 .env 占位文件：${ENV_FILE}`);
  } else {
    console.log(`[biolume] 外部 .env 已存在：${ENV_FILE}`);
  }
}

async function ensureAssets() {
  if (await exists(ASSET_ROOT)) {
    run('node', ['scripts/sync-assets.mjs']);
    return;
  }

  if (await exists(RUNTIME_ASSET_ROOT)) {
    console.log(`[biolume] 未检测到外部素材目录，使用仓库内运行时素材：${RUNTIME_ASSET_ROOT}`);
    return;
  }

  throw new Error(`素材目录不存在：${ASSET_ROOT}，且仓库内运行时素材缺失：${RUNTIME_ASSET_ROOT}`);
}

async function ensureSkillScripts() {
  for (const relativePath of REQUIRED_SKILL_FILES) {
    const absolutePath = path.join(PROJECT_ROOT, relativePath);
    if (!(await exists(absolutePath))) {
      throw new Error(`技能脚本缺失：${absolutePath}`);
    }
  }

  console.log('[biolume] 技能脚本校验通过。');
}

async function ensureGitRemote() {
  const gitDir = path.join(PROJECT_ROOT, '.git');
  if (!(await exists(gitDir))) {
    run('git', ['init']);
  }

  const remoteCheck = spawnSync('git', ['remote', 'get-url', 'origin'], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8'
  });

  if (remoteCheck.status !== 0) {
    run('git', ['remote', 'add', 'origin', REPOSITORY_SSH]);
  } else if (remoteCheck.stdout.trim() !== REPOSITORY_SSH) {
    run('git', ['remote', 'set-url', 'origin', REPOSITORY_SSH]);
  }

  console.log(`[biolume] Git origin: ${REPOSITORY_SSH}`);
  console.log(`[biolume] SSH 固定端口：${SSH_PORT}`);
}

async function main() {
  await ensureNode();
  await ensureDependencies();
  await ensureSkillScripts();
  await ensureExternalEnvSlot();
  await ensureAssets();
  await ensureGitRemote();
  console.log('[biolume] 环境初始化完成。');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
