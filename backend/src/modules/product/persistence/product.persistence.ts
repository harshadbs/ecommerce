import { prisma } from '../../../config/database.js';
import { Product, ProductImage, ProductVariant, Prisma, ProductStatus } from '@prisma/client';

export interface ProductSearchOptions {
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc' | 'name_desc';
  skip: number;
  limit: number;
}

const productIncludes = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }] },
  variants: { where: { isActive: true }, orderBy: { createdAt: 'asc' as const } },
  _count: { select: { reviews: true } },
};

export class ProductPersistence {
  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: productIncludes,
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { slug },
      include: productIncludes,
    });
  }

  async search(options: ProductSearchOptions): Promise<{ products: Product[]; total: number }> {
    const where: Prisma.ProductWhereInput = {};

    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
        { sku: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    if (options.categoryId) {
      where.categoryId = options.categoryId;
    }

    if (options.status) {
      where.status = options.status;
    } else {
      // Default: only show active products for public
      where.status = ProductStatus.ACTIVE;
    }

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      where.price = {};
      if (options.minPrice !== undefined) where.price.gte = options.minPrice;
      if (options.maxPrice !== undefined) where.price.lte = options.maxPrice;
    }

    if (options.isFeatured !== undefined) {
      where.isFeatured = options.isFeatured;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (options.sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productIncludes,
        orderBy,
        skip: options.skip,
        take: options.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async adminSearch(options: ProductSearchOptions): Promise<{ products: Product[]; total: number }> {
    const where: Prisma.ProductWhereInput = {};

    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
        { sku: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    if (options.categoryId) {
      where.categoryId = options.categoryId;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      where.price = {};
      if (options.minPrice !== undefined) where.price.gte = options.minPrice;
      if (options.maxPrice !== undefined) where.price.lte = options.maxPrice;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (options.sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productIncludes,
        orderBy,
        skip: options.skip,
        take: options.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({
      data,
      include: productIncludes,
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
      include: productIncludes,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.ProductWhereInput = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await prisma.product.count({ where });
    return count > 0;
  }

  async skuExists(sku: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.ProductWhereInput = { sku };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await prisma.product.count({ where });
    return count > 0;
  }

  // ===== Product Images =====

  async addImage(data: Prisma.ProductImageCreateInput): Promise<ProductImage> {
    return prisma.productImage.create({ data });
  }

  async removeImage(imageId: string): Promise<void> {
    await prisma.productImage.delete({ where: { id: imageId } });
  }

  async setPrimaryImage(productId: string, imageId: string): Promise<void> {
    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      }),
      prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);
  }

  // ===== Product Variants =====

  async addVariant(data: Prisma.ProductVariantCreateInput): Promise<ProductVariant> {
    return prisma.productVariant.create({ data });
  }

  async updateVariant(variantId: string, data: Prisma.ProductVariantUpdateInput): Promise<ProductVariant> {
    return prisma.productVariant.update({
      where: { id: variantId },
      data,
    });
  }

  async removeVariant(variantId: string): Promise<void> {
    await prisma.productVariant.delete({ where: { id: variantId } });
  }

  async variantSkuExists(sku: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.ProductVariantWhereInput = { sku };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await prisma.productVariant.count({ where });
    return count > 0;
  }

  /** Listed products whose stock is at or below their own low-stock threshold. */
  async countLowStock(): Promise<number> {
    return prisma.product.count({
      where: {
        status: { in: ['ACTIVE', 'OUT_OF_STOCK'] },
        stock: { lte: prisma.product.fields.lowStockThreshold },
      },
    });
  }
}

export const productPersistence = new ProductPersistence();
