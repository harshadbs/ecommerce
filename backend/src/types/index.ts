import { Request } from 'express';
import { User, UserRole } from '@prisma/client';

// Authenticated user payload in JWT
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Extended Express Request with user
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: SafeUser;
  tokens: TokenPair;
}

export interface RegisterResponse {
  user: SafeUser;
  tokens: TokenPair;
}

// Safe user (without password)
export type SafeUser = Omit<User, 'passwordHash'>;

// Pagination params
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}
