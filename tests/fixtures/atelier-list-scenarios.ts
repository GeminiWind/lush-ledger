import {
  ATELIER_LIST_MONTH_CURRENT,
  ATELIER_LIST_MONTH_NEXT,
  ATELIER_LIST_MONTH_PREVIOUS,
} from "./atelier-list-constants";
import {
  buildAtelierListContractRow,
  buildAtelierListContractSuccess,
  type AtelierListContractSuccess,
} from "./atelier-list-fixtures";

export const buildAtelierListMonthSwitchScenario = () => {
  const currentMonth = buildAtelierListContractSuccess({
    month: ATELIER_LIST_MONTH_CURRENT,
    categories: [
      buildAtelierListContractRow({
        id: "cat_food",
        name: "Food",
        limit: 5000000,
        spent: 4200000,
        usagePercent: 84,
        status: "warning",
        carryNextMonth: true,
      }),
      buildAtelierListContractRow({
        id: "cat_transport",
        name: "Transport",
        icon: "directions_car",
        limit: 1200000,
        spent: 500000,
        usagePercent: 42,
        warnAt: 70,
        status: "healthy",
        carryNextMonth: false,
      }),
    ],
  });

  const nextMonth = buildAtelierListContractSuccess({
    month: ATELIER_LIST_MONTH_NEXT,
    categories: [
      buildAtelierListContractRow({
        id: "cat_food",
        name: "Food",
        limit: 5200000,
        spent: 1300000,
        usagePercent: 25,
        status: "healthy",
        carryNextMonth: false,
      }),
      buildAtelierListContractRow({
        id: "cat_transport",
        name: "Transport",
        icon: "directions_car",
        limit: 1200000,
        spent: 1400000,
        usagePercent: 100,
        warnAt: 70,
        status: "overspent",
        carryNextMonth: true,
      }),
    ],
  });

  return {
    currentMonth,
    nextMonth,
  };
};

export const buildAtelierListRiskStatusScenario = (): AtelierListContractSuccess =>
  buildAtelierListContractSuccess({
    categories: [
      buildAtelierListContractRow({
        id: "cat_groceries",
        name: "Groceries",
        icon: "shopping_cart",
        limit: 3000000,
        spent: 1200000,
        usagePercent: 40,
        warnAt: 80,
        status: "healthy",
      }),
      buildAtelierListContractRow({
        id: "cat_bills",
        name: "Bills",
        icon: "receipt_long",
        limit: 2000000,
        spent: 1600000,
        usagePercent: 80,
        warnAt: 80,
        status: "warning",
      }),
      buildAtelierListContractRow({
        id: "cat_shopping",
        name: "Shopping",
        icon: "storefront",
        limit: 1800000,
        spent: 2200000,
        usagePercent: 100,
        warnAt: 75,
        status: "overspent",
      }),
      buildAtelierListContractRow({
        id: "cat_misc",
        name: "Misc",
        icon: "more_horiz",
        limit: 0,
        spent: 0,
        usagePercent: 0,
        warningEnabled: true,
        warnAt: 80,
        status: "pending",
        carryNextMonth: false,
      }),
    ],
  });

export const buildAtelierListNoSnapshotScenario = (): AtelierListContractSuccess =>
  buildAtelierListContractSuccess({
    month: ATELIER_LIST_MONTH_PREVIOUS,
    categories: [
      buildAtelierListContractRow({
        id: "cat_food",
        name: "Food",
        limit: 0,
        spent: 0,
        usagePercent: 0,
        warningEnabled: true,
        warnAt: 80,
        carryNextMonth: false,
        status: "pending",
      }),
    ],
  });

export const buildAtelierListEmptyScenario = (month = ATELIER_LIST_MONTH_CURRENT): AtelierListContractSuccess =>
  buildAtelierListContractSuccess({ month, categories: [] });
