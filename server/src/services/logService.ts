import { LogEntry } from '../types/log';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

/**
 * Gets the current date string in YYYY-MM-DD format
 * @returns Date string for log file naming
 */
export function getTodayDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Get the absolute log directory path based on configuration
 * @returns Absolute path to the log directory
 */
export function getLogDirectoryPath(): string {
  const projectRoot = path.resolve(__dirname, '../../../');
  
  return process.env.LOG_FOLDER_PATH && path.isAbsolute(process.env.LOG_FOLDER_PATH)
    ? process.env.LOG_FOLDER_PATH 
    : path.resolve(projectRoot, process.env.LOG_FOLDER_PATH || 'logs');
}

/**
 * Ensures the log directory exists, creates it if it doesn't
 * @param directoryPath Path to the log directory
 * @returns Boolean indicating success
 */
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

/**
 * Get the filename for the log based on the date and configured type
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns Filename for the log
 * @throws Error if the log type isn't supported
 */
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

/**
 * Get the full path to the log file for the current or specified date
 * @param dateStr Optional date string, defaults to today
 * @param createIfMissing Whether to create the file if it doesn't exist, defaults to false
 * @returns Full path to the log file
 */
export function getLogFilePath(dateStr?: string, createIfMissing = true): string {
  const date = dateStr || getTodayDateString();
  const logFolderPath = getLogDirectoryPath();
  
  if (!ensureDirectoryExists(logFolderPath)) {
    logger.error(`Failed to ensure log directory exists: ${logFolderPath}`);
  }
  
  const fileName = getLogFileName(date);
  const fullPath = path.join(logFolderPath, fileName);
  
  logger.info(`Tipo di log: ${process.env.LOG_TYPE}`);
  logger.info(`Cartella logs: ${logFolderPath}`);
  logger.info(`File atteso: ${fullPath}`);
  
  if (!fs.existsSync(fullPath)) {
    logger.warn(`Log file does not exist: ${fullPath}.`);
    
    if (createIfMissing) {
      try {
        // Create an empty file
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

/**
 * Ensures the log file exists, creates it if it doesn't
 * @param filePath Path to the log file
 * @returns Boolean indicating whether the file exists or was created
 */
export function ensureLogFileExists(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    try {
      // Create the parent directory if it doesn't exist
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Create an empty file
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

/**
 * Parse JSON log data
 * @param data Raw log data
 * @returns Array of parsed log entries
 */
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

/**
 * Extract field from a log line based on bracket positions
 * @param line Log line to parse
 * @param startAfterIndex Start searching after this index
 * @returns {string | null} Extracted field or null if not found
 */
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

/**
 * Parse plain text log data with improved field extraction
 * @param data Raw log data
 * @returns Array of parsed log entries
 */
export function parsePlainTextLogs(data: string): LogEntry[] {
  return data
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      logger.debug("Riga grezza:", line);

      // Extract fields between brackets more safely
      const timestampField = extractBracketField(line, 0);
      if (!timestampField) return null;
      
      const levelField = extractBracketField(line, timestampField.endIndex);
      if (!levelField) return null;
      
      const moduleField = extractBracketField(line, levelField.endIndex);
      if (!moduleField) return null;
      
      const contextField = extractBracketField(line, moduleField.endIndex);
      if (!contextField) return null;
      
      // Message is what remains after the last bracket
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

/**
 * Parse log data based on the configured format
 * @param data Raw log data
 * @returns Array of parsed log entries
 */
export function parseLogData(data: string): LogEntry[] {
  switch(process.env.LOG_TYPE) {
    case "json":
      return parseJsonLogs(data);
    case "plain":
      return parsePlainTextLogs(data);
    default:
      logger.error("Tipo di log non supportato:", process.env.LOG_TYPE);
      return [];
  }
}

// Export a namespace for backward compatibility with class usage
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
