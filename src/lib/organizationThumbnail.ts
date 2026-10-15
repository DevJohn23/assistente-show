import sharp from 'sharp';

// Storage retains the original; only the authenticated response is resized.
export async function organizationThumbnail(input: ArrayBuffer) {
  return sharp(Buffer.from(input), { limitInputPixels: 40_000_000 })
    .rotate().resize({ width: 384, height: 384, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 }).toBuffer();
}
