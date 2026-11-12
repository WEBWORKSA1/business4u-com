// Builds sitemap.xml and data/search-index.json from every HTML page's <title> and meta description.
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SITE = "https://business4u.com/";
const SKIP = new Set(["node_modules", ".git", ".github", "scripts", "data", "assets"]);
const EXCLUDE = new Set(["404.html"]);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith(".html") && !EXCLUDE.has(e.name)) out.push(p);
  }
  return out;
}
function lastmod(file) {
  try { const d = execSync(`git log -1 --format=%cs -- "${file}"`, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); if (d) return d; } catch {}
  return new Date().toISOString().slice(0, 10);
}
const dec = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const files = (await walk(ROOT)).sort();
const pages = [];
for (const f of files) {
  const html = await readFile(f, "utf8");
  if (/<meta name="robots" content="noindex/i.test(html)) continue;
  const rel = relative(ROOT, f).split(sep).join("/");
  const url = rel === "index.html" ? "" : rel.replace(/(^|\/)index\.html$/, "$1");
  const title = dec((html.match(/<title>([\s\S]*?)<\/title>/i) || [, ""])[1].replace(/\s*\|\s*Business4U\.com\s*$/i, "").trim());
  const desc = dec((html.match(/<meta name="description" content="([^"]*)"/i) || [, ""])[1]);
  const section = url.split("/")[0] || "home";
  pages.push({ url, title, desc, section, mod: lastmod(rel) });
}

const pri = (u) => (u === "" ? "1.0" : /\/$/.test(u) ? "0.8" : u.startsWith("legal/") ? "0.3" : "0.7");
const freq = (u) => (u === "news/" ? "hourly" : u === "" ? "daily" : "weekly");
const today = new Date().toISOString().slice(0, 10);
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  pages.map((p) => `  <url><loc>${SITE}${p.url}</loc><lastmod>${p.url === "news/" ? today : p.mod}</lastmod><changefreq>${freq(p.url)}</changefreq><priority>${pri(p.url)}</priority></url>`).join("\n") +
  "\n</urlset>\n";
await writeFile(join(ROOT, "sitemap.xml"), xml);

const index = pages.filter((p) => p.url !== "").map((p) => ({ t: p.title, u: p.url, d: p.desc.length > 120 ? p.desc.slice(0, 117) + "..." : p.desc, k: p.section }));
await writeFile(join(ROOT, "data", "search-index.json"), JSON.stringify(index) + "\n");
console.log(`sitemap: ${pages.length} urls, search index: ${index.length} entries`);
