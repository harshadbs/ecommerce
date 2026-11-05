import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, 'Category is required'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(200),
    slug: z
      .string()
      .min(2)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only')
      .optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    shortDesc: z.string().max(300).optional(),
    price: z.number().positive('Price must be positive'),
    mrp: z.number().positive('MRP must be positive'),
    sku: z.string().max(50).optional(),
    stock: z.number().int().min(0).default(0),
    lowStockThreshold: z.number().int().min(0).default(10),
    status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
    isFeatured: z.boolean().default(false),
    metaTitle: z.string().max(100).optional(),
    metaDesc: z.string().max(200).optional(),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          alt: z.string().max(200).optional(),
          isPrimary: z.boolean().default(false),
          sortOrder: z.number().int().min(0).default(0),
        })
      )
      .optional(),
    variants: z
      .array(
        z.object({
          sku: z.string().min(1).max(50),
          name: z.string().min(1).max(100),
          size: z.string().max(50).optional(),
          color: z.string().max(50).optional(),
          price: z.number().positive(),
          stock: z.number().int().min(0).default(0),
        })
      )
      .optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    categoryId: z.string().optional(),
    name: z.string().min(2).max(200).optional(),
    slug: z
      .string()
      .min(2)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    description: z.string().min(10).max(5000).optional(),
    shortDesc: z.string().max(300).optional().nullable(),
    price: z.number().positive().optional(),
    mrp: z.number().positive().optional(),
    sku: z.string().max(50).optional().nullable(),
    stock: z.number().int().min(0).optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    isFeatured: z.boolean().optional(),
    metaTitle: z.string().max(100).optional().nullable(),
    metaDesc: z.string().max(200).optional().nullable(),
  }),
});

export const productIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

export const productSlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Product slug is required'),
  }),
});

export const productSearchSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    min_price: z.string().optional(),
    max_price: z.string().optional(),
    featured: z.enum(['true', 'false']).optional(),
    sort: z.enum(['price_asc', 'price_desc', 'newest', 'name_asc', 'name_desc']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const addImageSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    url: z.string().url('Invalid image URL'),
    alt: z.string().max(200).optional(),
    isPrimary: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
  }),
});

export const addVariantSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    sku: z.string().min(1).max(50),
    name: z.string().min(1).max(100),
    size: z.string().max(50).optional(),
    color: z.string().max(50).optional(),
    price: z.number().positive(),
    stock: z.number().int().min(0).default(0),
  }),
});

export const updateVariantSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    variantId: z.string().min(1),
  }),
  body: z.object({
    sku: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(100).optional(),
    size: z.string().max(50).optional().nullable(),
    color: z.string().max(50).optional().nullable(),
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type AddImageInput = z.infer<typeof addImageSchema>['body'];
export type AddVariantInput = z.infer<typeof addVariantSchema>['body'];
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>['body'];
