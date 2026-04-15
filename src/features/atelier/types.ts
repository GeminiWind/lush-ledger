import type { ReactNode } from "react";

export type AtelierCategoryWarning = {
  enabled: boolean;
  warnAt: number;
};

export type AtelierListRiskStatus = "healthy" | "warning" | "overspent" | "pending";

export type AtelierListRiskLabels = Record<AtelierListRiskStatus, string>;

export type AtelierListRow = {
  id: string;
  name: string;
  icon: string;
  limit: number;
  spent: number;
  usagePercent: number;
  warningEnabled: boolean;
  warnAt: number;
  carryNextMonth: boolean;
  status: AtelierListRiskStatus;
};

export type AtelierListViewModel = {
  month: string;
  categories: AtelierListRow[];
};

export type AtelierJsonRecord = Record<string, unknown>;

export type AtelierCategoryStat = {
  id: string;
  name: string;
  icon: string;
  limit: number;
  spent: number;
  usage: number;
  warningEnabled: boolean;
  warnAt: number;
};

export type CategoryAtelierGridProps = {
  categories: AtelierListRow[];
  currency: string;
  language: string;
  riskLabels: AtelierListRiskLabels;
  pendingLabel: string;
  addCategoryTrigger?: ReactNode;
  onEditCategory?: (category: EditableCategory) => void;
};

export type TotalCapCardProps = {
  currency: string;
  language: string;
  month: string;
  totalCap: number;
  allocated: number;
  remaining: number;
  monthIncome: number;
  capProgress: number;
};

export type AddCategoryModalProps = {
  currency: string;
  language: string;
  initialOpen?: boolean;
};

export type EditableCategory = {
  id: string;
  name: string;
  icon: string;
  limit: number;
  warningEnabled: boolean;
  warnAt: number;
  carryNextMonth: boolean;
};

export type EditCategoryModalProps = {
  category: EditableCategory | null;
  currency: string;
  language: string;
  activeMonth: string;
  isOpen: boolean;
  onClose: () => void;
};

export type UpdateCategoryPayload = {
  name: string;
  icon: string;
  monthlyLimit: number;
  warningEnabled: boolean;
  warnAt: number;
  keepLimitNextMonth: boolean;
};

export type DeleteCategoryTarget = {
  id: string;
  name: string;
  icon: string;
  limit: number;
  spent: number;
};

export type DeleteCategoryDialogProps = {
  category: DeleteCategoryTarget;
  currency: string;
  language: string;
};
