const net = require('net');
const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');

function portFree(port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.unref();
    s.on('error', () => resolve(false));
    s.listen(port, () => {
      s.close(() => resolve(true));
    });
  });
}

(async () => {
  const preferred = [4200, 4202, 4300, 4400];
  let port = null;
  for (const p of preferred) {
    if (await portFree(p)) {
      port = p;
      break;
    }
  }
  if (port == null) {
    console.error('[storefront] No free port in:', preferred.join(', '));
    process.exit(1);
  }
  console.log(`\n  Storefront: http://localhost:${port}\n`);
  const child = spawn('pnpm', ['exec', 'next', 'dev', '-p', String(port)], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, STOREFRONT_PORT: String(port) },
  });
  child.on('exit', (code) => process.exit(code ?? 0));
})();
