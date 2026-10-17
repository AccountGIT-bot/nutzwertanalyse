/**
 * Rendert das Erklärvideo aus tools/video/scene.html.
 *
 *   cd tools/video && npm i playwright   (einmalig; Chromium muss vorhanden sein)
 *   node tools/video/render.mjs
 *
 * Die Frames werden per Chrome-DevTools-Screencast exakt in Viewport-Grösse
 * abgegriffen und mit ffmpeg zu MP4 (H.264) und WebM (VP9) encodiert.
 * Ergebnis in public/video/: explainer.mp4, explainer.webm, explainer-poster.jpg
 * sowie Untertitel explainer.<lang>.vtt (aus tools/video/subtitles.json).
 */
import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const out = path.join(root, "public/video");
const tmp = path.join(here, ".tmp");
mkdirSync(out, { recursive: true });
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const W = 1280;
const H = 720;
const DURATION = 92;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);

const frames = []; // { file, t }
let n = 0;
cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
  const file = path.join(tmp, `f${String(n++).padStart(5, "0")}.png`);
  writeFileSync(file, Buffer.from(data, "base64"));
  frames.push({ file, t: metadata.timestamp });
  await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
});

await page.goto("file://" + path.join(here, "scene.html"));
await cdp.send("Page.startScreencast", { format: "png", maxWidth: W, maxHeight: H, everyNthFrame: 1 });
await page.waitForTimeout(DURATION * 1000 + 500);
await cdp.send("Page.stopScreencast");
await page.waitForTimeout(300);

// Poster (Szene 6, Ergebnis) in doppelter Auflösung
const ctx2 = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
const p2 = await ctx2.newPage();
await p2.goto("file://" + path.join(here, "scene.html"));
await p2.waitForTimeout(56_000);
await p2.screenshot({ path: path.join(tmp, "poster.png") });
await ctx2.close();
await browser.close();

if (frames.length < 10) throw new Error("Zu wenige Frames aufgezeichnet");
frames.sort((a, b) => a.t - b.t);
const t0 = frames[0].t;
const lines = [];
for (let i = 0; i < frames.length; i++) {
  const next = i + 1 < frames.length ? frames[i + 1].t : t0 + DURATION;
  const d = Math.max(0.001, next - frames[i].t);
  lines.push(`file '${frames[i].file}'`, `duration ${d.toFixed(4)}`);
}
lines.push(`file '${frames[frames.length - 1].file}'`);
const list = path.join(tmp, "list.txt");
writeFileSync(list, lines.join("\n"));
console.log(`${frames.length} Frames, ${(frames[frames.length - 1].t - t0).toFixed(1)} s`);

const common = `-f concat -safe 0 -i "${list}" -t ${DURATION} -vf "fps=30,scale=${W}:${H}:flags=lanczos,format=yuv420p" -an`;
execSync(`ffmpeg -y ${common} -c:v libx264 -preset slow -crf 20 -movflags +faststart "${path.join(out, "explainer.mp4")}"`, { stdio: "inherit" });
execSync(`ffmpeg -y ${common} -c:v libvpx-vp9 -b:v 0 -crf 33 -row-mt 1 "${path.join(out, "explainer.webm")}"`, { stdio: "inherit" });
execSync(`ffmpeg -y -i "${path.join(tmp, "poster.png")}" -vf "scale=${W}:${H}" -q:v 3 "${path.join(out, "explainer-poster.jpg")}"`, { stdio: "inherit" });

// Untertitel (WebVTT)
const subs = JSON.parse(readFileSync(path.join(here, "subtitles.json"), "utf8"));
const ts = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = (s % 60).toFixed(3).padStart(6, "0");
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec}`;
};
for (const [lang, cues] of Object.entries(subs)) {
  const vtt = ["WEBVTT", ""];
  cues.forEach((c, i) => vtt.push(String(i + 1), `${ts(c[0])} --> ${ts(c[1])}`, c[2], ""));
  writeFileSync(path.join(out, `explainer.${lang}.vtt`), vtt.join("\n"));
}
rmSync(tmp, { recursive: true, force: true });
console.log("fertig:", readdirSync(out));
