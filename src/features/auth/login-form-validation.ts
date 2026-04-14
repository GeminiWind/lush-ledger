import { isValidEmailFormat } from "@/features/auth/validation";

export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export type LoginFormErrors = {
  email?: string;
  password?: string;
};

export const validateLoginForm = (values: LoginFormValues) => {
  const errors: LoginFormErrors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmailFormat(values.email.trim())) {
    errors.email = "Email format is invalid.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
};
