/**
 * Rendert die Hintergrundschleife für die Nutzungsbedingungen aus tools/video/terms-bg.html.
 *
 *   node tools/video/render-terms-bg.mjs
 *   (Playwright: lokal installiert oder über PLAYWRIGHT_MODULE=/pfad/zu/playwright/index.mjs)
 *
 * Statt eines Screencasts werden die Frames deterministisch gezeichnet: Für jeden
 * Frame wird die Szene auf den exakten Zeitpunkt gesetzt und fotografiert. Die
 * Schleife ist nahtlos, weil alle Bewegungen in PERIOD Sekunden periodisch sind.
 * Ergebnis in public/video/: terms-bg.mp4, terms-bg.webm, terms-bg-poster.jpg.
 * Das Video wird bereits beim Encodieren weichgezeichnet, damit es klein bleibt.
 */
import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const out = path.join(root, "public/video");
const tmp = path.join(here, ".tmp-terms");
mkdirSync(out, { recursive: true });
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const W = 1280;
const H = 720;
const FPS = 24;
const PERIOD = 12;
const FRAMES = FPS * PERIOD;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });
const page = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
await page.goto("file://" + path.join(here, "terms-bg.html"));
await page.waitForFunction(() => typeof window.__drawAt === "function");
// Eigene Animationsschleife anhalten, Frames gezielt zeichnen
await page.evaluate(() => {
  window.requestAnimationFrame = () => 0;
});
for (let i = 0; i < FRAMES; i++) {
  await page.evaluate((t) => window.__drawAt(t), i / FPS);
  await page.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, "0")}.png`), clip: { x: 0, y: 0, width: W, height: H } });
}
await browser.close();

const input = `-framerate ${FPS} -i "${path.join(tmp, "f%04d.png")}"`;
const vf = `-vf "gblur=sigma=5,format=yuv420p"`;
execSync(`ffmpeg -y ${input} ${vf} -an -c:v libx264 -preset slow -crf 27 -movflags +faststart "${path.join(out, "terms-bg.mp4")}"`, { stdio: "inherit" });
execSync(`ffmpeg -y ${input} ${vf} -an -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 "${path.join(out, "terms-bg.webm")}"`, { stdio: "inherit" });
execSync(`ffmpeg -y -i "${path.join(tmp, "f0000.png")}" -vf "gblur=sigma=5,scale=${W}:${H}" -q:v 4 "${path.join(out, "terms-bg-poster.jpg")}"`, { stdio: "inherit" });
rmSync(tmp, { recursive: true, force: true });
for (const f of ["terms-bg.mp4", "terms-bg.webm", "terms-bg-poster.jpg"]) console.log(f, Math.round(statSync(path.join(out, f)).size / 1024), "kB");
console.log("fertig:", readdirSync(out).filter((f) => f.startsWith("terms-bg")));
