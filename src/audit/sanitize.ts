const REDACTED_VALUE = "[REDACTED]";
const TRUNCATED_VALUE = "[TRUNCATED]";

const MAX_DEPTH = 6;
const MAX_ARRAY_ITEMS = 100;
const MAX_OBJECT_KEYS = 100;
const MAX_STRING_LENGTH = 4_000;

const SENSITIVE_KEY_PATTERN =
  /password|passcode|secret|token|authorization|cookie|api[-_]?key|private[-_]?key|credit[-_]?card|card[-_]?number|cvv/i;

export type AuditJsonValue = string | number | boolean | null | AuditJsonObject | AuditJsonValue[];

export type AuditJsonObject = {
  [key: string]: AuditJsonValue;
};

function sanitizeString(value: string) {
  if (value.length <= MAX_STRING_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_STRING_LENGTH)}${TRUNCATED_VALUE}`;
}

function sanitizeValue(value: unknown, depth: number): AuditJsonValue {
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

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    const sanitizedItems = value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeValue(item, depth + 1));

    if (value.length > MAX_ARRAY_ITEMS) {
      sanitizedItems.push(TRUNCATED_VALUE);
    }

    return sanitizedItems;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value).slice(0, MAX_OBJECT_KEYS);

    const result: AuditJsonObject = {};

    for (const [key, item] of entries) {
      result[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? REDACTED_VALUE
        : sanitizeValue(item, depth + 1);
    }

    if (Object.keys(value).length > MAX_OBJECT_KEYS) {
      result.__truncated__ = TRUNCATED_VALUE;
    }

    return result;
  }

  return String(value);
}

export function sanitizeAuditMetadata(metadata: Record<string, unknown>): AuditJsonObject {
  return sanitizeValue(metadata, 0) as AuditJsonObject;
}
