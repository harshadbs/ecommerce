import { Category } from '@prisma/client';
import { categoryPersistence } from '../persistence/index.js';
import { NotFoundError } from '../../../utils/errors.js';

export class GetCategoryBySlugUseCase {
  async execute(slug: string): Promise<Category> {
    const category = await categoryPersistence.findBySlug(slug);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }
}

export const getCategoryBySlugUseCase = new GetCategoryBySlugUseCase();
