import {
  getPasswordPolicyIssues,
  isValidEmailFormat,
} from "@/features/auth/validation";

export type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

export type RegisterFormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: string;
};

export const validateRegisterForm = (values: RegisterFormValues) => {
  const errors: RegisterFormErrors = {};

  if (!values.fullName.trim() || values.fullName.trim().length < 2) {
    errors.fullName = "Full name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmailFormat(values.email.trim())) {
    errors.email = "Email format is invalid.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else {
    const passwordIssues = getPasswordPolicyIssues(values.password);
    if (passwordIssues.length > 0) {
      errors.password = `Password must include ${passwordIssues.join(", ")}.`;
    }
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm password is required.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = "You must accept terms.";
  }

  return errors;
};
