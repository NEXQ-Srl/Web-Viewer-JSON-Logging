export interface LogEntry {
  '@timestamp': string;
  level: string;
  message: string;
  correlationId?: string;
  [key: string]: string | number | boolean | null | undefined | object;
}

export interface ChartDataItem {
  hour?: string;
  date?: string;
  info?: number;
  error?: number;
  warn?: number;
  debug?: number;
  [key: string]: string | number | undefined;
}

export interface LogAuditItem {
  hour: string;
  info: number;
  error: number;
  warn: number;
  debug: number;
  total: number;
}

export interface LogAuditDayItem {
  date: string;
  info: number;
  error: number;
  warn: number;
  debug: number;
  total: number;
}

export interface LogAudit {
  byHour: LogAuditItem[];
  byDay: LogAuditDayItem[];
  totalCounts: {
    info: number;
    error: number;
    warn: number;
    debug: number;
    total: number;
  };
}

export type LogLevel = 'info' | 'error' | 'warn' | 'debug' | 'all';

export interface PaginationState {
  currentPage: number;
  rowsPerPage: number;
  hasMore: boolean;
  isLoading: boolean;
}

export interface FilterState {
  search: string;
  levelFilter: LogLevel;
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  roles: string[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}
