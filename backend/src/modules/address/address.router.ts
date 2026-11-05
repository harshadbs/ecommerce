import { Router } from 'express';
import { addressController } from './address.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  createAddressSchema,
  updateAddressSchema,
  addressIdSchema,
} from './address.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/addresses
 * @desc    Get all addresses for current user
 * @access  Private
 */
router.get('/', addressController.getAddresses.bind(addressController));

/**
 * @route   POST /api/addresses
 * @desc    Create new address
 * @access  Private
 */
router.post(
  '/',
  validate(createAddressSchema),
  addressController.createAddress.bind(addressController)
);

/**
 * @route   GET /api/addresses/:id
 * @desc    Get address by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(addressIdSchema),
  addressController.getAddress.bind(addressController)
);

/**
 * @route   PATCH /api/addresses/:id
 * @desc    Update address
 * @access  Private
 */
router.patch(
  '/:id',
  validate(addressIdSchema),
  validate(updateAddressSchema),
  addressController.updateAddress.bind(addressController)
);

/**
 * @route   DELETE /api/addresses/:id
 * @desc    Delete address
 * @access  Private
 */
router.delete(
  '/:id',
  validate(addressIdSchema),
  addressController.deleteAddress.bind(addressController)
);

/**
 * @route   PATCH /api/addresses/:id/default
 * @desc    Set address as default
 * @access  Private
 */
router.patch(
  '/:id/default',
  validate(addressIdSchema),
  addressController.setDefaultAddress.bind(addressController)
);

export default router;
