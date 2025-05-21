import { LogEntry } from '../types/log';
import path from 'path';
import { logger } from './logger';

export function getTodayDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getLogFilePath(): string {
  const folderPath = path.resolve(process.cwd(), "../../", process.env.LOG_FOLDER_PATH || '');
  const dateStr = getTodayDateString();

  let fileName: string;
  if (process.env.LOG_TYPE === "json") {
    fileName = `app-${dateStr}.log`;
  } else if (process.env.LOG_TYPE === "plain") {
    fileName = `logNova.${dateStr}.log`;
  } else {
    throw new Error("❌ Tipo di log non supportato. Usa 'json' o 'plain'.");
  }

  const fullPath = path.join(folderPath, fileName);
  logger.info(`Tipo di log: ${process.env.LOG_TYPE}`);
  logger.info(`Cartella logs: ${folderPath}`);
  logger.info(`File atteso: ${fullPath}`);
  return fullPath;
}

export function parseLogData(data: string): LogEntry[] {
  if (process.env.LOG_TYPE === "json") {
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
  } else if (process.env.LOG_TYPE === "plain") {
    return data
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        logger.debug("Riga grezza:", line);

        // parsing manuale tra parentesi quadre
        const timestampStart = line.indexOf("[") + 1;
        const timestampEnd = line.indexOf("]");
        const timestamp = line.slice(timestampStart, timestampEnd);

        const levelStart = line.indexOf("[", timestampEnd) + 1;
        const levelEnd = line.indexOf("]", levelStart);
        const level = line.slice(levelStart, levelEnd);

        const moduleStart = line.indexOf("[", levelEnd) + 1;
        const moduleEnd = line.indexOf("]", moduleStart);
        const module = line.slice(moduleStart, moduleEnd);

        const contextStart = line.indexOf("[", moduleEnd) + 1;
        const contextEnd = line.indexOf("]", contextStart);
        const context = line.slice(contextStart, contextEnd);

        const message = line.slice(contextEnd + 2).trim();

        if (!timestamp || !level || !module || !context || !message) {
          logger.warn("Riga incompleta:", line);
          return null;
        }

        return {
          '@timestamp': timestamp,
          level: level.toLowerCase(),
          module,
          context,
          message,
          correlationId: null
        } as LogEntry;
      })
      .filter((entry): entry is LogEntry => entry !== null);
  } else {
    logger.error("Tipo di log non supportato:", process.env.LOG_TYPE);
    return [];
  }
}

export const sampleLogs: LogEntry[] = [
  {
    "@timestamp": new Date().toISOString(),
    "level": "info",
    "message": "Application started successfully",
    "correlationId": "abc-123",
    "module": "AppKernel",
    "context": "Startup"
  },
  {
    "@timestamp": new Date(Date.now() - 3600000).toISOString(),
    "level": "error",
    "message": "Failed to connect to database",
    "correlationId": "def-456",
    "module": "DatabaseService",
    "context": "Connection"
  },
  {
    "@timestamp": new Date(Date.now() - 7200000).toISOString(), 
    "level": "warn",
    "message": "High CPU usage detected",
    "correlationId": "ghi-789",
    "module": "MonitoringService",
    "context": "Performance"
  },
  {
    "@timestamp": new Date(Date.now() - 10800000).toISOString(),
    "level": "debug",
    "message": "Processing user request",
    "correlationId": "jkl-012",
    "module": "APIService",
    "context": "UserRequest"
  }
];
