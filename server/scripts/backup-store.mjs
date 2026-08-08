import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.resolve(__dirname, '..');
const sourcePath = process.env.STORE_FILE_PATH || path.join(serverDir, 'data', 'store.json');
const backupDir = path.join(serverDir, 'backups');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function timestamp() {
  const now = new Date();
  const date = now.toISOString().replace(/[:]/g, '-').replace(/\..+$/, '');
  return date;
}

function run() {
  ensureDir(path.dirname(sourcePath));
  ensureDir(backupDir);

  if (!fs.existsSync(sourcePath)) {
    fs.writeFileSync(sourcePath, JSON.stringify({ users: [], posts: [], companies: [] }, null, 2), 'utf8');
  }

  const backupPath = path.join(backupDir, `store-${timestamp()}.json`);
  fs.copyFileSync(sourcePath, backupPath);

  console.log(`Store backup created: ${backupPath}`);
}

run();
