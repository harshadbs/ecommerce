import { Product } from '@prisma/client';
import { productPersistence, ProductSearchOptions } from '../persistence/index.js';
import { parsePagination } from '../../../utils/pagination.js';

export interface SearchProductsInput {
  search?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
  featured?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

export class SearchProductsUseCase {
  async execute(input: SearchProductsInput): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    const { page, limit, skip } = parsePagination({ page: input.page, limit: input.limit });

    const options: ProductSearchOptions = {
      search: input.search,
      categoryId: input.category,
      minPrice: input.min_price ? parseFloat(input.min_price) : undefined,
      maxPrice: input.max_price ? parseFloat(input.max_price) : undefined,
      isFeatured: input.featured === 'true' ? true : input.featured === 'false' ? false : undefined,
      sortBy: input.sort as ProductSearchOptions['sortBy'],
      skip,
      limit,
    };

    const { products, total } = await productPersistence.search(options);
    return { products, total, page, limit };
  }
}

export const searchProductsUseCase = new SearchProductsUseCase();
