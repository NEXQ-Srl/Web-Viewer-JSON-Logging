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
