export type SavingsPlanStatus = "active" | "cancelled" | "archive";

export type SavingsJsonRecord = Record<string, unknown>;

export type SavingsFilter = "active" | "completed" | "archived" | "cancelled";

export type SavingsFilterDropdownProps = {
  currentFilter: SavingsFilter;
  requestedPlanId?: string;
};

export type GrowthPoint = {
  label: string;
  value: number;
};

export type SavingsGrowthChartProps = {
  points: GrowthPoint[];
};

export type SavingsPlanStateButtonProps = {
  planId: string;
  planName: string;
  status: string;
  compact?: boolean;
};

export type PrimarySavingsProgressChartProps = {
  progress: number;
};

export type SavingsPlanEditable = {
  id: string;
  name: string;
  icon?: string;
  target: number;
  saved: number;
  monthlyContribution: number;
  targetDate: Date | string;
  isPrimary: boolean;
};

export type SavingsPlanCreateDialogProps = {
  variant?: "button" | "card";
};

export type EditSavingsPlanDialogProps = {
  plan: SavingsPlanEditable;
  trigger?: "primary" | "card";
};

export type PlanOption = {
  id: string;
  name: string;
  progress: number;
};

export type WalletOption = {
  id: string;
  name: string;
};

export type AddContributionDialogProps = {
  plans: PlanOption[];
  wallets: WalletOption[];
  defaultPlanId?: string;
};
