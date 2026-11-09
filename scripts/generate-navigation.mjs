// chi-system scripts/generate-navigation.mjs
// Generate the shared-site navigation and footer from sites.json.
// The navigation region is the subnav cross-site group (.chi-subnav__group
// inside .chi-subnav), not a dropdown; the footer region is .chi-footer__sites.
// Run: node scripts/generate-navigation.mjs (write) or --check (CI verification).

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sites = JSON.parse(readFileSync(join(root, 'sites.json'), 'utf8')).sites;
const included = sites.filter((site) => site.inNav === true);
const failures = [];
const ids = new Set();

for (const site of sites) {
  for (const key of ['id', 'name', 'url', 'description', 'icon', 'inNav', 'brand', 'colorId']) {
    if (!(key in site)) failures.push(`sites.json: ${site.id ?? '(unknown)'} 缺少欄位 ${key}`);
  }
  if (ids.has(site.id)) failures.push(`sites.json: 重複的站點 ID ${site.id}`);
  ids.add(site.id);
  if (!/^[a-z0-9-]+$/.test(site.id ?? '')) failures.push(`sites.json: 無效的站點 ID ${site.id}`);
  if (!/^https:\/\//.test(site.url ?? '')) failures.push(`sites.json: ${site.id} 的 URL 必須使用 HTTPS`);
  if (!/^[a-z0-9-]+$/.test(site.icon ?? '')) failures.push(`sites.json: ${site.id} 的 icon symbol 格式無效`);
}
if (sites.length !== 6) failures.push(`sites.json: registry 必須只包含 SYSTEM.md 第 2 節的 6 個納入站，目前為 ${sites.length} 個`);
if (failures.length) {
  console.error(failures.join(String.fromCharCode(10)));
  process.exit(1);
}

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

function navigation(iconPrefix) {
  return `<!-- CHI:SITES:NAV:START -->
        <div class="chi-subnav__group">
${included.map((site) => `          <a class="chi-nav-link" data-site-id="${escapeHtml(site.id)}" href="${escapeHtml(site.url)}"><svg class="chi-icon" aria-hidden="true"><use href="${iconPrefix}icons.svg#${escapeHtml(site.icon)}"></use></svg>${escapeHtml(site.name)}</a>`).join(String.fromCharCode(10))}
        </div>
        <!-- CHI:SITES:NAV:END -->`;
}

function footer() {
  return `<!-- CHI:SITES:FOOTER:START -->
        <ul class="chi-footer__sites">
${included.map((site) => `          <li><a data-site-id="${escapeHtml(site.id)}" href="${escapeHtml(site.url)}">${escapeHtml(site.name)}</a></li>`).join(String.fromCharCode(10))}
        </ul>
        <!-- CHI:SITES:FOOTER:END -->`;
}

function replaceRegion(source, start, end, generated, file) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a + start.length);
  if (a < 0 || b < 0 || source.indexOf(start, a + start.length) >= 0 || source.indexOf(end, b + end.length) >= 0) {
    throw new Error(`${file}: generated region markers missing or duplicated`);
  }
  return source.slice(0, a) + generated + source.slice(b + end.length);
}

const targets = [
  { path: 'header.html', navIcon: './', footer: true },
  { path: 'template/index.html', navIcon: '../', footer: true },
];
const check = process.argv.includes('--check');
for (const target of targets) {
  const path = join(root, target.path);
  let source = readFileSync(path, 'utf8');
  source = replaceRegion(source, '<!-- CHI:SITES:NAV:START -->', '<!-- CHI:SITES:NAV:END -->', navigation(target.navIcon), target.path);
  source = replaceRegion(source, '<!-- CHI:SITES:FOOTER:START -->', '<!-- CHI:SITES:FOOTER:END -->', footer(), target.path);
  const current = readFileSync(path, 'utf8');
  if (check) {
    if (source !== current) failures.push(`${target.path}: 導覽與 sites.json 不一致，請執行 node scripts/generate-navigation.mjs`);
  } else {
    writeFileSync(path, source, 'utf8');
  }
}
if (failures.length) {
  console.error(failures.join(String.fromCharCode(10)));
  process.exit(1);
}
console.log(check ? 'sites.json 導覽一致性檢查通過' : '已依 sites.json 產生 header.html 與 template/index.html 的導覽');
