import { Router } from 'express';
import { productController } from './product.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { requireAdmin } from '../../middleware/auth.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productSlugSchema,
  productSearchSchema,
  addImageSchema,
  addVariantSchema,
  updateVariantSchema,
} from './product.validator.js';

const router = Router();

// ===== Public routes =====

/**
 * @route   GET /api/products
 * @desc    Search/list products with filters, sorting, pagination
 * @access  Public
 */
router.get(
  '/',
  validate(productSearchSchema),
  productController.searchProducts.bind(productController)
);

/**
 * @route   GET /api/products/slug/:slug
 * @desc    Get product by slug
 * @access  Public
 */
router.get(
  '/slug/:slug',
  validate(productSlugSchema),
  productController.getProductBySlug.bind(productController)
);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get(
  '/:id',
  validate(productIdSchema),
  productController.getProductById.bind(productController)
);

// ===== Admin routes =====

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Admin
 */
router.post(
  '/',
  ...requireAdmin(),
  validate(createProductSchema),
  productController.createProduct.bind(productController)
);

/**
 * @route   PATCH /api/products/:id
 * @desc    Update product
 * @access  Admin
 */
router.patch(
  '/:id',
  ...requireAdmin(),
  validate(productIdSchema),
  validate(updateProductSchema),
  productController.updateProduct.bind(productController)
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Admin
 */
router.delete(
  '/:id',
  ...requireAdmin(),
  validate(productIdSchema),
  productController.deleteProduct.bind(productController)
);

// ===== Image management (Admin) =====

/**
 * @route   POST /api/products/:id/images
 * @desc    Add image to product
 * @access  Admin
 */
router.post(
  '/:id/images',
  ...requireAdmin(),
  validate(addImageSchema),
  productController.addImage.bind(productController)
);

/**
 * @route   DELETE /api/products/:id/images/:imageId
 * @desc    Remove image from product
 * @access  Admin
 */
router.delete(
  '/:id/images/:imageId',
  ...requireAdmin(),
  productController.removeImage.bind(productController)
);

/**
 * @route   PATCH /api/products/:id/images/:imageId/primary
 * @desc    Set image as primary
 * @access  Admin
 */
router.patch(
  '/:id/images/:imageId/primary',
  ...requireAdmin(),
  productController.setPrimaryImage.bind(productController)
);

// ===== Variant management (Admin) =====

/**
 * @route   POST /api/products/:id/variants
 * @desc    Add variant to product
 * @access  Admin
 */
router.post(
  '/:id/variants',
  ...requireAdmin(),
  validate(addVariantSchema),
  productController.addVariant.bind(productController)
);

/**
 * @route   PATCH /api/products/:id/variants/:variantId
 * @desc    Update variant
 * @access  Admin
 */
router.patch(
  '/:id/variants/:variantId',
  ...requireAdmin(),
  validate(updateVariantSchema),
  productController.updateVariant.bind(productController)
);

/**
 * @route   DELETE /api/products/:id/variants/:variantId
 * @desc    Remove variant
 * @access  Admin
 */
router.delete(
  '/:id/variants/:variantId',
  ...requireAdmin(),
  productController.removeVariant.bind(productController)
);

export default router;
