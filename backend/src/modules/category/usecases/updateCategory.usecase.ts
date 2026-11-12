import { Category } from '@prisma/client';
import { categoryPersistence } from '../persistence/index.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../../utils/errors.js';
import type { UpdateCategoryInput } from '../category.validator.js';

export class UpdateCategoryUseCase {
  async execute(id: string, data: UpdateCategoryInput): Promise<Category> {
    const category = await categoryPersistence.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== category.slug) {
      const slugExists = await categoryPersistence.slugExists(data.slug, id);
      if (slugExists) {
        throw new ConflictError('Category with this slug already exists');
      }
    }

    // Prevent setting parent to self or descendant
    if (data.parentId !== undefined) {
      if (data.parentId === id) {
        throw new BadRequestError('Category cannot be its own parent');
      }
      if (data.parentId) {
        const parent = await categoryPersistence.findById(data.parentId);
        if (!parent) {
          throw new NotFoundError('Parent category not found');
        }
      }
    }

    return categoryPersistence.update(id, {
      name: data.name,
      slug: data.slug,
      description: data.description,
      parent: data.parentId === null
        ? { disconnect: true }
        : data.parentId
          ? { connect: { id: data.parentId } }
          : undefined,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    });
  }
}

export const updateCategoryUseCase = new UpdateCategoryUseCase();
