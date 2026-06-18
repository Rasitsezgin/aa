import { spawn } from 'node:child_process';
import { existsSync, lstatSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'apps', 'web');
const webNextDir = join(webRoot, '.next');

function removeNextJunctionIfPresent() {
  if (process.platform !== 'win32' || !existsSync(webNextDir)) return;

  try {
    const stat = lstatSync(webNextDir);
    if (stat.isSymbolicLink()) {
      rmSync(webNextDir);
      console.log('[dev] Eski .next junction kaldırıldı (modül çözümleme hatası önlendi)');
    }
  } catch {
    // ignore
  }
}

removeNextJunctionIfPresent();

// Turbopack is unstable on Windows when the repo is on a slow/network drive (G:).
const useWebpack = process.argv.includes('--webpack') || (process.platform === 'win32' && !process.argv.includes('--turbopack'));
const nextArgs = useWebpack ? ['next', 'dev', '--webpack'] : ['next', 'dev'];

if (useWebpack && process.platform === 'win32') {
  console.log('[dev] Windows: webpack modu');
}

const child = spawn('npx', nextArgs, {
  cwd: webRoot,
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
