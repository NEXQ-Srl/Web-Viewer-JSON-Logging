import { LogEntry } from '../types/log';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { LogFilterQuery } from '../types/request';
import { logger } from '../utils/logger';

export function getTodayDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getLogDirectoryPath(): string {
  const projectRoot = path.resolve(__dirname, '../../../');

  return process.env.LOG_FOLDER_PATH && path.isAbsolute(process.env.LOG_FOLDER_PATH)
    ? process.env.LOG_FOLDER_PATH
    : path.resolve(projectRoot, process.env.LOG_FOLDER_PATH || 'logs');
}


export function ensureDirectoryExists(directoryPath: string): boolean {
  if (!fs.existsSync(directoryPath)) {
    try {
      fs.mkdirSync(directoryPath, { recursive: true });
      logger.info(`Log directory created: ${directoryPath}`);
      return true;
    } catch (err) {
      logger.error(`Failed to create log directory: ${err}`);
      return false;
    }
  }
  return true;
}


export function getLogFileName(dateStr: string): string {
  switch (process.env.LOG_TYPE) {
    case "json":
      return `app-${dateStr}.log`;
    case "plain":
      return `logNova.${dateStr}.log`;
    default:
      throw new Error("❌ Tipo di log non supportato. Usa 'json' o 'plain'.");
  }
}


export function getLogFilePath(dateStr?: string, createIfMissing = true): string {
  const date = dateStr || getTodayDateString();
  const logFolderPath = getLogDirectoryPath();

  if (!ensureDirectoryExists(logFolderPath)) {
    logger.error(`Failed to ensure log directory exists: ${logFolderPath}`);
  }

  const fileName = getLogFileName(date);
  const fullPath = path.join(logFolderPath, fileName);

  if (!fs.existsSync(fullPath)) {
    logger.warn(`Log file does not exist: ${fullPath}.`);

    if (createIfMissing) {
      try {
        fs.writeFileSync(fullPath, '', { flag: 'wx' });
        logger.info(`Created empty log file: ${fullPath}`);
      } catch (err) {
        logger.error(`Failed to create log file: ${err}`);
      }
    } else {
      logger.warn('File will be created when logs are written. To create it now, pass createIfMissing=true');
    }
  } else {
    logger.info(`Log file found: ${fullPath}`);
  }

  return fullPath;
}


export function ensureLogFileExists(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, '', { flag: 'wx' });
      logger.info(`Log file created: ${filePath}`);
      return true;
    } catch (err) {
      logger.error(`Failed to create log file: ${err}`);
      return false;
    }
  }
  return true;
}

export function parseJsonLogs(data: string): LogEntry[] {
  return data
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as LogEntry;
      } catch (e) {
        logger.warn("JSON non valido:", line);
        return null;
      }
    })
    .filter((entry): entry is LogEntry => entry !== null);
}

export function extractBracketField(line: string, startAfterIndex = 0): { value: string, endIndex: number } | null {
  const startIndex = line.indexOf('[', startAfterIndex);
  if (startIndex === -1) return null;

  const endIndex = line.indexOf(']', startIndex);
  if (endIndex === -1) return null;

  return {
    value: line.slice(startIndex + 1, endIndex),
    endIndex
  };
}

export function parsePlainTextLogs(data: string): LogEntry[] {
  return data
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      logger.debug("Riga grezza:", line);

      const timestampField = extractBracketField(line, 0);
      if (!timestampField) return null;

      const levelField = extractBracketField(line, timestampField.endIndex);
      if (!levelField) return null;

      const moduleField = extractBracketField(line, levelField.endIndex);
      if (!moduleField) return null;

      const contextField = extractBracketField(line, moduleField.endIndex);
      if (!contextField) return null;

      const message = line.slice(contextField.endIndex + 1).trim();
      if (!message) return null;

      return {
        '@timestamp': timestampField.value,
        level: levelField.value.toLowerCase(),
        module: moduleField.value,
        context: contextField.value,
        message,
        correlationId: null
      } as LogEntry;
    })
    .filter((entry): entry is LogEntry => entry !== null);
}


export function parseLogData(data: string): LogEntry[] {
  switch (process.env.LOG_TYPE) {
    case "json":
      return parseJsonLogs(data);
    case "plain":
      return parsePlainTextLogs(data);
    default:
      logger.error("Tipo di log non supportato:", process.env.LOG_TYPE);
      return [];
  }
}


function getLocalDatesForFileIteration(queryStartDate?: string, queryEndDate?: string): string[] {
  const dates: string[] = [];
  
  if (!queryStartDate && !queryEndDate) {
    return [getTodayDateString()]; 
  }

  const sDateISO = queryStartDate || queryEndDate!;
  const eDateISO = queryEndDate || queryStartDate!;

  const sDate = new Date(sDateISO);
  const eDate = new Date(eDateISO);

  if (sDate > eDate) {
    logger.warn(`Start date (${sDateISO}) is after end date (${eDateISO}) for file iteration. No files will be read.`);
    return [];
  }

  let current = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
  const endLoop = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate());

  let safetyCount = 0;
  while (current <= endLoop && safetyCount < 365) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
    current.setDate(current.getDate() + 1);
    safetyCount++;
  }
  if (safetyCount >= 365) {
    logger.warn("Date range for log files is too large, limited to 365 files.");
  }
  return dates;
}


export async function getFilteredLogs(query: LogFilterQuery): Promise<{
  logs: LogEntry[];
  total: number;
  audit: {
    byHour: { hour: string; info: number; error: number; warn: number; debug: number; total: number }[];
    byDay: { date: string; info: number; error: number; warn: number; debug: number; total: number }[];
    totalCounts: { info: number; error: number; warn: number; debug: number; total: number };
  };
}> {
  let allLogsFromFileSystem: LogEntry[] = [];

  const logDateStrings = getLocalDatesForFileIteration(query.startDate, query.endDate);

  if (logDateStrings.length === 0) {
    logger.info("No log files to read based on the provided date range.");
    if (query.startDate || query.endDate) {
        return { 
          logs: [], 
          total: 0,
          audit: {
            byHour: [],
            byDay: [],
            totalCounts: { info: 0, error: 0, warn: 0, debug: 0, total: 0 }
          }
        };
    }
  }
  
  logger.info(`Attempting to read log files for dates: ${logDateStrings.join(', ')}`);

  for (const dateString of logDateStrings) {
    const logFilePath = getLogFilePath(dateString, false); 
    try {
      await fsPromises.access(logFilePath); 
      const logContent = await fsPromises.readFile(logFilePath, 'utf-8');
      const logsFromFile = parseLogData(logContent);
      allLogsFromFileSystem.push(...logsFromFile);
      logger.debug(`Successfully read and parsed ${logsFromFile.length} logs from ${logFilePath}`);
    } catch (error) {
      logger.info(`Log file for date ${dateString} not found or not accessible: ${logFilePath}. Skipping.`);
    }
  }
    if (allLogsFromFileSystem.length === 0) {
    logger.info("No logs found in the specified file(s) after reading.");
    return { 
      logs: [], 
      total: 0,
      audit: {
        byHour: [],
        byDay: [],
        totalCounts: { info: 0, error: 0, warn: 0, debug: 0, total: 0 }
      }
    };
  }

  const filteredLogs = filterLogs(allLogsFromFileSystem, query);
  const paginatedLogs = paginateLogs(filteredLogs, query);
  
  const auditData = generateLogAudit(filteredLogs);

  logger.info(`Returning ${paginatedLogs.length} paginated logs out of ${filteredLogs.length} filtered logs (from ${allLogsFromFileSystem.length} total logs read).`);
  return {
    logs: paginatedLogs,
    total: filteredLogs.length,
    audit: auditData
  };
}

function filterLogs(logs: LogEntry[], filters: LogFilterQuery): LogEntry[] {
  const filterStartDate = filters.startDate ? new Date(filters.startDate) : null;
  let filterEndDate = filters.endDate ? new Date(filters.endDate) : null;

  if (filterEndDate) {
    filterEndDate.setUTCHours(23, 59, 59, 999);
  }
  
  logger.debug(`Filtering with startDate: ${filterStartDate?.toISOString()}, endDate: ${filterEndDate?.toISOString()}`);

  return logs.filter(log => {
    if (filters.level && log.level !== filters.level) {
      return false;
    }

    if (filters.correlationId &&
      (!log.correlationId || !log.correlationId.includes(filters.correlationId))) {
      return false;
    }

    if (filters.module &&
      (!log.module || !log.module.includes(filters.module))) {
      return false;
    }

    if (filters.context &&
      (!log.context || !log.context.includes(filters.context))) {
      return false;
    }

    let logTimestamp: Date;
    try {
      logTimestamp = new Date(log['@timestamp']);
      if (isNaN(logTimestamp.getTime())) {
        logger.warn(`Invalid timestamp found in log: ${log['@timestamp']}`);
        return false; 
      }
    } catch (e) {
      logger.warn(`Error parsing timestamp: ${log['@timestamp']}`, e);
      return false;
    }

    if (filterStartDate && logTimestamp < filterStartDate) {
      return false;
    }

    if (filterEndDate && logTimestamp > filterEndDate) {
      return false;
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const messageMatch = log.message && log.message.toLowerCase().includes(searchTerm);
      const correlationIdMatch = log.correlationId && log.correlationId.toLowerCase().includes(searchTerm);
      if (!messageMatch && !correlationIdMatch) {
        return false;
      }
    }

    return true;
  });
}

function paginateLogs(logs: LogEntry[], pagination: { page?: number; limit?: number }): LogEntry[] {
  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  logs.sort((a, b) =>
    new Date(b['@timestamp']).getTime() - new Date(a['@timestamp']).getTime()
  );

  return logs.slice(startIndex, endIndex);
}

function generateLogAudit(logs: LogEntry[]): {
  byHour: { hour: string; info: number; error: number; warn: number; debug: number; total: number }[];
  byDay: { date: string; info: number; error: number; warn: number; debug: number; total: number }[];
  totalCounts: { info: number; error: number; warn: number; debug: number; total: number };
} {
  const hourlyData: Record<string, { info: number; error: number; warn: number; debug: number; total: number }> = {};
  const dailyData: Record<string, { info: number; error: number; warn: number; debug: number; total: number }> = {};
  const totalCounts = { info: 0, error: 0, warn: 0, debug: 0, total: 0 };
  
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    hourlyData[hour] = { info: 0, error: 0, warn: 0, debug: 0, total: 0 };
  }
  
  logs.forEach(log => {
    try {
      const date = new Date(log['@timestamp']);
      if (isNaN(date.getTime())) return;
      
      const hour = date.getHours().toString().padStart(2, '0');
      const level = log.level?.toLowerCase() || 'unknown';
      
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { info: 0, error: 0, warn: 0, debug: 0, total: 0 };
      }
      
      if (['info', 'error', 'warn', 'debug'].includes(level)) {
        hourlyData[hour][level as 'info' | 'error' | 'warn' | 'debug'] += 1;
        hourlyData[hour].total += 1;
        
        dailyData[dateStr][level as 'info' | 'error' | 'warn' | 'debug'] += 1;
        dailyData[dateStr].total += 1;
        
        totalCounts[level as 'info' | 'error' | 'warn' | 'debug'] += 1;
        totalCounts.total += 1;
      }
    } catch (error) {
      logger.warn(`Error processing log for audit data: ${error}`);
    }
  });
  
  const byHour = Object.entries(hourlyData)
    .map(([hour, counts]) => ({ hour, ...counts }))
    .sort((a, b) => a.hour.localeCompare(b.hour));
    
  const byDay = Object.entries(dailyData)
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return { byHour, byDay, totalCounts };
}

export const LogService = {
  getTodayDateString,
  getLogDirectoryPath,
  ensureDirectoryExists,
  ensureLogFileExists,
  getLogFileName,
  getLogFilePath,
  parseJsonLogs,
  parsePlainTextLogs,
  parseLogData
};
