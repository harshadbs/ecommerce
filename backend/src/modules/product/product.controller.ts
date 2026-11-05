import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendCreated, sendMessage, sendPaginated } from '../../utils/response.js';
import type { AuthenticatedRequest } from '../../types/index.js';
import type { CreateProductInput, UpdateProductInput, AddImageInput, AddVariantInput, UpdateVariantInput } from './product.validator.js';
import { searchProductsUseCase } from './usecases/searchProducts.usecase.js';
import { getProductByIdUseCase } from './usecases/getProductById.usecase.js';
import { getProductBySlugUseCase } from './usecases/getProductBySlug.usecase.js';
import { createProductUseCase } from './usecases/createProduct.usecase.js';
import { updateProductUseCase } from './usecases/updateProduct.usecase.js';
import { deleteProductUseCase } from './usecases/deleteProduct.usecase.js';
import { manageProductImagesUseCase } from './usecases/manageProductImages.usecase.js';
import { manageProductVariantsUseCase } from './usecases/manageProductVariants.usecase.js';
import { productPersistence } from './persistence/index.js';
import { parsePagination } from '../../utils/pagination.js';
import type { ProductSearchOptions } from './persistence/product.persistence.js';

export class ProductController {
  /** GET /api/products - Search/list products (public) */
  async searchProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { products, total, page, limit } = await searchProductsUseCase.execute(
        req.query as Record<string, string>
      );
      sendPaginated(res, products, { page, limit, total });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/products/:id - Get product by ID (public) */
  async getProductById(
    req: Request & { params: { id: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await getProductByIdUseCase.execute(req.params.id);
      sendSuccess(res, { product });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/products/slug/:slug - Get product by slug (public) */
  async getProductBySlug(
    req: Request & { params: { slug: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await getProductBySlugUseCase.execute(req.params.slug);
      sendSuccess(res, { product });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/admin/products - Admin product listing (all statuses) */
  async adminListProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });
      const query = req.query as Record<string, string>;

      const options: ProductSearchOptions = {
        search: query.search,
        categoryId: query.category,
        status: query.status as ProductSearchOptions['status'],
        minPrice: query.min_price ? parseFloat(query.min_price) : undefined,
        maxPrice: query.max_price ? parseFloat(query.max_price) : undefined,
        sortBy: query.sort as ProductSearchOptions['sortBy'],
        skip,
        limit,
      };

      const { products, total } = await productPersistence.adminSearch(options);
      sendPaginated(res, products, { page, limit, total });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/products - Create product (admin) */
  async createProduct(
    req: AuthenticatedRequest & { body: CreateProductInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await createProductUseCase.execute(req.body);
      sendCreated(res, { product });
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/products/:id - Update product (admin) */
  async updateProduct(
    req: AuthenticatedRequest & { params: { id: string }; body: UpdateProductInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await updateProductUseCase.execute(req.params.id, req.body);
      sendSuccess(res, { product });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/products/:id - Delete product (admin) */
  async deleteProduct(
    req: AuthenticatedRequest & { params: { id: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await deleteProductUseCase.execute(req.params.id);
      sendMessage(res, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/products/:id/images - Add image (admin) */
  async addImage(
    req: AuthenticatedRequest & { params: { id: string }; body: AddImageInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const image = await manageProductImagesUseCase.addImage(req.params.id, req.body);
      sendCreated(res, { image });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/products/:id/images/:imageId - Remove image (admin) */
  async removeImage(
    req: AuthenticatedRequest & { params: { id: string; imageId: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await manageProductImagesUseCase.removeImage(req.params.id, req.params.imageId);
      sendMessage(res, 'Image removed successfully');
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/products/:id/images/:imageId/primary - Set primary image (admin) */
  async setPrimaryImage(
    req: AuthenticatedRequest & { params: { id: string; imageId: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await manageProductImagesUseCase.setPrimary(req.params.id, req.params.imageId);
      sendMessage(res, 'Primary image updated');
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/products/:id/variants - Add variant (admin) */
  async addVariant(
    req: AuthenticatedRequest & { params: { id: string }; body: AddVariantInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const variant = await manageProductVariantsUseCase.addVariant(req.params.id, req.body);
      sendCreated(res, { variant });
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/products/:id/variants/:variantId - Update variant (admin) */
  async updateVariant(
    req: AuthenticatedRequest & { params: { id: string; variantId: string }; body: UpdateVariantInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const variant = await manageProductVariantsUseCase.updateVariant(
        req.params.id,
        req.params.variantId,
        req.body
      );
      sendSuccess(res, { variant });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/products/:id/variants/:variantId - Remove variant (admin) */
  async removeVariant(
    req: AuthenticatedRequest & { params: { id: string; variantId: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await manageProductVariantsUseCase.removeVariant(req.params.id, req.params.variantId);
      sendMessage(res, 'Variant removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
