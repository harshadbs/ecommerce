import { Product } from '@prisma/client';
import { productPersistence } from '../persistence/index.js';
import { categoryPersistence } from '../../category/persistence/index.js';
import { NotFoundError, ConflictError } from '../../../utils/errors.js';
import type { UpdateProductInput } from '../product.validator.js';

export class UpdateProductUseCase {
  async execute(id: string, data: UpdateProductInput): Promise<Product> {
    const product = await productPersistence.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Validate category if changing
    if (data.categoryId && data.categoryId !== product.categoryId) {
      const category = await categoryPersistence.findById(data.categoryId);
      if (!category) {
        throw new NotFoundError('Category not found');
      }
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== product.slug) {
      const slugExists = await productPersistence.slugExists(data.slug, id);
      if (slugExists) {
        throw new ConflictError('Product with this slug already exists');
      }
    }

    // Check SKU uniqueness if changing
    if (data.sku && data.sku !== product.sku) {
      const skuExists = await productPersistence.skuExists(data.sku, id);
      if (skuExists) {
        throw new ConflictError('Product with this SKU already exists');
      }
    }

    return productPersistence.update(id, {
      category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
      name: data.name,
      slug: data.slug,
      description: data.description,
      shortDesc: data.shortDesc,
      price: data.price,
      mrp: data.mrp,
      sku: data.sku,
      stock: data.stock,
      lowStockThreshold: data.lowStockThreshold,
      status: data.status,
      isFeatured: data.isFeatured,
      metaTitle: data.metaTitle,
      metaDesc: data.metaDesc,
    });
  }
}

export const updateProductUseCase = new UpdateProductUseCase();
