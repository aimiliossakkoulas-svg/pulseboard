import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.resolve(__dirname, '..');
const storePath = process.env.STORE_FILE_PATH || path.join(serverDir, 'data', 'store.json');
const backupDir = path.join(serverDir, 'backups');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function resolveBackupPath() {
  const explicitPath = process.argv[2];
  if (explicitPath) {
    const resolved = path.resolve(process.cwd(), explicitPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Backup file does not exist: ${resolved}`);
    }
    return resolved;
  }

  if (!fs.existsSync(backupDir)) {
    throw new Error('No backup directory found. Create a backup first.');
  }

  const files = fs.readdirSync(backupDir)
    .filter((name) => name.startsWith('store-') && name.endsWith('.json'))
    .map((name) => ({
      name,
      fullPath: path.join(backupDir, name),
      modified: fs.statSync(path.join(backupDir, name)).mtimeMs
    }))
    .sort((a, b) => b.modified - a.modified);

  if (!files.length) {
    throw new Error('No backup files found. Create a backup first.');
  }

  return files[0].fullPath;
}

function run() {
  ensureDir(path.dirname(storePath));
  const selectedBackup = resolveBackupPath();
  fs.copyFileSync(selectedBackup, storePath);
  console.log(`Store restored from: ${selectedBackup}`);
}

run();
