import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'validation.name_min')
      .max(100, 'validation.name_max'),
    email: z.string().email('validation.email_invalid'),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'validation.phone_invalid')
      .optional(),
    password: z
      .string()
      .min(8, 'validation.password_min')
      .regex(/[A-Z]/, 'validation.password_uppercase')
      .regex(/[a-z]/, 'validation.password_lowercase')
      .regex(/[0-9]/, 'validation.password_number')
      .regex(/[^A-Za-z0-9]/, 'validation.password_special'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('validation.email_invalid'),
    password: z.string().min(1, 'validation.password_required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'validation.password_required'),
    newPassword: z
      .string()
      .min(8, 'validation.password_min')
      .regex(/[A-Z]/, 'validation.password_uppercase')
      .regex(/[a-z]/, 'validation.password_lowercase')
      .regex(/[0-9]/, 'validation.password_number')
      .regex(/[^A-Za-z0-9]/, 'validation.password_special'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
