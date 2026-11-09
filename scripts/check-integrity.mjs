// chi-system scripts/check-integrity.mjs — 共用件一致性與 hash 檢查
// （SYSTEM.md 第 13 節、第 15 節第 8 步）
//
// 用法：
//   node scripts/check-integrity.mjs            驗證模式（CI 用）：檢查一致性，
//                                               並比對 hashes.json 與現行共用件
//                                               的 SHA-256 是否一致。
//   node scripts/check-integrity.mjs --write    產生模式：檢查一致性通過後，
//                                               重新產生 hashes.json。
//
// 檢查內容：
//   (1) CSS 內所有 var(--chi-*) 引用皆已在 tokens.css 定義；
//   (2) HTML 內所有 icons.svg 的 <use> 引用皆存在於 sprite；
//   (3) HTML 內所有 chi-* class 皆存在於共用 CSS；
//   (4) HTML 內所有相對路徑檔案引用皆存在；
//   (5) hashes.json 所列共用件的 SHA-256 與檔案現況一致（驗證模式）。
// 共用件清單（hashes.json 的範圍）：tokens.css、components.css、navigation.css、
// sidebar.css、theme.js、sidebar.js、icons.svg、sites.json、breakpoints.json、
// header.html、sidebar.html、logo/ 全部檔案。
// 範例頁與模板（example.html、preview.html、template/）不是各站釘版的共用件，
// 不列入 hashes.json，但仍參與 (2)(3)(4) 的引用檢查。
// 檢查失敗不得以手動改副本繞過：共用件改了卻未重新產生 hashes.json，CI 即失敗。

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const writeMode = process.argv.includes('--write');

const SHARED = [
  'tokens.css', 'components.css', 'navigation.css', 'sidebar.css', 'theme.js', 'sidebar.js',
  'icons.svg', 'sites.json', 'breakpoints.json', 'header.html', 'sidebar.html',
  ...readdirSync(join(root, 'logo')).filter((f) => !f.startsWith('.')).map((f) => `logo/${f}`),
].sort();
const HTML_FILES = ['example.html', 'header.html', 'sidebar.html', 'preview.html', 'template/index.html', 'template/sidebar.html', 'template/states.html'];
const CSS_FILES = ['tokens.css', 'components.css', 'navigation.css', 'sidebar.css'];

const failures = [];
const fail = (msg) => failures.push(msg);
const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

// (1) token 引用皆已定義
const tokensCss = readFileSync(join(root, 'tokens.css'), 'utf8');
const definedTokens = new Set([...tokensCss.matchAll(/--(chi-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
for (const file of CSS_FILES) {
  const text = readFileSync(join(root, file), 'utf8');
  for (const ref of new Set([...text.matchAll(/var\(--(chi-[a-z0-9-]+)/g)].map((m) => m[1]))) {
    if (!definedTokens.has(ref)) fail(`${file}: 引用未定義的 token --${ref}`);
  }
}

// (2)(3)(4) HTML 引用檢查
const iconsSvg = readFileSync(join(root, 'icons.svg'), 'utf8');
const symbols = new Set([...iconsSvg.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]));
const allCss = CSS_FILES.map((f) => readFileSync(join(root, f), 'utf8')).join('\n');
const definedClasses = new Set([...allCss.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));
for (const file of HTML_FILES) {
  const path = join(root, file);
  if (!existsSync(path)) { fail(`${file}: 檔案不存在`); continue; }
  const text = readFileSync(path, 'utf8');
  const base = dirname(path);
  for (const icon of new Set([...text.matchAll(/icons\.svg#([a-z0-9-]+)/g)].map((m) => m[1]))) {
    if (!symbols.has(icon)) fail(`${file}: 引用不存在的圖示 ${icon}`);
  }
  for (const clsAttr of text.matchAll(/class="([^"]+)"/g)) {
    for (const c of clsAttr[1].split(/\s+/)) {
      if (c.startsWith('chi-') && !definedClasses.has(c)) fail(`${file}: 使用未定義的 class ${c}`);
    }
  }
  for (const ref of new Set([...text.matchAll(/(?:src|href)="(\.{1,2}\/[^"#"]+)/g)].map((m) => m[1]))) {
    if (!existsSync(resolve(base, ref))) fail(`${file}: 引用不存在的檔案 ${ref}`);
  }
}

// (5) hash 比對／產生
const manifestPath = join(root, 'hashes.json');
if (writeMode) {
  if (failures.length > 0) {
    console.error(`一致性檢查失敗（${failures.length} 項），不產生 hashes.json：`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  const manifest = { files: {} };
  for (const f of SHARED) manifest.files[f] = `sha256:${sha256(join(root, f))}`;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`hashes.json 已產生：${SHARED.length} 個共用件`);
} else {
  if (!existsSync(manifestPath)) {
    fail('hashes.json 不存在，請先執行 node scripts/check-integrity.mjs --write 產生');
  } else {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const listed = Object.keys(manifest.files ?? {}).sort();
    for (const f of SHARED) {
      if (!(f in (manifest.files ?? {}))) { fail(`hashes.json 缺少共用件 ${f}`); continue; }
      const actual = `sha256:${sha256(join(root, f))}`;
      if (manifest.files[f] !== actual) fail(`hash 不符：${f}（檔案已改動，請重新產生 hashes.json）`);
    }
    for (const f of listed) {
      if (!SHARED.includes(f)) fail(`hashes.json 多列非共用件 ${f}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`一致性檢查失敗（${failures.length} 項）：`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`一致性檢查通過：token、圖示、class、檔案引用皆一致；hashes.json 與 ${SHARED.length} 個共用件相符`);
