import { prisma } from '../../../config/database.js';
import { Category, Prisma } from '@prisma/client';

export class CategoryPersistence {
  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
      include: { children: true, parent: true },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { slug },
      include: { children: true, parent: true },
    });
  }

  async findAll(options?: {
    activeOnly?: boolean;
    parentId?: string | null;
  }): Promise<Category[]> {
    const where: Prisma.CategoryWhereInput = {};

    if (options?.activeOnly) {
      where.isActive = true;
    }

    if (options?.parentId === null) {
      where.parentId = null;
    } else if (options?.parentId) {
      where.parentId = options.parentId;
    }

    return prisma.category.findMany({
      where,
      include: {
        children: {
          where: options?.activeOnly ? { isActive: true } : undefined,
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findTree(): Promise<Category[]> {
    return prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({
      data,
      include: { parent: true },
    });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
      include: { parent: true, children: true },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }

  async hasChildren(id: string): Promise<boolean> {
    const count = await prisma.category.count({ where: { parentId: id } });
    return count > 0;
  }

  async hasProducts(id: string): Promise<boolean> {
    const count = await prisma.product.count({ where: { categoryId: id } });
    return count > 0;
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.CategoryWhereInput = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await prisma.category.count({ where });
    return count > 0;
  }
}

export const categoryPersistence = new CategoryPersistence();
