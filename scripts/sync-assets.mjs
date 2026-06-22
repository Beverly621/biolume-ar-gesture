import fs from 'node:fs/promises';
import path from 'node:path';

const SOURCE_ROOT = '/Users/beverlykim/1-use/5-biolume/eco_druid_assets';
const PROJECT_ROOT = '/Users/beverlykim/3-program-v2/biolume-ar-gesture';
const TARGET_ROOT = path.join(PROJECT_ROOT, 'public/assets/eco_druid_assets');

const REQUIRED_DIRS = [
  '01_bioluminescent_plants',
  '02_growing_vines',
  '03_water_ripple_textures',
  '04_moodboard',
  'docs'
];

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyDirectory(sourceDir, targetDir) {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

async function main() {
  if (!(await pathExists(SOURCE_ROOT))) {
    throw new Error(`素材源目录不存在：${SOURCE_ROOT}`);
  }

  await fs.mkdir(TARGET_ROOT, { recursive: true });

  for (const dir of REQUIRED_DIRS) {
    const sourceDir = path.join(SOURCE_ROOT, dir);
    if (await pathExists(sourceDir)) {
      await copyDirectory(sourceDir, path.join(TARGET_ROOT, dir));
    }
  }

  const readme = path.join(SOURCE_ROOT, 'README.md');
  if (await pathExists(readme)) {
    await fs.copyFile(readme, path.join(TARGET_ROOT, 'README.md'));
  }

  const primaryRipple = path.join(TARGET_ROOT, '03_water_ripple_textures/ripple_normal.png');
  const fallbackRipple = path.join(TARGET_ROOT, '03_water_ripple_textures/water_ripple_normal_map_preview.jpg');
  if (!(await pathExists(primaryRipple)) && await pathExists(fallbackRipple)) {
    console.warn('[biolume] 未找到 ripple_normal.png，运行时会回退到 water_ripple_normal_map_preview.jpg。');
  }

  console.log(`[biolume] 素材已同步到 ${TARGET_ROOT}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
