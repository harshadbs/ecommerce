import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters')
      .optional(),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
      .optional()
      .nullable(),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
