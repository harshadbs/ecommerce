import { categoryPersistence } from '../persistence/index.js';
import { NotFoundError, BadRequestError } from '../../../utils/errors.js';

export class DeleteCategoryUseCase {
  async execute(id: string): Promise<void> {
    const category = await categoryPersistence.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Prevent deletion if has children
    const hasChildren = await categoryPersistence.hasChildren(id);
    if (hasChildren) {
      throw new BadRequestError('Cannot delete category with subcategories. Remove subcategories first.');
    }

    // Prevent deletion if has products
    const hasProducts = await categoryPersistence.hasProducts(id);
    if (hasProducts) {
      throw new BadRequestError('Cannot delete category with products. Move or remove products first.');
    }

    await categoryPersistence.delete(id);
  }
}

export const deleteCategoryUseCase = new DeleteCategoryUseCase();
