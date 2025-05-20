export interface LogEntry {
  '@timestamp': string;
  level: string;
  message: string;
  correlationId: string | null;
  module?: string;
  context?: string;
}
