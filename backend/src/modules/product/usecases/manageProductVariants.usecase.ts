import { ProductVariant } from '@prisma/client';
import { productPersistence } from '../persistence/index.js';
import { NotFoundError, ConflictError } from '../../../utils/errors.js';
import type { AddVariantInput, UpdateVariantInput } from '../product.validator.js';

export class ManageProductVariantsUseCase {
  async addVariant(productId: string, data: AddVariantInput): Promise<ProductVariant> {
    const product = await productPersistence.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check SKU uniqueness
    const skuExists = await productPersistence.variantSkuExists(data.sku);
    if (skuExists) {
      throw new ConflictError(`Variant SKU "${data.sku}" already exists`);
    }

    return productPersistence.addVariant({
      product: { connect: { id: productId } },
      sku: data.sku,
      name: data.name,
      size: data.size,
      color: data.color,
      price: data.price,
      stock: data.stock,
    });
  }

  async updateVariant(productId: string, variantId: string, data: UpdateVariantInput): Promise<ProductVariant> {
    const product = await productPersistence.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check SKU uniqueness if changing
    if (data.sku) {
      const skuExists = await productPersistence.variantSkuExists(data.sku, variantId);
      if (skuExists) {
        throw new ConflictError(`Variant SKU "${data.sku}" already exists`);
      }
    }

    return productPersistence.updateVariant(variantId, {
      sku: data.sku,
      name: data.name,
      size: data.size,
      color: data.color,
      price: data.price,
      stock: data.stock,
      isActive: data.isActive,
    });
  }

  async removeVariant(productId: string, variantId: string): Promise<void> {
    const product = await productPersistence.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    await productPersistence.removeVariant(variantId);
  }
}

export const manageProductVariantsUseCase = new ManageProductVariantsUseCase();
