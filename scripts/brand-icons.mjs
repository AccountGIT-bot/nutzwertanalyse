#!/usr/bin/env node
/**
 * Erzeugt Favicon und App-Icons aus der Bildmarke (public/logo.svg) mit Chromium (Playwright).
 * Ausgabe: public/icons/icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png
 * sowie PNGs für favicon.ico (16/32/48) in einem Zielordner; das .ico setzt ImageMagick zusammen.
 *   node scripts/brand-icons.mjs <tmp-ordner>
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const tmp = process.argv[2] ?? "/tmp";
const svg = readFileSync(join(root, "public/logo.svg"), "utf8");
const inner = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<title>.*?<\/title>/, "");
/* Vollflächige Variante: Hintergrund ohne Rundung (für maskierbare und Apple-Icons), Zeichen auf 60 % verkleinert */
const bars = inner.replace(/<rect width="64" height="64" rx="15" fill="#0b5d5a"\/>/, "");
const full = (scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0b5d5a"/><g transform="translate(32 32) scale(${scale}) translate(-32 -32)">${bars}</g></svg>`;
const jobs = [
  ["public/icons/icon-192.png", 192, svg],
  ["public/icons/icon-512.png", 512, svg],
  ["public/icons/icon-maskable-512.png", 512, full(0.78)],
  ["public/icons/apple-touch-icon.png", 180, full(0.86)],
  [join(tmp, "fav-16.png"), 16, svg],
  [join(tmp, "fav-32.png"), 32, svg],
  [join(tmp, "fav-48.png"), 48, svg],
];
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [out, size, markup] of jobs) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${markup.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: out.startsWith("/") ? out : join(root, out), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  console.log(out, size);
}
await browser.close();
