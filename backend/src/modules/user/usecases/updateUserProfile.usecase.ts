import { userPersistence } from '../persistence/index.js';
import { NotFoundError, ConflictError } from '../../../utils/errors.js';
import type { UpdateProfileInput } from '../user.validator.js';
import type { SafeUser } from '../../../types/index.js';

export class UpdateUserProfileUseCase {
  async execute(userId: string, data: UpdateProfileInput): Promise<SafeUser> {
    // Check if user exists
    const existingUser = await userPersistence.findById(userId);
    if (!existingUser) {
      throw new NotFoundError('errors.user_not_found');
    }

    // Check phone uniqueness if updating
    if (data.phone && data.phone !== existingUser.phone) {
      const phoneExists = await userPersistence.findByPhone(data.phone);
      if (phoneExists) {
        throw new ConflictError('errors.phone_exists');
      }
    }

    // Update user
    return userPersistence.update(userId, {
      name: data.name,
      phone: data.phone,
    });
  }
}

export const updateUserProfileUseCase = new UpdateUserProfileUseCase();
