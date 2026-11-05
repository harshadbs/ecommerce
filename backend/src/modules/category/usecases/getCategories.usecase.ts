import { Category } from '@prisma/client';
import { categoryPersistence } from '../persistence/index.js';

export class GetCategoriesUseCase {
  async execute(options?: { activeOnly?: boolean; parentId?: string | null }): Promise<Category[]> {
    return categoryPersistence.findAll(options);
  }
}

export const getCategoriesUseCase = new GetCategoriesUseCase();
