import { z } from 'zod';
import { MEDIA_PATH_PREFIX } from './media.service.js';

/**
 * An image reference in a request body: a new upload as a base64 data URL (stored on save),
 * an already-stored /api/media path, or an external http(s) URL.
 * ~2.8M chars of base64 covers the 2MB decoded limit enforced by the media service.
 */
export const imageSourceSchema = z
  .string()
  .max(2_800_000, 'Image must be 2MB or smaller')
  .refine(
    (v) => v.startsWith('data:image/') || v.startsWith(MEDIA_PATH_PREFIX) || /^https?:\/\//.test(v),
    'Image must be an uploaded image or an http(s) URL'
  );
