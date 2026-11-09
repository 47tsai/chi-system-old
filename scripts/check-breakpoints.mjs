// chi-system scripts/check-breakpoints.mjs — 斷點檢查（SYSTEM.md 第 4 節、第 15 節第 8 步）
//
// 用法：node scripts/check-breakpoints.mjs
// 檢查三件事，任一失敗即以非零結束：
//   (1) @media 條件內不得使用 var(--chi- ...)；
//   (2) 不得出現任何 --chi-breakpoint-* 定義；
//   (3) 斷點用途的 @media（條件含 px 寬度）必須在核准集合內，且緊鄰上一行
//       必須是固定格式註解 /* chi-breakpoint: <名稱> */，名稱與 px 值須與
//       breakpoints.json 的對應一致。
// 非斷點用途的 @media（例如 prefers-reduced-motion，不含 px 寬度）不要求註解，
// 但同樣不得在條件內使用 CSS 變數。
// CI 不自存對照表：核准值集合執行時直接讀取 breakpoints.json 產生。

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cssFiles = ['tokens.css', 'components.css', 'navigation.css'];

const bp = JSON.parse(readFileSync(join(root, 'breakpoints.json'), 'utf8'));
const approved = new Map(); // px -> name
for (const b of bp.breakpoints) approved.set(b.minWidth, b.name);
const approvedSet = new Set(approved.keys());

const failures = [];
const fail = (file, line, msg) => failures.push(`${file}:${line}: ${msg}`);

for (const file of cssFiles) {
  const text = readFileSync(join(root, file), 'utf8');
  const lines = text.split('\n');

  // (2) 不得定義 --chi-breakpoint-*
  lines.forEach((line, i) => {
    if (/--chi-breakpoint-[a-z0-9-]*\s*:/.test(line)) {
      fail(file, i + 1, '不得定義 --chi-breakpoint-* 變數');
    }
  });

  // 逐行找 @media
  lines.forEach((line, i) => {
    const m = line.match(/@media\s+(.+?)\s*\{/);
    if (!m) return;
    const cond = m[1];
    const lineNo = i + 1;

    // (1) 條件內不得用 var(--chi-
    if (cond.includes('var(--chi-')) {
      fail(file, lineNo, '@media 條件內不得使用 var(--chi-...)');
    }

    const pxValues = [...cond.matchAll(/(\d+)px/g)].map((x) => Number(x[1]));
    if (pxValues.length === 0) return; // 非斷點用途，不要求註解

    // (3) px 值必須在核准集合內
    for (const px of pxValues) {
      if (!approvedSet.has(px)) {
        fail(file, lineNo, `@media 使用未核准的斷點值 ${px}px（核准集合：${[...approvedSet].join(', ')}）`);
      }
    }

    // 緊鄰上一行必須是固定格式註解，且名稱與數值對應
    const prev = (lines[i - 1] ?? '').trim();
    const cm = prev.match(/^\/\*\s*chi-breakpoint:\s*([a-z0-9-]+)\s*\*\/$/);
    if (!cm) {
      fail(file, lineNo, '斷點用途 @media 的緊鄰上一行缺少固定格式註解 /* chi-breakpoint: <名稱> */');
      return;
    }
    const name = cm[1];
    for (const px of pxValues) {
      if (approved.get(px) !== name) {
        fail(file, lineNo, `註解名稱 ${name} 與數值 ${px}px 不符（${name} 應為 ${[...approved.entries()].find(([, n]) => n === name)?.[0] ?? '未知'}px）`);
      }
    }
    if (![...approved.values()].includes(name)) {
      fail(file, lineNo, `註解名稱 ${name} 不在 breakpoints.json 內`);
    }
  });
}

if (failures.length > 0) {
  console.error(`斷點檢查失敗（${failures.length} 項）：`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`斷點檢查通過：${cssFiles.join('、')}，核准斷點 ${[...approved.entries()].map(([px, n]) => `${n}=${px}px`).join('、')}`);
