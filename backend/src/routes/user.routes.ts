import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { updateProfileSchema } from '../validators/user.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/me', userController.getProfile.bind(userController));

router.patch(
  '/me',
  validate(updateProfileSchema),
  userController.updateProfile.bind(userController)
);

router.delete('/me', userController.deactivateAccount.bind(userController));

export default router;
