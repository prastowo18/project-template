export const ADMIN_USER_PAGE_SIZE = 25;

export type AdminUserQuery = {
  page: number;
  search: string;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizePage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function normalizeAdminUserQuery(searchParams: RawSearchParams): AdminUserQuery {
  return {
    page: normalizePage(getFirstValue(searchParams.page)),
    search: getFirstValue(searchParams.search)?.trim() ?? "",
  };
}
