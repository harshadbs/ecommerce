import { ProductImage } from '@prisma/client';
import { productPersistence } from '../persistence/index.js';
import { NotFoundError } from '../../../utils/errors.js';
import type { AddImageInput } from '../product.validator.js';

export class ManageProductImagesUseCase {
  async addImage(productId: string, data: AddImageInput): Promise<ProductImage> {
    const product = await productPersistence.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // If marking as primary, unset others first
    if (data.isPrimary) {
      await productPersistence.setPrimaryImage(productId, '');
    }

    return productPersistence.addImage({
      product: { connect: { id: productId } },
      url: data.url,
      alt: data.alt,
      isPrimary: data.isPrimary,
      sortOrder: data.sortOrder,
    });
  }

  async removeImage(productId: string, imageId: string): Promise<void> {
    const product = await productPersistence.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    await productPersistence.removeImage(imageId);
  }

  async setPrimary(productId: string, imageId: string): Promise<void> {
    const product = await productPersistence.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    await productPersistence.setPrimaryImage(productId, imageId);
  }
}

export const manageProductImagesUseCase = new ManageProductImagesUseCase();
