export interface LogEntry {
  '@timestamp': string;
  level: string;
  message: string;
  correlationId: string | null;
  module?: string;
  context?: string;
}

export interface LogAuditItem {
  hour: string;
  info: number;
  error: number;
  warn: number;
  debug: number;
  total: number;
}

export interface LogAudit {
  byHour: LogAuditItem[];
  totalCounts: {
    info: number;
    error: number;
    warn: number;
    debug: number;
    total: number;
  };
}
