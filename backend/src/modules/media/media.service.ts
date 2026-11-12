import { mediaPersistence } from './media.persistence.js';
import { BadRequestError } from '../../utils/errors.js';

export const MEDIA_PATH_PREFIX = '/api/media/';
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// Raster formats only, checked by magic bytes. SVG is excluded: it can carry script.
const IMAGE_SIGNATURES: Record<string, (b: Buffer) => boolean> = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
  'image/gif': (b) => b.toString('ascii', 0, 4) === 'GIF8',
};

export class MediaService {
  isDataUrl(value: string): boolean {
    return value.startsWith('data:');
  }

  /** Media id for a URL this service issued, otherwise null. */
  idFromUrl(url: string | null | undefined): string | null {
    return url?.startsWith(MEDIA_PATH_PREFIX) ? url.slice(MEDIA_PATH_PREFIX.length) : null;
  }

  /** Decode a `data:image/...;base64,` URL, store the bytes, and return the path they are served at. */
  async saveImageDataUrl(dataUrl: string): Promise<string> {
    const comma = dataUrl.indexOf(',');
    const header = dataUrl.slice(0, comma); // e.g. "data:image/png;base64"
    const match = /^data:(image\/[a-z]+);base64$/.exec(header);
    const mimeType = match?.[1];
    if (comma === -1 || !mimeType || !IMAGE_SIGNATURES[mimeType]) {
      throw new BadRequestError('Image must be a JPEG, PNG, WebP or GIF');
    }

    const data = Buffer.from(dataUrl.slice(comma + 1), 'base64');
    if (data.length === 0 || !IMAGE_SIGNATURES[mimeType](data)) {
      throw new BadRequestError('Image file is corrupt or not the type it claims to be');
    }
    if (data.length > MAX_IMAGE_BYTES) {
      throw new BadRequestError('Image must be 2MB or smaller');
    }

    const media = await mediaPersistence.create({ mimeType, data });
    return MEDIA_PATH_PREFIX + media.id;
  }

  /** Store `src` if it is a new upload (data URL); otherwise return it unchanged. */
  async persist(src: string): Promise<string> {
    return this.isDataUrl(src) ? this.saveImageDataUrl(src) : src;
  }

  /** Delete the stored images behind these URLs; external URLs are ignored. */
  async deleteByUrls(urls: string[]): Promise<void> {
    const ids = urls.map((url) => this.idFromUrl(url)).filter((id): id is string => id !== null);
    if (ids.length) await mediaPersistence.deleteByIds(ids);
  }
}

export const mediaService = new MediaService();
