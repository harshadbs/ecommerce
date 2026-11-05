import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendCreated, sendMessage } from '../../utils/response.js';
import type { AuthenticatedRequest } from '../../types/index.js';
import type { CreateCategoryInput, UpdateCategoryInput } from './category.validator.js';
import { getCategoriesUseCase } from './usecases/getCategories.usecase.js';
import { getCategoryTreeUseCase } from './usecases/getCategoryTree.usecase.js';
import { getCategoryByIdUseCase } from './usecases/getCategoryById.usecase.js';
import { getCategoryBySlugUseCase } from './usecases/getCategoryBySlug.usecase.js';
import { createCategoryUseCase } from './usecases/createCategory.usecase.js';
import { updateCategoryUseCase } from './usecases/updateCategory.usecase.js';
import { deleteCategoryUseCase } from './usecases/deleteCategory.usecase.js';

export class CategoryController {
  /** GET /api/categories - List all categories (public) */
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { parent_id, active } = req.query;
      const categories = await getCategoriesUseCase.execute({
        activeOnly: active !== 'false',
        parentId: parent_id === 'null' ? null : (parent_id as string | undefined),
      });
      sendSuccess(res, { categories });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/categories/tree - Get category tree (public) */
  async getCategoryTree(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tree = await getCategoryTreeUseCase.execute();
      sendSuccess(res, { categories: tree });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/categories/:id - Get category by ID (public) */
  async getCategoryById(
    req: Request & { params: { id: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await getCategoryByIdUseCase.execute(req.params.id);
      sendSuccess(res, { category });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/categories/slug/:slug - Get category by slug (public) */
  async getCategoryBySlug(
    req: Request & { params: { slug: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await getCategoryBySlugUseCase.execute(req.params.slug);
      sendSuccess(res, { category });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/categories - Create category (admin) */
  async createCategory(
    req: AuthenticatedRequest & { body: CreateCategoryInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await createCategoryUseCase.execute(req.body);
      sendCreated(res, { category });
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/categories/:id - Update category (admin) */
  async updateCategory(
    req: AuthenticatedRequest & { params: { id: string }; body: UpdateCategoryInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await updateCategoryUseCase.execute(req.params.id, req.body);
      sendSuccess(res, { category });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/categories/:id - Delete category (admin) */
  async deleteCategory(
    req: AuthenticatedRequest & { params: { id: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await deleteCategoryUseCase.execute(req.params.id);
      sendMessage(res, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
