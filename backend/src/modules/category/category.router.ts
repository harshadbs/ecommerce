import { Router } from 'express';
import { categoryController } from './category.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { requireAdmin } from '../../middleware/auth.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  categorySlugSchema,
} from './category.validator.js';

const router = Router();

// ===== Public routes =====

/**
 * @route   GET /api/categories
 * @desc    List all categories (supports ?parent_id=x&active=true)
 * @access  Public
 */
router.get('/', categoryController.getCategories.bind(categoryController));

/**
 * @route   GET /api/categories/tree
 * @desc    Get full category tree (nested)
 * @access  Public
 */
router.get('/tree', categoryController.getCategoryTree.bind(categoryController));

/**
 * @route   GET /api/categories/slug/:slug
 * @desc    Get category by slug
 * @access  Public
 */
router.get(
  '/slug/:slug',
  validate(categorySlugSchema),
  categoryController.getCategoryBySlug.bind(categoryController)
);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get(
  '/:id',
  validate(categoryIdSchema),
  categoryController.getCategoryById.bind(categoryController)
);

// ===== Admin routes =====

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Admin
 */
router.post(
  '/',
  ...requireAdmin(),
  validate(createCategorySchema),
  categoryController.createCategory.bind(categoryController)
);

/**
 * @route   PATCH /api/categories/:id
 * @desc    Update category
 * @access  Admin
 */
router.patch(
  '/:id',
  ...requireAdmin(),
  validate(categoryIdSchema),
  validate(updateCategorySchema),
  categoryController.updateCategory.bind(categoryController)
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Admin
 */
router.delete(
  '/:id',
  ...requireAdmin(),
  validate(categoryIdSchema),
  categoryController.deleteCategory.bind(categoryController)
);

export default router;
