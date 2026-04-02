export type AtelierCategoryWarning = {
  enabled: boolean;
  warnAt: number;
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
  categories: AtelierCategoryStat[];
  currency: string;
  language: string;
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
};

export type EditableCategory = {
  id: string;
  name: string;
  icon: string;
  limit: number;
  warningEnabled: boolean;
  warnAt: number;
};

export type EditCategoryModalProps = {
  category: EditableCategory;
  currency: string;
  language: string;
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
