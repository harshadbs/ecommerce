export const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/webp';
export const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;

/**
 * Downscale an image to fit `maxDimension` and re-encode it (WebP where the browser can),
 * returning a data URL for upload. The API stores the bytes and returns a /api/media URL.
 */
export async function compressImage(file: File, maxDimension = 1200): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const webp = canvas.toDataURL('image/webp', 0.85);
  if (webp.startsWith('data:image/webp')) return webp;
  // Safari can't encode WebP; keep PNG for transparency, JPEG otherwise
  return file.type === 'image/png' ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.85);
}
