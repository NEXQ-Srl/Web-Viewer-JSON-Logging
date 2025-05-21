import { LogEntry } from '../types/log';
import path from 'path';
import fs from 'fs';
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
  
  logger.info(`Tipo di log: ${process.env.LOG_TYPE}`);
  logger.info(`Cartella logs: ${logFolderPath}`);
  logger.info(`File atteso: ${fullPath}`);
  
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
