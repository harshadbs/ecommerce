import { productPersistence } from '../persistence/index.js';
import { NotFoundError } from '../../../utils/errors.js';
import { mediaService } from '../../media/index.js';

export class DeleteProductUseCase {
  async execute(id: string): Promise<void> {
    const product = await productPersistence.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    // Image rows cascade with the product; the stored files have to be removed separately
    const imageUrls = await productPersistence.findImageUrls(id);
    await productPersistence.delete(id);
    await mediaService.deleteByUrls(imageUrls);
  }
}

export const deleteProductUseCase = new DeleteProductUseCase();
