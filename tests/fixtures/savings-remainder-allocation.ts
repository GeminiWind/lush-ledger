export type SavingsPlanFixture = {
  id: string;
  name: string;
  status: "active" | "funded" | "completed" | "archive" | "cancelled";
  priorityPercent: number;
  remainingNeed: number;
};

export type MonthAllocationFixture = {
  month: string;
  totalCap: number;
  totalLimit: number;
  recognizedExpenses: number;
  plans: SavingsPlanFixture[];
};

export const buildMonthAllocationFixture = (
  partial: Partial<MonthAllocationFixture> = {},
): MonthAllocationFixture => {
  return {
    month: partial.month ?? "2026-04",
    totalCap: partial.totalCap ?? 12000000,
    totalLimit: partial.totalLimit ?? 9000000,
    recognizedExpenses: partial.recognizedExpenses ?? 9000000,
    plans:
      partial.plans ?? [
        {
          id: "plan-home",
          name: "Home Atelier",
          status: "active",
          priorityPercent: 60,
          remainingNeed: 3000000,
        },
        {
          id: "plan-travel",
          name: "Travel",
          status: "funded",
          priorityPercent: 40,
          remainingNeed: 2000000,
        },
      ],
  };
};
