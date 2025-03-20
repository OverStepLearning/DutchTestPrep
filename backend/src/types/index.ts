import { Request } from 'express';

// Authenticated request with userId
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

// API response format
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
} 