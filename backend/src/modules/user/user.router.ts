import { Router } from 'express';
import { userController } from './user.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { updateProfileSchema } from './user.validator.js';

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  userController.getProfile.bind(userController)
);

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile.bind(userController)
);

/**
 * @route   DELETE /api/users/me
 * @desc    Deactivate current user account
 * @access  Private
 */
router.delete(
  '/me',
  authenticate,
  userController.deactivateAccount.bind(userController)
);

export default router;
