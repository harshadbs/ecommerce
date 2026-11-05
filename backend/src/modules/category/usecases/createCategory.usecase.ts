import { Category } from '@prisma/client';
import { categoryPersistence } from '../persistence/index.js';
import { ConflictError, NotFoundError } from '../../../utils/errors.js';
import type { CreateCategoryInput } from '../category.validator.js';

export class CreateCategoryUseCase {
  async execute(data: CreateCategoryInput): Promise<Category> {
    // Generate slug from name if not provided
    const slug = data.slug || this.generateSlug(data.name);

    // Check slug uniqueness
    const slugExists = await categoryPersistence.slugExists(slug);
    if (slugExists) {
      throw new ConflictError('Category with this slug already exists');
    }

    // Validate parent exists if provided
    if (data.parentId) {
      const parent = await categoryPersistence.findById(data.parentId);
      if (!parent) {
        throw new NotFoundError('Parent category not found');
      }
    }

    return categoryPersistence.create({
      name: data.name,
      slug,
      description: data.description,
      image: data.image,
      parent: data.parentId ? { connect: { id: data.parentId } } : undefined,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

export const createCategoryUseCase = new CreateCategoryUseCase();
