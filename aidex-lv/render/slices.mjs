// node render/slices.mjs <png> <prefix> <sliceHeight> <outWidth>
import sharp from 'sharp';
const [,, src, prefix, sh = '1800', ow = '960'] = process.argv;
const m = await sharp(src).metadata();
const n = Math.ceil(m.height / +sh);
for (let i = 0; i < n; i++) {
  const top = i * +sh, h = Math.min(+sh, m.height - top);
  await sharp(src).extract({ left: 0, top, width: m.width, height: h }).resize(+ow).toFile(`${prefix}${i}.png`);
}
console.log(m.width, m.height, n);
