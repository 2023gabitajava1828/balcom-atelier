// Common types shared across all services

export type MembershipTier = 'silver' | 'gold' | 'platinum' | 'black';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  hasMore?: boolean;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export const TIER_HIERARCHY: Record<MembershipTier, number> = {
  silver: 1,
  gold: 2,
  platinum: 3,
  black: 4,
};

export const TIER_LABELS: Record<MembershipTier, string> = {
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  black: 'Black',
};

// Helper to create success response
export function successResponse<T>(data: T): ApiResponse<T> {
  return { data, error: null, success: true };
}

// Helper to create error response
export function errorResponse<T>(error: string): ApiResponse<T> {
  return { data: null, error, success: false };
}
