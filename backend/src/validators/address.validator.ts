import { z } from 'zod';
import { AddressType } from '@prisma/client';

export const createAddressSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
    address: z
      .string()
      .min(10, 'Address must be at least 10 characters')
      .max(500, 'Address must be less than 500 characters'),
    landmark: z.string().max(200, 'Landmark must be less than 200 characters').optional(),
    city: z
      .string()
      .min(2, 'City must be at least 2 characters')
      .max(100, 'City must be less than 100 characters'),
    state: z
      .string()
      .min(2, 'State must be at least 2 characters')
      .max(100, 'State must be less than 100 characters'),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
    type: z.nativeEnum(AddressType).default(AddressType.HOME),
    isDefault: z.boolean().default(false),
  }),
});

export const updateAddressSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters')
      .optional(),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
      .optional(),
    address: z
      .string()
      .min(10, 'Address must be at least 10 characters')
      .max(500, 'Address must be less than 500 characters')
      .optional(),
    landmark: z.string().max(200, 'Landmark must be less than 200 characters').optional().nullable(),
    city: z
      .string()
      .min(2, 'City must be at least 2 characters')
      .max(100, 'City must be less than 100 characters')
      .optional(),
    state: z
      .string()
      .min(2, 'State must be at least 2 characters')
      .max(100, 'State must be less than 100 characters')
      .optional(),
    pincode: z
      .string()
      .regex(/^\d{6}$/, 'Invalid pincode')
      .optional(),
    type: z.nativeEnum(AddressType).optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const addressIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Address ID is required'),
  }),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>['body'];
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>['body'];
