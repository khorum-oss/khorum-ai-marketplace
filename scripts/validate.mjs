#!/usr/bin/env node
// Checks the marketplace layout rules that `claude plugin validate` does not:
//   - every plugin names a category, and that category has a folder under plugins/
//   - every category folder has a README.md that mentions each of its plugins
//   - local plugins live at plugins/<category>/<name>/ with a matching plugin.json
//   - plugin names are unique kebab-case
// Usage: node scripts/validate.mjs   (exits 1 on any error)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pluginsDir = join(root, 'plugins');
const errors = [];
const fail = (msg) => errors.push(msg);

const manifest = JSON.parse(readFileSync(join(root, '.claude-plugin', 'marketplace.json'), 'utf8'));
const categories = readdirSync(pluginsDir).filter((d) => statSync(join(pluginsDir, d)).isDirectory());
const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const seen = new Set();

for (const cat of categories) {
  if (!kebab.test(cat)) fail(`category folder "${cat}" is not kebab-case`);
  if (!existsSync(join(pluginsDir, cat, 'README.md'))) fail(`plugins/${cat}/README.md is missing`);
}

for (const p of manifest.plugins ?? []) {
  const where = `plugin "${p.name}"`;
  if (!kebab.test(p.name ?? '')) fail(`${where}: name must be kebab-case`);
  if (seen.has(p.name)) fail(`${where}: duplicate name`);
  seen.add(p.name);

  if (!p.description) fail(`${where}: missing description`);
  if (!p.category) {
    fail(`${where}: missing category`);
    continue;
  }
  if (!categories.includes(p.category)) {
    fail(`${where}: category "${p.category}" has no folder at plugins/${p.category}/`);
    continue;
  }

  const readme = join(pluginsDir, p.category, 'README.md');
  if (existsSync(readme) && !readFileSync(readme, 'utf8').includes(`\`${p.name}\``)) {
    fail(`${where}: not listed in plugins/${p.category}/README.md`);
  }

  if (typeof p.source === 'string') {
    const dir = resolve(root, p.source);
    const expected = join(pluginsDir, p.category, p.name);
    if (dir !== expected) {
      fail(`${where}: local source must be ./${relative(root, expected)} (got ${p.source})`);
    }
    if (!existsSync(dir)) {
      fail(`${where}: source folder ${p.source} does not exist`);
    } else if (p.strict !== false) {
      const pj = join(dir, '.claude-plugin', 'plugin.json');
      if (!existsSync(pj)) fail(`${where}: ${relative(root, pj)} is missing (or set "strict": false)`);
      else if (JSON.parse(readFileSync(pj, 'utf8')).name !== p.name) {
        fail(`${where}: plugin.json name does not match marketplace entry`);
      }
    }
  }
}

// Folders under a category that no marketplace entry points at.
for (const cat of categories) {
  for (const d of readdirSync(join(pluginsDir, cat))) {
    if (statSync(join(pluginsDir, cat, d)).isDirectory() && !seen.has(d)) {
      fail(`plugins/${cat}/${d}/ is not listed in marketplace.json`);
    }
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log(`✓ ${manifest.plugins.length} plugins across ${categories.length} categories`);
