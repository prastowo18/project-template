export const LOG_LEVELS = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
} as const;

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

export type LogValue =
  | string
  | number
  | boolean
  | null
  | LogValue[]
  | {
      [key: string]: LogValue;
    };

export type LogFields = Record<string, unknown>;

export type StructuredLogRecord = {
  timestamp: string;
  level: LogLevel;
  event: string;
  service: string;
  environment: string;
  [key: string]: LogValue;
};

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const SENSITIVE_KEY_PATTERN =
  /password|passcode|secret|token|authorization|cookie|api[-_]?key|private[-_]?key|credit[-_]?card|card[-_]?number|cvv/i;

const MAX_DEPTH = 6;
const MAX_ARRAY_ITEMS = 100;
const MAX_OBJECT_KEYS = 100;
const MAX_STRING_LENGTH = 4_000;

const REDACTED_VALUE = "[REDACTED]";
const CIRCULAR_VALUE = "[CIRCULAR]";
const TRUNCATED_VALUE = "[TRUNCATED]";

function sanitizeString(value: string) {
  if (value.length <= MAX_STRING_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_STRING_LENGTH)}${TRUNCATED_VALUE}`;
}

function sanitizeValue(value: unknown, depth: number, seen: WeakSet<object>): LogValue {
  if (depth > MAX_DEPTH) {
    return TRUNCATED_VALUE;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : String(value);
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "undefined") {
    return "undefined";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return CIRCULAR_VALUE;
    }

    seen.add(value);

    const result = value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeValue(item, depth + 1, seen));

    if (value.length > MAX_ARRAY_ITEMS) {
      result.push(TRUNCATED_VALUE);
    }

    return result;
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return CIRCULAR_VALUE;
    }

    seen.add(value);

    const result: Record<string, LogValue> = {};

    const entries = Object.entries(value).slice(0, MAX_OBJECT_KEYS);

    for (const [key, item] of entries) {
      result[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? REDACTED_VALUE
        : sanitizeValue(item, depth + 1, seen);
    }

    if (Object.keys(value).length > MAX_OBJECT_KEYS) {
      result.__truncated__ = TRUNCATED_VALUE;
    }

    return result;
  }

  return sanitizeString(String(value));
}

export function sanitizeLogFields(fields: LogFields): Record<string, LogValue> {
  const seen = new WeakSet<object>();

  return sanitizeValue(fields, 0, seen) as Record<string, LogValue>;
}

export function serializeError(error: unknown): Record<string, LogValue> {
  if (error instanceof Error) {
    return sanitizeLogFields({
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
  }

  return sanitizeLogFields({
    value: error,
  });
}

function getConfiguredLogLevel(): LogLevel {
  const configured = process.env.LOG_LEVEL?.toLowerCase();

  if (
    configured === LOG_LEVELS.DEBUG ||
    configured === LOG_LEVELS.INFO ||
    configured === LOG_LEVELS.WARN ||
    configured === LOG_LEVELS.ERROR
  ) {
    return configured;
  }

  return process.env.NODE_ENV === "development" ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
}

function shouldWriteLog(level: LogLevel) {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[getConfiguredLogLevel()];
}

export function createLogRecord(
  level: LogLevel,
  event: string,
  fields: LogFields = {},
): StructuredLogRecord {
  const sanitizedFields = sanitizeLogFields(fields);

  return {
    ...sanitizedFields,
    timestamp: new Date().toISOString(),
    level,
    event,
    service: "nextjs-standard-template",
    environment: process.env.NODE_ENV ?? "unknown",
  };
}

function writeLog(level: LogLevel, event: string, fields?: LogFields) {
  if (!shouldWriteLog(level)) {
    return;
  }

  const output = JSON.stringify(createLogRecord(level, event, fields));

  switch (level) {
    case LOG_LEVELS.DEBUG:
      console.debug(output);
      break;

    case LOG_LEVELS.INFO:
      console.info(output);
      break;

    case LOG_LEVELS.WARN:
      console.warn(output);
      break;

    case LOG_LEVELS.ERROR:
      console.error(output);
      break;
  }
}

export const logger = {
  debug(event: string, fields?: LogFields) {
    writeLog(LOG_LEVELS.DEBUG, event, fields);
  },

  info(event: string, fields?: LogFields) {
    writeLog(LOG_LEVELS.INFO, event, fields);
  },

  warn(event: string, fields?: LogFields) {
    writeLog(LOG_LEVELS.WARN, event, fields);
  },

  error(event: string, fields?: LogFields) {
    writeLog(LOG_LEVELS.ERROR, event, fields);
  },
};
