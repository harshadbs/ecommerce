import { userPersistence } from '../persistence/index.js';
import { NotFoundError } from '../../../utils/errors.js';
import type { SafeUser } from '../../../types/index.js';

export class GetUserProfileUseCase {
  async execute(userId: string): Promise<SafeUser> {
    const user = await userPersistence.findByIdSafe(userId);
    
    if (!user) {
      throw new NotFoundError('errors.user_not_found');
    }
    
    return user;
  }
}

export const getUserProfileUseCase = new GetUserProfileUseCase();
