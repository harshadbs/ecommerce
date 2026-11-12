import { Product } from '@prisma/client';
import { productPersistence } from '../persistence/index.js';
import { categoryPersistence } from '../../category/persistence/index.js';
import { ConflictError, NotFoundError } from '../../../utils/errors.js';
import type { CreateProductInput } from '../product.validator.js';
import { mediaService } from '../../media/index.js';
import { prepareProductImages } from './productImages.helper.js';

export class CreateProductUseCase {
  async execute(data: CreateProductInput): Promise<Product> {
    // Validate category
    const category = await categoryPersistence.findById(data.categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Generate slug
    const slug = data.slug || this.generateSlug(data.name);
    const slugExists = await productPersistence.slugExists(slug);
    if (slugExists) {
      throw new ConflictError('Product with this slug already exists');
    }

    // Check SKU uniqueness
    if (data.sku) {
      const skuExists = await productPersistence.skuExists(data.sku);
      if (skuExists) {
        throw new ConflictError('Product with this SKU already exists');
      }
    }

    // Check variant SKU uniqueness
    if (data.variants?.length) {
      for (const variant of data.variants) {
        const variantSkuExists = await productPersistence.variantSkuExists(variant.sku);
        if (variantSkuExists) {
          throw new ConflictError(`Variant SKU "${variant.sku}" already exists`);
        }
      }
    }

    const images = await prepareProductImages(data.images ?? []);

    try {
      return await productPersistence.create({
        category: { connect: { id: data.categoryId } },
        name: data.name,
        slug,
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
        images: images.rows.length ? { create: images.rows } : undefined,
        variants: data.variants?.length
          ? {
              create: data.variants.map((v) => ({
                sku: v.sku,
                name: v.name,
                size: v.size,
                color: v.color,
                price: v.price,
                stock: v.stock,
              })),
            }
          : undefined,
      });
    } catch (error) {
      await mediaService.deleteByUrls(images.uploaded);
      throw error;
    }
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

export const createProductUseCase = new CreateProductUseCase();
