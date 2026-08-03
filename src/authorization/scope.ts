export type AuthorizationScope = Readonly<{
  type: string;
  id: string;
}>;

export const GLOBAL_SCOPE = {
  type: "global",
  id: "*",
} as const satisfies AuthorizationScope;

function normalizeScopeValue(value: string, field: "scope.type" | "scope.id") {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${field} tidak boleh kosong.`);
  }

  return normalized;
}

export function getAuthorizationScopeCandidates(
  scope: AuthorizationScope = GLOBAL_SCOPE,
): AuthorizationScope[] {
  const type = normalizeScopeValue(scope.type, "scope.type");
  const id = normalizeScopeValue(scope.id, "scope.id");

  const candidates: AuthorizationScope[] = [
    GLOBAL_SCOPE,
    {
      type,
      id: "*",
    },
    {
      type,
      id,
    },
  ];

  const uniqueCandidates = new Map<string, AuthorizationScope>();

  for (const candidate of candidates) {
    uniqueCandidates.set(`${candidate.type}:${candidate.id}`, candidate);
  }

  return [...uniqueCandidates.values()];
}
