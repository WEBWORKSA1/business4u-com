// Fetches small-business RSS/Atom feeds and writes data/news.json (titles + links only).
// Runs in GitHub Actions on a schedule. Node 18+ (global fetch).
import { readFile, writeFile } from "node:fs/promises";

const OUT = new URL("../data/news.json", import.meta.url);
const FEEDS = [
  ["", "https://news.google.com/rss/search?q=%22small+business%22+when:7d&hl=en-US&gl=US&ceid=US:en"],
  ["", "https://news.google.com/rss/search?q=startup+funding+OR+entrepreneurs+when:7d&hl=en-US&gl=US&ceid=US:en"],
  ["", "https://news.google.com/rss/search?q=small+business+Canada+when:7d&hl=en-CA&gl=CA&ceid=CA:en"],
  ["", "https://news.google.com/rss/search?q=small+business+UK+when:7d&hl=en-GB&gl=GB&ceid=GB:en"],
  ["Small Business Trends", "https://smallbiztrends.com/feed"],
  ["Entrepreneur", "https://www.entrepreneur.com/latest.rss"]
];
const MAX = 40, MAX_AGE_DAYS = 14;

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function decode(s = "") {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m)
    .replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
function tag(block, name) {
  const m = block.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + name + ">", "i"));
  return m ? decode(m[1]) : "";
}
function parse(xml, fallbackSource) {
  const out = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  for (const b of blocks) {
    let t = tag(b, "title");
    let u = tag(b, "link");
    if (!u) { const m = b.match(/<link[^>]*href="([^"]+)"/i); if (m) u = m[1]; }
    const d = tag(b, "pubDate") || tag(b, "updated") || tag(b, "published") || tag(b, "dc:date");
    let s = tag(b, "source") || fallbackSource;
    if (s && t.endsWith(" - " + s)) t = t.slice(0, -(s.length + 3));
    if (!s) { const m = t.match(/ - ([^-]{2,60})$/); if (m) { s = m[1].trim(); t = t.slice(0, -m[0].length); } }
    if (!t || !/^https?:\/\//.test(u)) continue;
    const date = d ? new Date(d) : null;
    out.push({ t, u, s: s || "News", d: date && !isNaN(date) ? date.toISOString() : null });
  }
  return out;
}
async function get(url) {
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { "User-Agent": "Business4U.com news bot (+https://business4u.com/news/)" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.text();
  } finally { clearTimeout(timer); }
}

const all = [];
for (const [name, url] of FEEDS) {
  try { const items = parse(await get(url), name); all.push(...items); console.log(`ok ${items.length} ${url}`); }
  catch (e) { console.warn(`skip ${url}: ${e.message}`); }
}
const cutoff = Date.now() - MAX_AGE_DAYS * 864e5, seen = new Set();
const items = all
  .filter((i) => !i.d || new Date(i.d).getTime() >= cutoff)
  .sort((a, b) => (b.d ? Date.parse(b.d) : 0) - (a.d ? Date.parse(a.d) : 0))
  .filter((i) => { const k = i.t.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 80); if (seen.has(k)) return false; seen.add(k); return true; })
  .slice(0, MAX);

if (!items.length) {
  let prev = null; try { prev = JSON.parse(await readFile(OUT, "utf8")); } catch {}
  console.warn("No items fetched; keeping existing file.", prev ? prev.items?.length : 0);
  process.exit(0);
}
await writeFile(OUT, JSON.stringify({ updated: new Date().toISOString(), items }, null, 0) + "\n");
console.log(`wrote ${items.length} items`);
