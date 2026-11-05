import { userRepository } from '../repositories/user.repository.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import type { UpdateProfileInput } from '../validators/user.validator.js';
import type { SafeUser } from '../types/index.js';

export class UserService {
  async getProfile(userId: string): Promise<SafeUser> {
    const user = await userRepository.findByIdSafe(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput): Promise<SafeUser> {
    // Check if user exists
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Check phone uniqueness if updating
    if (data.phone && data.phone !== existingUser.phone) {
      const phoneExists = await userRepository.findByPhone(data.phone);
      if (phoneExists) {
        throw new ConflictError('Phone number is already in use');
      }
    }

    // Update user
    return userRepository.update(userId, {
      name: data.name,
      phone: data.phone,
    });
  }

  async deactivateAccount(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await userRepository.update(userId, { isActive: false });
  }
}

export const userService = new UserService();
