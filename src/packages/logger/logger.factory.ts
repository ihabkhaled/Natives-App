import { formatLogMessage, sanitizeLogFields } from './logger.helper';
import type { AppLogger, LogFields, LogLevel } from './logger.types';
import { LOG_LEVEL } from './logger.types';

export interface LoggerSink {
  readonly write: (level: LogLevel, message: string, fields: LogFields | undefined) => void;
}

/**
 * The console owner: raw console access is forbidden outside this file
 * (ESLint core no-console + architecture ownership).
 */
export function createConsoleSink(): LoggerSink {
  return {
    write: (level, message, fields) => {
      /* eslint-disable no-console -- EXC-0001: the logger package is the single console owner. */
      const writer =
        level === LOG_LEVEL.Error
          ? console.error
          : level === LOG_LEVEL.Warn
            ? console.warn
            : console.info;
      /* eslint-enable no-console */
      if (fields === undefined) {
        writer(message);
        return;
      }
      writer(message, fields);
    },
  };
}

export function createLogger(scope: string, sink: LoggerSink): AppLogger {
  const emit = (level: LogLevel, message: string, fields?: LogFields): void => {
    sink.write(
      level,
      formatLogMessage(scope, message),
      fields === undefined ? undefined : sanitizeLogFields(fields),
    );
  };
  return {
    debug: (message, fields) => {
      emit(LOG_LEVEL.Debug, message, fields);
    },
    info: (message, fields) => {
      emit(LOG_LEVEL.Info, message, fields);
    },
    warn: (message, fields) => {
      emit(LOG_LEVEL.Warn, message, fields);
    },
    error: (message, fields) => {
      emit(LOG_LEVEL.Error, message, fields);
    },
  };
}
