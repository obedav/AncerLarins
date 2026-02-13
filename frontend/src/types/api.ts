export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}
