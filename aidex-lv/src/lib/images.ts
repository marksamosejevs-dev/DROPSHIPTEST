import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

/** Builds an AVIF + WebP responsive source set for a <picture>. */
export async function responsive(src: ImageMetadata, widths: number[], quality = 72) {
  const build = async (format: 'avif' | 'webp' | 'jpg') => {
    const imgs = await Promise.all(widths.map((w) => getImage({ src, width: w, format, quality: format === 'avif' ? quality - 12 : quality })));
    return imgs.map((im, i) => `${im.src} ${widths[i]}w`).join(', ');
  };
  const [avif, webp] = await Promise.all([build('avif'), build('webp')]);
  const fallback = await getImage({ src, width: widths[Math.floor(widths.length / 2)], format: 'jpg', quality });
  return { avif, webp, fallback: fallback.src, width: src.width, height: src.height };
}
