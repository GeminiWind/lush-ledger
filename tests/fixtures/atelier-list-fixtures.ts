import { ATELIER_LIST_MONTH_CURRENT } from "./atelier-list-constants";

export type AtelierListCategoryStatus = "healthy" | "warning" | "overspent" | "pending";

export type AtelierListContractRow = {
  id: string;
  name: string;
  icon: string;
  limit: number;
  spent: number;
  usagePercent: number;
  warningEnabled: boolean;
  warnAt: number;
  carryNextMonth: boolean;
  status: AtelierListCategoryStatus;
};

export type AtelierListContractSuccess = {
  month: string;
  categories: AtelierListContractRow[];
};

export const buildAtelierListContractQuery = (month = ATELIER_LIST_MONTH_CURRENT) => ({
  query: {
    month,
  },
});

export const buildAtelierListContractRow = (
  overrides: Partial<AtelierListContractRow> = {},
): AtelierListContractRow => ({
  id: "cat_food",
  name: "Food",
  icon: "restaurant",
  limit: 5000000,
  spent: 4200000,
  usagePercent: 84,
  warningEnabled: true,
  warnAt: 80,
  carryNextMonth: true,
  status: "warning",
  ...overrides,
});

export const buildAtelierListContractSuccess = (
  overrides: Partial<AtelierListContractSuccess> = {},
): AtelierListContractSuccess => ({
  month: ATELIER_LIST_MONTH_CURRENT,
  categories: [buildAtelierListContractRow()],
  ...overrides,
});

export const buildAtelierListMonthValidationError = (message = "month must be in YYYY-MM format") => ({
  errors: {
    month: message,
  },
});

export const buildAtelierListUnauthorizedError = (message = "Unauthorized") => ({
  errors: {
    auth: message,
  },
});
