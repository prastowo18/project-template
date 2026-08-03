export const AUDIT_LOG_PAGE_SIZE = 25;

export const AUDIT_LOG_CATEGORIES = [
  "auth",
  "access",
  "user",
  "role",
  "permission",
  "system",
] as const;

export const AUDIT_LOG_OUTCOMES = ["success", "failure", "denied"] as const;

export type AuditLogQuery = {
  page: number;
  action: string;
  category: string;
  outcome: string;
  search: string;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeText(value: string | undefined) {
  return value?.trim() ?? "";
}

function normalizePage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export function normalizeAuditLogQuery(searchParams: RawSearchParams): AuditLogQuery {
  return {
    page: normalizePage(getFirstValue(searchParams.page)),
    action: normalizeText(getFirstValue(searchParams.action)),
    category: normalizeText(getFirstValue(searchParams.category)),
    outcome: normalizeText(getFirstValue(searchParams.outcome)),
    search: normalizeText(getFirstValue(searchParams.search)),
  };
}
