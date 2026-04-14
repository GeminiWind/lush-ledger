import { DateTime } from "luxon";
import type { AtelierListRiskStatus, AtelierListRow } from "@/features/atelier/types";

const MONTH_PARAM_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const toNumber = (value: unknown) => Number(value ?? 0);

export const parseAtelierMonthParam = (value: string | undefined, timezone: string): DateTime | null => {
  if (!value || !MONTH_PARAM_PATTERN.test(value)) {
    return null;
  }

  const monthDate = DateTime.fromFormat(value, "yyyy-MM", {
    zone: timezone,
  });

  if (!monthDate.isValid) {
    return null;
  }

  return monthDate.startOf("month");
};

export const monthParamFromDate = (value: DateTime) => value.toFormat("yyyy-MM");

export const buildAtelierMonthHref = (pathname: string, currentSearch: string, month: string) => {
  const params = new URLSearchParams(currentSearch);
  params.set("month", month);
  return `${pathname}?${params.toString()}`;
};

export const createAtelierMonthOptions = (selectedMonth: DateTime, count = 12) => {
  const options: string[] = [];

  for (let index = 0; index < count; index += 1) {
    options.push(monthParamFromDate(selectedMonth.minus({ months: index })));
  }

  return options;
};

const resolveRiskStatus = ({
  spent,
  limit,
  warningEnabled,
  warnAt,
  hasMonthSnapshot,
}: {
  spent: number;
  limit: number;
  warningEnabled: boolean;
  warnAt: number;
  hasMonthSnapshot: boolean;
}): AtelierListRiskStatus => {
  if (!hasMonthSnapshot) {
    return "pending";
  }

  if (limit > 0 && spent > limit) {
    return "overspent";
  }

  const usagePercent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  const threshold = Math.min(Math.max(warnAt, 1), 100);

  if (warningEnabled && limit > 0 && usagePercent >= threshold) {
    return "warning";
  }

  return "healthy";
};

export const mapAtelierListRows = ({
  categories,
  monthLimits,
  nextMonthLimits,
  monthTransactions,
}: {
  categories: Array<{
    id: string;
    name: string;
    icon: string | null;
  }>;
  monthLimits: Array<{
    categoryId: string;
    limit: unknown;
    warningEnabled: boolean;
    warnAt: number;
  }>;
  nextMonthLimits: Array<{
    categoryId: string;
    limit: unknown;
  }>;
  monthTransactions: Array<{
    type: string;
    amount: unknown;
    categoryId: string | null;
  }>;
}): AtelierListRow[] => {
  const monthLimitByCategoryId = new Map(monthLimits.map((item) => [item.categoryId, item]));
  const nextMonthLimitByCategoryId = new Map(nextMonthLimits.map((item) => [item.categoryId, item]));

  return categories.map((category) => {
    const monthLimit = monthLimitByCategoryId.get(category.id);
    const nextMonthLimit = nextMonthLimitByCategoryId.get(category.id);
    const hasMonthSnapshot = Boolean(monthLimit);

    const limit = toNumber(monthLimit?.limit);
    const spent = monthTransactions
      .filter((tx) => tx.categoryId === category.id && tx.type === "expense")
      .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

    const usagePercent = limit > 0 ? Math.min(100, Math.max(0, Math.round((spent / limit) * 100))) : 0;
    const warningEnabled = monthLimit?.warningEnabled ?? true;
    const warnAt = monthLimit?.warnAt ?? 80;
    const nextLimit = toNumber(nextMonthLimit?.limit);

    return {
      id: category.id,
      name: category.name,
      icon: category.icon || "category",
      limit,
      spent,
      usagePercent,
      warningEnabled,
      warnAt,
      carryNextMonth: Boolean(monthLimit && nextMonthLimit && nextLimit === limit),
      status: resolveRiskStatus({
        spent,
        limit,
        warningEnabled,
        warnAt,
        hasMonthSnapshot,
      }),
    };
  });
};
