import { userPersistence } from '../persistence/index.js';
import { NotFoundError } from '../../../utils/errors.js';

export class DeactivateUserUseCase {
  async execute(userId: string): Promise<void> {
    const user = await userPersistence.findById(userId);
    
    if (!user) {
      throw new NotFoundError('errors.user_not_found');
    }

    await userPersistence.update(userId, { isActive: false });
  }
}

export const deactivateUserUseCase = new DeactivateUserUseCase();
