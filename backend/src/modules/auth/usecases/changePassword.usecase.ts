import { userPersistence } from '../../user/persistence/index.js';
import { refreshTokenPersistence } from '../persistence/index.js';
import { hashPassword, verifyPassword } from '../../../utils/password.js';
import { NotFoundError, BadRequestError } from '../../../utils/errors.js';
import type { ChangePasswordInput } from '../auth.validator.js';

export class ChangePasswordUseCase {
  async execute(userId: string, data: ChangePasswordInput): Promise<void> {
    // Get user
    const user = await userPersistence.findById(userId);
    if (!user) {
      throw new NotFoundError('errors.user_not_found');
    }

    // Verify current password
    const isValidPassword = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new BadRequestError('errors.current_password_wrong');
    }

    // Check if new password is same as old
    const isSamePassword = await verifyPassword(data.newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new BadRequestError('errors.same_password');
    }

    // Hash new password
    const passwordHash = await hashPassword(data.newPassword);

    // Update password
    await userPersistence.updatePassword(userId, passwordHash);

    // Invalidate all refresh tokens
    await refreshTokenPersistence.deleteByUserId(userId);
  }
}

export const changePasswordUseCase = new ChangePasswordUseCase();
