export type PasswordRule = {
  id: string;
  label: string;
  test: (pw: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { id: 'lower', label: 'A lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { id: 'upper', label: 'An uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'number', label: 'A number', test: (pw) => /[0-9]/.test(pw) },
  { id: 'symbol', label: 'A special character (!@#$…)', test: (pw) => /[^a-zA-Z0-9]/.test(pw) },
];

export function validatePassword(pw: string): { passed: PasswordRule[]; failed: PasswordRule[] } {
  const passed: PasswordRule[] = [];
  const failed: PasswordRule[] = [];
  for (const rule of PASSWORD_RULES) {
    if (rule.test(pw)) passed.push(rule);
    else failed.push(rule);
  }
  return { passed, failed };
}

export function isPasswordValid(pw: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(pw));
}
