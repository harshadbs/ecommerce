import { mediaService } from '../../media/index.js';
import type { ProductImageInput } from '../product.validator.js';

export interface PreparedProductImages {
  rows: { url: string; alt?: string; isPrimary: boolean; sortOrder: number }[];
  /** URLs stored by this call; delete them if the product write fails. */
  uploaded: string[];
}

/**
 * Store any new uploads (data URLs) in tbl_media and build ProductImage rows in array order.
 * Runs sequentially so only one decoded image is held in memory at a time.
 */
export async function prepareProductImages(images: ProductImageInput[]): Promise<PreparedProductImages> {
  const uploaded: string[] = [];
  const primaryIndex = Math.max(0, images.findIndex((img) => img.isPrimary));
  try {
    const rows: PreparedProductImages['rows'] = [];
    for (const [index, img] of images.entries()) {
      const url = await mediaService.persist(img.url);
      if (url !== img.url) uploaded.push(url);
      rows.push({ url, alt: img.alt, isPrimary: index === primaryIndex, sortOrder: index });
    }
    return { rows, uploaded };
  } catch (error) {
    await mediaService.deleteByUrls(uploaded);
    throw error;
  }
}
