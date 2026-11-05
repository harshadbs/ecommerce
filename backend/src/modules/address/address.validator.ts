import { z } from 'zod';
import { AddressType } from '@prisma/client';

export const createAddressSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'validation.name_min')
      .max(100, 'validation.name_max'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'validation.phone_invalid'),
    address: z
      .string()
      .min(10, 'validation.address_min')
      .max(500, 'Address must be less than 500 characters'),
    landmark: z.string().max(200, 'Landmark must be less than 200 characters').optional(),
    city: z.string().min(2, 'validation.city_required').max(100),
    state: z.string().min(2, 'validation.state_required').max(100),
    pincode: z.string().regex(/^\d{6}$/, 'validation.pincode_invalid'),
    type: z.nativeEnum(AddressType).default(AddressType.HOME),
    isDefault: z.boolean().default(false),
  }),
});

export const updateAddressSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    address: z.string().min(10).max(500).optional(),
    landmark: z.string().max(200).optional().nullable(),
    city: z.string().min(2).max(100).optional(),
    state: z.string().min(2).max(100).optional(),
    pincode: z.string().regex(/^\d{6}$/).optional(),
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
