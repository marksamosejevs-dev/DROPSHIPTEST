import sharp from 'sharp';
const files = process.argv.slice(2, -1), out = process.argv.at(-1);
const tw = 800, th = 450;
const comps = await Promise.all(files.map(async (f, i) => ({ input: await sharp(f).resize(tw, th, { fit: 'cover' }).toBuffer(), left: (i % 2) * tw, top: Math.floor(i / 2) * th })));
await sharp({ create: { width: tw * 2, height: th * Math.ceil(files.length / 2), channels: 3, background: '#000' } }).composite(comps).jpeg().toFile(out);
