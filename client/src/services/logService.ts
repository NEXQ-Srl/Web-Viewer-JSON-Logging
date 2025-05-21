import { getAccessToken } from './authService';
import { LogEntry } from '../types';

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000/api";

interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

const apiRequest = async <T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> => {
  try {
    const token = await getAccessToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorText || response.statusText}`);
    }
    
    return await response.json() as Promise<T>;
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
};

export const fetchAllLogs = async (): Promise<LogEntry[]> => {
  try {
    return await apiRequest<LogEntry[]>('logs');
  } catch (error) {
    console.error("Error loading logs:", error);
    return [];
  }
};


export const fetchPaginatedLogs = async (
  page: number = 1,
  limit: number = 20,
  filters: {
    search?: string;
    levelFilter?: string;
  } = {}
): Promise<{
  logs: LogEntry[];
  total: number;
  totalPages: number;
}> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    if (filters.levelFilter && filters.levelFilter !== 'all') {
      queryParams.append('level', filters.levelFilter);
    }
    
    const endpoint = `logs?${queryParams.toString()}`;
    const response = await apiRequest<{
      data: LogEntry[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      }
    }>(endpoint);
    
    return {
      logs: response.data || [],
      total: response.pagination?.total || 0,
      totalPages: response.pagination?.totalPages || 0
    };
  } catch (error) {
    console.error("Error loading paginated logs:", error);
    return { logs: [], total: 0, totalPages: 0 };
  }
};

export const formatTimestamp = (isoString: string | undefined): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    return date.toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "Format error";
  }
};
