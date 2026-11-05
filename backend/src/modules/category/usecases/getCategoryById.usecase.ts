import { Category } from '@prisma/client';
import { categoryPersistence } from '../persistence/index.js';
import { NotFoundError } from '../../../utils/errors.js';

export class GetCategoryByIdUseCase {
  async execute(id: string): Promise<Category> {
    const category = await categoryPersistence.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }
}

export const getCategoryByIdUseCase = new GetCategoryByIdUseCase();
