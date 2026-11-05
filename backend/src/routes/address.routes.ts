import { Router } from 'express';
import { addressController } from '../controllers/address.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createAddressSchema,
  updateAddressSchema,
  addressIdSchema,
} from '../validators/address.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', addressController.getAddresses.bind(addressController));

router.post(
  '/',
  validate(createAddressSchema),
  addressController.createAddress.bind(addressController)
);

router.get(
  '/:id',
  validate(addressIdSchema),
  addressController.getAddress.bind(addressController)
);

router.patch(
  '/:id',
  validate(addressIdSchema),
  validate(updateAddressSchema),
  addressController.updateAddress.bind(addressController)
);

router.delete(
  '/:id',
  validate(addressIdSchema),
  addressController.deleteAddress.bind(addressController)
);

router.patch(
  '/:id/default',
  validate(addressIdSchema),
  addressController.setDefaultAddress.bind(addressController)
);

export default router;
