import { ProductImage } from '@prisma/client';
import { productPersistence } from '../persistence/index.js';
import { NotFoundError } from '../../../utils/errors.js';
import type { AddImageInput } from '../product.validator.js';
import { mediaService } from '../../media/index.js';

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

    const url = await mediaService.persist(data.url);
    try {
      return await productPersistence.addImage({
        product: { connect: { id: productId } },
        url,
        alt: data.alt,
        isPrimary: data.isPrimary,
        sortOrder: data.sortOrder,
      });
    } catch (error) {
      if (url !== data.url) await mediaService.deleteByUrls([url]);
      throw error;
    }
  }

  async removeImage(productId: string, imageId: string): Promise<void> {
    const product = await productPersistence.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    const image = await productPersistence.findImage(productId, imageId);
    if (!image) {
      throw new NotFoundError('Image not found');
    }
    await productPersistence.removeImage(imageId);
    await mediaService.deleteByUrls([image.url]);
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
