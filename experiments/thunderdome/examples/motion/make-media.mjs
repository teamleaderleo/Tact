#!/usr/bin/env node
// Draw the four busy-indicator treatments and encode them with ffmpeg.
//
//   node make-media.mjs          # writes clips/<treatment>-<theme>.webm
//
// The clips are mocks, not recordings: a sidebar row reduced to its shapes so the
// duel is about the motion and nothing else. No fake copy, no fake project names,
// nothing to read instead of watching. Regenerate after editing the treatments.
//
// Needs ffmpeg on PATH. No node dependencies: frames are drawn into a byte array
// and piped to ffmpeg as rawvideo.

import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";

const W = 480, H = 150, FPS = 24, SECONDS = 3, SS = 2;   // SS: supersample, downscaled on the way out
const SW = W * SS, SH = H * SS;

const THEMES = {
  // sheen is the shimmer wash. It has to move away from the panel, so it darkens on
  // white and lightens on near-black; white-on-white would have been an invisible
  // treatment quietly losing every duel.
  light: { bg: [0xF3, 0xF4, 0xF6], panel: [0xFF, 0xFF, 0xFF], rule: [0xDC, 0xDF, 0xE5],
           ink: [0x15, 0x17, 0x1C], muted: [0x8A, 0x90, 0x9C], accent: [0x2F, 0x6F, 0xEB],
           sheen: [0x15, 0x17, 0x1C], sheenA: .07 },
  dark:  { bg: [0x10, 0x12, 0x16], panel: [0x18, 0x1B, 0x21], rule: [0x2A, 0x2F, 0x38],
           ink: [0xE6, 0xE8, 0xED], muted: [0x6F, 0x76, 0x84], accent: [0x7A, 0xA7, 0xFF],
           sheen: [0xFF, 0xFF, 0xFF], sheenA: .13 },
};

// ---- drawing ----
const px = new Uint8Array(SW * SH * 3);

function blend(x, y, c, a) {
  if (a <= 0 || x < 0 || y < 0 || x >= SW || y >= SH) return;
  const i = (y * SW + x) * 3, k = Math.min(1, a);
  px[i] += (c[0] - px[i]) * k;
  px[i + 1] += (c[1] - px[i + 1]) * k;
  px[i + 2] += (c[2] - px[i + 2]) * k;
}

function clear(c) { for (let i = 0; i < px.length; i += 3) { px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; } }

// Rounded rect in 1x coordinates. Coverage at the corners keeps the curve from stairstepping.
function rect(x, y, w, h, r, c, a = 1) {
  x *= SS; y *= SS; w *= SS; h *= SS; r *= SS;
  for (let yy = Math.floor(y); yy < Math.ceil(y + h); yy++) {
    for (let xx = Math.floor(x); xx < Math.ceil(x + w); xx++) {
      const dx = Math.max(x + r - xx, 0, xx - (x + w - r - 1));
      const dy = Math.max(y + r - yy, 0, yy - (y + h - r - 1));
      const cov = r <= 0 ? 1 : Math.min(1, r - Math.hypot(dx, dy) + .5);
      if (cov > 0) blend(xx, yy, c, a * cov);
    }
  }
}

function dot(cx, cy, r, c, a = 1) {
  cx *= SS; cy *= SS; r *= SS;
  for (let yy = Math.floor(cy - r - 1); yy <= cy + r + 1; yy++)
    for (let xx = Math.floor(cx - r - 1); xx <= cx + r + 1; xx++) {
      const cov = Math.min(1, r - Math.hypot(xx - cx, yy - cy) + .5);
      if (cov > 0) blend(xx, yy, c, a * cov);
    }
}

// ---- the row every treatment decorates ----
const CARD = { x: 16, y: 16, w: 448, h: 118, r: 10 };
const GLYPH = { x: 42, y: 75 };

function row(t) {
  clear(t.bg);
  rect(CARD.x - 1, CARD.y - 1, CARD.w + 2, CARD.h + 2, CARD.r + 1, t.rule);
  rect(CARD.x, CARD.y, CARD.w, CARD.h, CARD.r, t.panel);
  rect(68, 58, 156, 11, 5.5, t.ink, .88);          // title
  rect(68, 79, 104, 9, 4.5, t.muted, .75);         // subtitle
  rect(376, 68, 56, 9, 4.5, t.muted, .5);          // right-hand meta
}

// ---- treatments: p is 0..1 through a 1.5s cycle, so each clip is two clean loops ----
const TREATMENTS = {
  // A ring of dots with the bright head sweeping round. The loudest option.
  spinner(t, p) {
    const n = 12;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
      const lead = ((i / n) - p + 1) % 1;
      blendDot(ang, Math.max(.12, 1 - lead * 2.6));
    }
    function blendDot(ang, a) { dot(GLYPH.x + Math.cos(ang) * 8, GLYPH.y + Math.sin(ang) * 8, 2, t.accent, a); }
  },
  // The status dot the row already has, breathing. Nothing new on screen.
  pulse(t, p) {
    dot(GLYPH.x, GLYPH.y, 5, t.accent, .3 + .7 * (.5 - .5 * Math.cos(p * Math.PI * 2)));
  },
  // A light band washing across the whole row. The motion is the row, not a glyph.
  shimmer(t, p) {
    dot(GLYPH.x, GLYPH.y, 5, t.accent, .9);
    const head = CARD.x - 90 + p * (CARD.w + 180), band = 64;
    for (let x = Math.max(CARD.x, head - band); x < Math.min(CARD.x + CARD.w, head + band); x++) {
      const a = Math.pow(1 - Math.abs(x - head) / band, 2) * t.sheenA;
      rect(x, CARD.y, 1, CARD.h, 0, t.sheen, a);
    }
  },
  // A hairline running along the bottom edge. Motion pushed out of the content entirely.
  bar(t, p) {
    dot(GLYPH.x, GLYPH.y, 5, t.accent, .9);
    const y = CARD.y + CARD.h - 3, len = 120;
    const head = -len + p * (CARD.w + len * 2);
    const x0 = Math.max(0, head), x1 = Math.min(CARD.w, head + len);
    if (x1 > x0) rect(CARD.x + x0, y, x1 - x0, 2, 1, t.accent, .85);
  },
};

// ---- encode ----
function encode(name, theme, draw) {
  const t = THEMES[theme], out = `clips/${name}-${theme}.webm`;
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error",
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${SW}x${SH}`, "-r", String(FPS), "-i", "-",
    "-vf", `scale=${W}:${H}:flags=area`,
    "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "36", "-row-mt", "1", "-an", out]);
  ff.stderr.pipe(process.stderr);
  return new Promise((res, rej) => {
    ff.on("error", rej);
    ff.on("close", code => code === 0 ? res(out) : rej(new Error(`ffmpeg exited ${code} for ${out}`)));
    (async () => {
      for (let f = 0; f < FPS * SECONDS; f++) {
        row(t);
        draw(t, (f % (FPS * 1.5)) / (FPS * 1.5));
        if (!ff.stdin.write(Buffer.from(px))) await new Promise(r => ff.stdin.once("drain", r));
      }
      ff.stdin.end();
    })().catch(rej);
  });
}

mkdirSync("clips", { recursive: true });
for (const [name, draw] of Object.entries(TREATMENTS))
  for (const theme of Object.keys(THEMES))
    console.log("wrote", await encode(name, theme, draw));
