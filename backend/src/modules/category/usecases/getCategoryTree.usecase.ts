import { Category } from '@prisma/client';
import { categoryPersistence } from '../persistence/index.js';

export class GetCategoryTreeUseCase {
  async execute(): Promise<Category[]> {
    return categoryPersistence.findTree();
  }
}

export const getCategoryTreeUseCase = new GetCategoryTreeUseCase();
