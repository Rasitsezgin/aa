import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const prismaEntry = join(root, 'node_modules', 'prisma', 'build', 'index.js');
const generatedClient = join(root, 'packages', 'database', 'generated', 'client', 'index.js');

function useExistingClient(reason) {
  if (!existsSync(generatedClient)) {
    console.error('[dev] Prisma client bulunamadı. Repo kökünde: npm install');
    process.exit(1);
  }
  console.warn(`[dev] ${reason}`);
  console.warn('[dev] Mevcut generated client kullanılıyor. Tam kurulum: npm install');
  process.exit(0);
}

if (existsSync(prismaEntry)) {
  const result = spawnSync('npm', ['run', 'db:generate'], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  });
  process.exit(result.status ?? 1);
}

if (existsSync(generatedClient)) {
  useExistingClient('Prisma CLI eksik veya bozuk');
}

console.error('[dev] Prisma client bulunamadı. Önce repo kökünde npm install çalıştırın.');
process.exit(1);
