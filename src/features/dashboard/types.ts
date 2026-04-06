export type BudgetItem = {
  id: string;
  name: string;
  spent: number;
  budget: number;
  remaining: number;
  isOverspent: boolean;
  isWarning: boolean;
};

export type ActiveBudgetsPanelProps = {
  budgets: BudgetItem[];
  currency: string;
  daysRemaining: number;
  language: string;
};

export type TopCategory = {
  id: string;
  name: string;
  icon?: string | null;
  spent: number;
};

export type TopCategoriesPanelProps = {
  categories: TopCategory[];
  currency: string;
  language: string;
};
