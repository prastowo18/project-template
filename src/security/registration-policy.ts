export const PUBLIC_REGISTRATION_DEFAULT = false;

export function createRegistrationPolicy(publicRegistrationEnabled = PUBLIC_REGISTRATION_DEFAULT) {
  return {
    disableSignUp: !publicRegistrationEnabled,
  } as const;
}
