export const AUTH_RATE_LIMIT_DEFAULTS = {
  window: 60,
  max: 100,
} as const;

export const AUTH_RATE_LIMIT_RULES = {
  SIGN_IN_EMAIL: {
    path: "/sign-in/email",
    window: 60,
    max: 10,
  },

  SIGN_UP_EMAIL: {
    path: "/sign-up/email",
    window: 600,
    max: 5,
  },
} as const;

export function createAuthRateLimitConfig() {
  return {
    enabled: true,
    storage: "database" as const,
    modelName: "rateLimit",

    window: AUTH_RATE_LIMIT_DEFAULTS.window,
    max: AUTH_RATE_LIMIT_DEFAULTS.max,

    customRules: {
      [AUTH_RATE_LIMIT_RULES.SIGN_IN_EMAIL.path]: {
        window: AUTH_RATE_LIMIT_RULES.SIGN_IN_EMAIL.window,
        max: AUTH_RATE_LIMIT_RULES.SIGN_IN_EMAIL.max,
      },

      [AUTH_RATE_LIMIT_RULES.SIGN_UP_EMAIL.path]: {
        window: AUTH_RATE_LIMIT_RULES.SIGN_UP_EMAIL.window,
        max: AUTH_RATE_LIMIT_RULES.SIGN_UP_EMAIL.max,
      },
    },
  };
}
