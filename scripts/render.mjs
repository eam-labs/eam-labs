#!/usr/bin/env node
// Regenerates assets/timeline.svg — the commit activity card used by README.md.
// Zero dependencies, Node 20+. Set GITHUB_TOKEN in CI to avoid rate limits.

import { writeFile, mkdir } from "node:fs/promises";

const OWNER = "eam-labs";
const REPO = process.env.GH_REPO || "eam-labs";
const OUT = new URL("../assets/", import.meta.url);

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));

const ago = (iso) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

async function get(url) {
  const res = await fetch(url, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": `${OWNER}-readme-render`,
      ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function timelineSvg(commits, narrow = false) {
  const W = narrow ? 400 : 880;
  const PAD = narrow ? 16 : 32;
  const ROW = narrow ? 58 : 44;
  const HEAD = narrow ? 52 : 66;
  const FS = { ttl: narrow ? 15 : 14, sha: narrow ? 12.5 : 11.5, msg: narrow ? 14 : 12.5, meta: narrow ? 12 : 11.5 };
  const LIMIT = narrow ? 40 : 56;
  const shown = commits.slice(0, narrow ? 4 : 5);
  // height follows the content: header, rows, then even padding top and bottom
  const H = shown.length ? HEAD + (shown.length - 1) * ROW + (narrow ? 34 : 18) + 22 : HEAD + 46;
  const lineX = PAD + 6;

  const row = (c, i) => {
    const msg = c.message.replace(/\s+/g, " ").trim();
    const short = msg.length > LIMIT ? msg.slice(0, LIMIT - 1) + "…" : msg;
    const y = HEAD + i * ROW;
    const dot = i === 0 ? "#ef4444" : "#dc2626";

    if (narrow) {
      // two-line rows: hash + age on top, message underneath — fits phone widths
      return `<g>
    <line x1="${lineX}" y1="${y - 14}" x2="${lineX}" y2="${y + 34}" stroke="#3b1016" stroke-width="1.5"/>
    <circle cx="${lineX}" cy="${y - 4}" r="${i === 0 ? 5 : 4}" fill="${dot}"/>
    <text x="${lineX + 18}" y="${y}" text-anchor="start" class="sha">${esc(c.sha)}</text>
    <text x="${W - PAD}" y="${y}" text-anchor="end" class="meta">${ago(c.date)}</text>
    <text x="${lineX + 18}" y="${y + 22}" text-anchor="start" class="msg">${esc(short)}</text>
  </g>`;
    }

    return `<g>
    <line x1="${lineX}" y1="${y - 26}" x2="${lineX}" y2="${y + 18}" stroke="#3b1016" stroke-width="1.5"/>
    <circle cx="${lineX}" cy="${y - 4}" r="${i === 0 ? 5 : 4}" fill="${dot}"/>
    <text x="${lineX + 22}" y="${y - 8}" class="sha">${esc(c.sha)}</text>
    <text x="${lineX + 90}" y="${y - 8}" class="msg">${esc(short)}</text>
    <text x="${W - PAD}" y="${y - 8}" text-anchor="end" class="meta">${ago(c.date)}</text>
  </g>`;
  };

  const rows = shown.length
    ? shown.map(row).join(String.fromCharCode(10))
    : `<text x="${PAD}" y="${HEAD}" class="meta">no commits yet</text>`;

  const subtitle = narrow ? "automation noise filtered" : "commits to this page · automation noise filtered";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="recent commits to this profile">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d0508"/><stop offset="1" stop-color="#190a0f"/></linearGradient>
  <linearGradient id="t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fca5a5"/><stop offset=".6" stop-color="#ef4444"/><stop offset="1" stop-color="#ef4444"/></linearGradient>
</defs>
<style>
  .ttl{font:600 ${FS.ttl}px ui-monospace,SFMono-Regular,Menlo,monospace;fill:url(#t)}
  .sha{font:600 ${FS.sha}px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#ef4444}
  .msg{font:${FS.msg}px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#e9c9d0}
  .meta{font:${FS.meta}px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#b08b96}
</style>
<rect width="${W}" height="${H}" rx="14" fill="url(#bg)" stroke="#3b1016"/>
<text x="${PAD}" y="${HEAD - 20}" class="ttl">activity</text>
<text x="${W - PAD}" y="${HEAD - 20}" text-anchor="end" class="meta">${subtitle}</text>
${rows}
</svg>`;
}

const commits = await get(`https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=30`);
const human = commits
  .map((c) => ({
    sha: c.sha.slice(0, 7),
    message: (c.commit?.message || "").split("\n")[0],
    date: c.commit?.author?.date || c.commit?.committer?.date,
    bot: /\[bot\]$/.test(c.author?.login || "") || /^chore[:(]/.test(c.commit?.message || ""),
  }))
  .filter((c) => !c.bot);

await mkdir(OUT, { recursive: true });
await writeFile(new URL("timeline.svg", OUT), timelineSvg(human));
await writeFile(new URL("timeline-mobile.svg", OUT), timelineSvg(human, true));
console.log(`ok: ${human.length} human commits`);
