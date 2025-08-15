export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalBlocks: number;
  ongoingBlocks: number;
  resolvedBlocks: number;
  totalTimeBlocked: number; // in milliseconds
  averageBlockTime: number; // in milliseconds
  longestBlock: {
    id: string;
    title: string;
    duration: number;
  } | null;
}

export interface MonthlyStats {
  year: number;
  month: number;
  totalBlocks: number;
  totalDuration: number;
  averageDuration: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  totalBlocks: number;
  blockTitles: string[];
  totalDuration: number;
}

export interface TagStats {
  tagId: string;
  tagName: string;
  tagColor: string;
  totalBlocks: number;
  totalDuration: number;
  averageDuration: number;
}
