import { Product } from '@prisma/client';
import { productPersistence } from '../persistence/index.js';
import { NotFoundError } from '../../../utils/errors.js';

export class GetProductByIdUseCase {
  async execute(id: string): Promise<Product> {
    const product = await productPersistence.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }
}

export const getProductByIdUseCase = new GetProductByIdUseCase();
