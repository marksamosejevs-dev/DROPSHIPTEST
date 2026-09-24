// node render/msheet.mjs <png> <prefix> [cols] [sliceH]  — mobile contact sheets
import sharp from 'sharp';
const [,, src, prefix, cols = '4', sh = '2600'] = process.argv;
const m = await sharp(src).metadata(); const W = m.width, C = +cols, H = +sh;
const n = Math.ceil(m.height / H);
for (let g = 0; g < Math.ceil(n / C); g++) {
  const comps = [];
  for (let c = 0; c < C; c++) { const i = g * C + c; if (i >= n) break; const top = i * H, h = Math.min(H, m.height - top);
    comps.push({ input: await sharp(src).extract({ left: 0, top, width: W, height: h }).toBuffer(), left: c * (W + 20), top: 0 }); }
  const buf = await sharp({ create: { width: C * (W + 20), height: H, channels: 3, background: '#888' } }).composite(comps).png().toBuffer();
  await sharp(buf).resize(1500).png().toFile(`${prefix}${g}.png`);
}
console.log(n);
