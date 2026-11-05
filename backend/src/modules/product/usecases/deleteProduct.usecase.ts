import { productPersistence } from '../persistence/index.js';
import { NotFoundError } from '../../../utils/errors.js';

export class DeleteProductUseCase {
  async execute(id: string): Promise<void> {
    const product = await productPersistence.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    await productPersistence.delete(id);
  }
}

export const deleteProductUseCase = new DeleteProductUseCase();
