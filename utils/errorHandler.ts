import { Response } from 'express';

export interface ErrorResponse {
  success: boolean;
  error: string;
  stack?: string;
}

export const handleError = (res: Response, error: any): void => {
  console.error(error);
  
  const statusCode = error.statusCode || 500;
  const response: ErrorResponse = {
    success: false,
    error: error.message || 'Error del servidor'
  };
  
  // Solo incluir el stack en desarrollo
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }
  
  res.status(statusCode).json(response);
}; 