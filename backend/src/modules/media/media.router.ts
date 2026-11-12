import { Router } from 'express';
import { mediaPersistence } from './media.persistence.js';
import { mediaLimiter } from '../../middleware/rateLimiter.middleware.js';
import { NotFoundError } from '../../utils/errors.js';

const router = Router();

/**
 * @route   GET /api/media/:id
 * @desc    Serve stored image bytes (rows are immutable, so cache forever)
 * @access  Public
 */
router.get('/:id', mediaLimiter, async (req, res, next) => {
  try {
    const etag = `"${req.params.id}"`;
    res.set({
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: etag,
      // helmet defaults to same-origin, which would block the storefront and admin
      // (different origins) from embedding these images.
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    if (req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }

    const media = await mediaPersistence.findById(req.params.id);
    if (!media) throw new NotFoundError('Image not found');

    res.set({ 'Content-Type': media.mimeType, 'Content-Length': String(media.size) });
    res.end(media.data);
  } catch (error) {
    // Don't let a 404 be cached for a year
    res.set('Cache-Control', 'no-store');
    next(error);
  }
});

export default router;
