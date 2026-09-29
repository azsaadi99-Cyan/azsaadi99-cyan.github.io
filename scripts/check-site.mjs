import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pages = ['index.html', 'file-finder.html'];
const text = new Map();
for (const page of pages) text.set(page, await readFile(path.join(root, page), 'utf8'));

for (const [page, html] of text) {
  assert.match(html, /<html\b[^>]*lang="en"/i, `${page}: missing base language`);
  assert.match(html, /<main\b[^>]*id="main"/i, `${page}: missing main landmark`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page}: exactly one H1 required`);
  assert.match(html, /<link\b[^>]*rel="canonical"/i, `${page}: missing canonical URL`);
  assert.equal((html.match(/\bdata-en="/g) || []).length, (html.match(/\bdata-ar="/g) || []).length, `${page}: incomplete translations`);

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${page}: duplicate IDs`);
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) assert.match(tag, /\balt="[^"]*"/, `${page}: image missing alt text`);

  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = match[1];
    if (/^(https?:|mailto:|data:)/i.test(url)) continue;
    const [file, fragment] = url.split('#');
    const target = file ? path.resolve(root, file) : path.join(root, page);
    assert.ok(target.startsWith(root + path.sep), `${page}: path escapes site root: ${url}`);
    assert.ok((await stat(target)).size > 0, `${page}: empty local asset: ${url}`);
    if (fragment && (file.endsWith('.html') || !file)) {
      const destination = file ? await readFile(target, 'utf8') : html;
      assert.ok(destination.includes(`id="${fragment}"`), `${page}: broken section link: ${url}`);
    }
  }
}

const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
for (const page of pages) assert.ok(sitemap.includes(page === 'index.html' ? 'https://azsaadi99-cyan.github.io/' : `https://azsaadi99-cyan.github.io/${page}`), `Sitemap missing ${page}`);
console.log('Site checks passed: pages, translations, assets, anchors and sitemap.');
