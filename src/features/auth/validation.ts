const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const isValidEmailFormat = (email: string) => EMAIL_REGEX.test(email);

export const getPasswordPolicyIssues = (password: string) => {
  const issues: string[] = [];

  if (password.length < 8) {
    issues.push("at least 8 characters");
  }
  if (password.length > 72) {
    issues.push("72 characters or less");
  }
  if (!/[A-Z]/.test(password)) {
    issues.push("an uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    issues.push("a lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    issues.push("a number");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    issues.push("a special character");
  }

  return issues;
};
