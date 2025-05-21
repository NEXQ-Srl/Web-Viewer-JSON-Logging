export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface LogFilterQuery extends PaginationQuery {
  level?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  correlationId?: string;
  module?: string;
  context?: string;
}
