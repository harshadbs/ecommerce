import { Product } from '@prisma/client';
import { productPersistence } from '../persistence/index.js';
import { NotFoundError } from '../../../utils/errors.js';

export class GetProductBySlugUseCase {
  async execute(slug: string): Promise<Product> {
    const product = await productPersistence.findBySlug(slug);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }
}

export const getProductBySlugUseCase = new GetProductBySlugUseCase();
