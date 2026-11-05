import { Response } from 'express';
import type { ApiResponse, PaginatedResponse } from '../types/index.js';

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

export function sendMessage(res: Response, message: string, statusCode: number = 200): void {
  const response: ApiResponse = {
    success: true,
    message,
  };
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number }
): void {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  };
  res.status(200).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: Record<string, string[]>
): void {
  const response: ApiResponse & { errors?: Record<string, string[]> } = {
    success: false,
    error: message,
  };

  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
}
