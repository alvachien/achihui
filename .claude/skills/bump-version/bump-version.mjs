// Bumps the achihui app version in package.json and all three environment files,
// and refreshes the release date.
// Usage: node .claude/skills/bump-version/bump-version.mjs <X.Y.Z>
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const newVersion = process.argv[2];
if (!newVersion || !/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Usage: node .claude/skills/bump-version/bump-version.mjs <X.Y.Z>');
  process.exit(1);
}

// Release date in the same YYYY.MM.DD format the environment files already use.
const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

// 1. package.json
const pkgPath = 'package.json';
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const oldVersion = pkg.version;
pkg.version = newVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// 2-4. environment files - update CurrentVersion + ReleasedDate (PascalCase fields)
const envFiles = [
  'src/environments/environment.ts',
  'src/environments/environment.prod.ts',
  'src/environments/environment.azureprod.ts',
];
for (const p of envFiles) {
  if (!existsSync(p)) {
    console.log(`Skipped (not present): ${p}`);
    continue;
  }
  let txt = readFileSync(p, 'utf8');
  const before = txt;
  txt = txt.replace(/(CurrentVersion\s*:\s*)'[^']*'/, `$1'${newVersion}'`);
  txt = txt.replace(/(ReleasedDate\s*:\s*)'[^']*'/, `$1'${today}'`);
  if (txt === before) {
    console.error(`WARNING: ${p} was not updated - field names not found`);
  }
  writeFileSync(p, txt);
}

console.log(`Bumped ${oldVersion} -> ${newVersion} (releasedate ${today})`);
console.log('Updated: package.json, environment.ts, environment.prod.ts, environment.azureprod.ts');
