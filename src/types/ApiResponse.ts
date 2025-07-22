export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    total: number;
    pages: number;
    current: number;
    limit: number;
  };
  meta?: Record<string, any>;
}
