// Log-related types
export interface LogEntry {
  '@timestamp': string;
  level: string;
  message: string;
  correlationId?: string;
  [key: string]: string | number | boolean | null | undefined | object;
}

export interface ChartDataItem {
  hour: string;
  info?: number;
  error?: number;
  warn?: number;
  debug?: number;
  [key: string]: string | number | undefined;
}

export type LogLevel = 'info' | 'error' | 'warn' | 'debug' | 'all';

// UI state types
export interface PaginationState {
  currentPage: number;
  rowsPerPage: number;
  hasMore: boolean;
  isLoading: boolean;
}

export interface FilterState {
  search: string;
  levelFilter: LogLevel;
}

// Auth-related types
export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  roles: string[];
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}
