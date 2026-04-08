import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { prisma } from "@/lib/db";
import { ensureDefaultWallet } from "@/lib/wallet";

type RawAllocation = {
  savingsPlanId: string;
  percentage: number;
};

export type AutoTransferPlanResult = {
  savingsPlanId: string;
  configuredPercentage: number;
  calculatedAmount: number;
  appliedAmount: number;
  status: "applied" | "skipped";
  skipReason: string | null;
  transactionId: string | null;
};

export type AutoTransferRuleResponse = {
  enabled: boolean;
  allocations: RawAllocation[];
  allocationTotalPercentage: number;
  eligiblePlans: Array<{
    id: string;
    name: string;
    status: string;
    remainingTargetAmount: number;
  }>;
};

export type AutoTransferLatestRunResponse = {
  monthStart: string;
  timezone: string;
  status: "applied" | "skipped";
  remainderAmount: number;
  allocationTotalPercentage: number;
  planResults: AutoTransferPlanResult[];
  skipReason: string | null;
};

type UpdateRuleInput = {
  enabled: boolean;
  allocations?: unknown;
};

const ELIGIBLE_PLAN_STATUSES = new Set(["active", "funded"]);

const asNumber = (value: unknown) => Number(value ?? 0);

const parseAllocations = (value: unknown): RawAllocation[] => {
  const parsedValue = (() => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })();

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const savingsPlanId = String(record.savingsPlanId || "").trim();
      const percentage = Number(record.percentage);

      if (!savingsPlanId || !Number.isFinite(percentage)) {
        return null;
      }

      return {
        savingsPlanId,
        percentage: Number.isInteger(percentage) ? percentage : Math.round(percentage),
      };
    })
    .filter((item): item is RawAllocation => Boolean(item));
};

const roundAmount = (value: number, currency: string) => {
  const fractionDigits = currency === "VND" ? 0 : 2;
  const factor = 10 ** fractionDigits;
  return Math.round(value * factor) / factor;
};

const getPlanSavedAmount = (transactions: Array<{ type: string; amount: Prisma.Decimal }>) => {
  return Math.max(
    0,
    transactions.reduce((sum, tx) => {
      const amount = asNumber(tx.amount);
      return sum + (tx.type === "expense" || tx.type === "refund" ? -amount : amount);
    }, 0),
  );
};

export const resolveUserTimezone = (timezone: string | null | undefined) => {
  const value = String(timezone || "UTC").trim();
  return value || "UTC";
};

export const monthStartFromTimezone = (timezone: string, value = new Date()) => {
  return DateTime.fromJSDate(value, { zone: "utc" }).setZone(timezone).startOf("month");
};

const getEligiblePlans = async (userId: string) => {
  const plans = await prisma.savingsPlan.findMany({
    where: {
      userId,
      OR: [{ status: "active" }, { status: "funded" }],
    },
    select: {
      id: true,
      name: true,
      status: true,
      targetAmount: true,
      transactions: {
        select: {
          amount: true,
          type: true,
        },
      },
    },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
  });

  return plans.map((plan) => {
    const saved = getPlanSavedAmount(plan.transactions);
    const remainingTargetAmount = Math.max(0, asNumber(plan.targetAmount) - saved);

    return {
      id: plan.id,
      name: plan.name,
      status: plan.status,
      remainingTargetAmount,
    };
  });
};

export const getAutoTransferRule = async (userId: string): Promise<AutoTransferRuleResponse> => {
  const [rule, eligiblePlans] = await Promise.all([
    prisma.autoTransferRule.findUnique({ where: { userId } }),
    getEligiblePlans(userId),
  ]);

  const allocations = parseAllocations(rule?.allocations);
  const allocationTotalPercentage = allocations.reduce((sum, item) => sum + item.percentage, 0);

  return {
    enabled: Boolean(rule?.enabled),
    allocations,
    allocationTotalPercentage,
    eligiblePlans,
  };
};

export const updateAutoTransferRule = async (userId: string, input: UpdateRuleInput) => {
  const currentRule = await prisma.autoTransferRule.findUnique({ where: { userId } });
  const providedAllocations = parseAllocations(input.allocations);
  const currentAllocations = parseAllocations(currentRule?.allocations);
  const allocations =
    providedAllocations.length > 0 || input.enabled
      ? providedAllocations
      : currentAllocations;

  const errors: Record<string, string> = {};

  if (typeof input.enabled !== "boolean") {
    errors.enabled = "Enabled flag is required.";
  }

  if (input.enabled && allocations.length < 1) {
    errors.allocations = "At least one allocation is required";
  }

  const uniquePlanIds = new Set<string>();
  let allocationTotalPercentage = 0;
  allocations.forEach((allocation, index) => {
    allocationTotalPercentage += allocation.percentage;

    if (!allocation.savingsPlanId) {
      errors[`allocations[${index}].savingsPlanId`] = "Savings plan is required.";
    }

    if (uniquePlanIds.has(allocation.savingsPlanId)) {
      errors[`allocations[${index}].savingsPlanId`] = "Savings plan must be unique.";
    }
    uniquePlanIds.add(allocation.savingsPlanId);

    if (!Number.isInteger(allocation.percentage) || allocation.percentage < 1 || allocation.percentage > 100) {
      errors[`allocations[${index}].percentage`] = "Must be between 1 and 100";
    }
  });

  if (input.enabled && (allocationTotalPercentage < 1 || allocationTotalPercentage > 100)) {
    errors.allocationTotalPercentage = "Total must be between 1 and 100";
  }

  if (allocations.length > 0) {
    const eligiblePlans = await prisma.savingsPlan.findMany({
      where: {
        userId,
        id: { in: allocations.map((item) => item.savingsPlanId) },
      },
      select: { id: true, status: true },
    });
    const eligibleMap = new Map(eligiblePlans.map((plan) => [plan.id, plan.status]));

    allocations.forEach((allocation, index) => {
      const status = eligibleMap.get(allocation.savingsPlanId);
      if (!status || !ELIGIBLE_PLAN_STATUSES.has(status)) {
        errors[`allocations[${index}].savingsPlanId`] =
          "Plan must be active/funded, unique, and belong to current user";
      }
    });
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false as const,
      errors,
    };
  }

  const savedRule = await prisma.autoTransferRule.upsert({
    where: { userId },
    create: {
      userId,
      enabled: input.enabled,
      allocations: JSON.stringify(allocations),
      allocationTotalPercentage,
    },
    update: {
      enabled: input.enabled,
      allocations: JSON.stringify(allocations),
      allocationTotalPercentage,
    },
  });

  return {
    ok: true as const,
    data: {
      enabled: savedRule.enabled,
      allocations,
      allocationTotalPercentage,
      status: "saved" as const,
    },
  };
};

export const getLatestAutoTransferRun = async (userId: string): Promise<AutoTransferLatestRunResponse | null> => {
  const run = await prisma.autoTransferRun.findFirst({
    where: { userId },
    orderBy: [{ monthStart: "desc" }, { createdAt: "desc" }],
  });

  if (!run) {
    return null;
  }

  const planResults = (() => {
    try {
      const parsed = JSON.parse(run.planResults);
      return Array.isArray(parsed) ? (parsed as AutoTransferPlanResult[]) : [];
    } catch {
      return [];
    }
  })();

  return {
    monthStart: DateTime.fromJSDate(run.monthStart).toISODate() || "",
    timezone: run.timezone,
    status: run.status === "applied" ? "applied" : "skipped",
    remainderAmount: asNumber(run.remainderAmount),
    allocationTotalPercentage: run.allocationTotalPercentage,
    planResults,
    skipReason: run.skipReason || null,
  };
};

type ExecuteInput = {
  userId: string;
  monthStartISO: string;
  timezone?: string;
};

export const executeMonthEndAutoTransferForUser = async ({ userId, monthStartISO, timezone }: ExecuteInput) => {
  const monthStartLocal = DateTime.fromISO(monthStartISO, { zone: timezone || "UTC" });
  if (!monthStartLocal.isValid) {
    throw new Error("Invalid monthStart input for auto-transfer execution.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      settings: {
        select: {
          timezone: true,
          currency: true,
        },
      },
    },
  });

  const activeTimezone = resolveUserTimezone(timezone || user?.settings?.timezone);
  const currency = user?.settings?.currency || "VND";

  const monthStart = monthStartLocal.setZone(activeTimezone).startOf("month");

  const existingRun = await prisma.autoTransferRun.findUnique({
    where: {
      userId_monthStart: {
        userId,
        monthStart: monthStart.toUTC().toJSDate(),
      },
    },
  });

  if (existingRun) {
    return existingRun;
  }

  const rule = await prisma.autoTransferRule.findUnique({ where: { userId } });
  const allocations = parseAllocations(rule?.allocations);
  const allocationTotalPercentage = allocations.reduce((sum, item) => sum + item.percentage, 0);

  if (!rule?.enabled || allocations.length < 1) {
    return prisma.autoTransferRun.create({
      data: {
        userId,
        monthStart: monthStart.toUTC().toJSDate(),
        timezone: activeTimezone,
        remainderAmount: 0,
        allocationTotalPercentage,
        planResults: JSON.stringify([]),
        status: "skipped",
        skipReason: "rule_disabled_or_empty",
      },
    });
  }

  const monthStartUtc = monthStart.toUTC();
  const monthEndUtc = monthStart.endOf("month").toUTC();

  const [monthTransactions, planSnapshots] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: monthStartUtc.toJSDate(),
          lte: monthEndUtc.toJSDate(),
        },
      },
      select: {
        type: true,
        amount: true,
      },
    }),
    prisma.savingsPlan.findMany({
      where: { userId, id: { in: allocations.map((item) => item.savingsPlanId) } },
      select: {
        id: true,
        name: true,
        status: true,
        targetAmount: true,
        transactions: {
          where: {
            date: {
              lte: monthEndUtc.toJSDate(),
            },
          },
          select: {
            amount: true,
            type: true,
          },
        },
      },
    }),
  ]);

  const totalIncome = monthTransactions
    .filter((tx) => tx.type === "income" || tx.type === "refund")
    .reduce((sum, tx) => sum + asNumber(tx.amount), 0);

  const totalOutcome = monthTransactions
    .filter((tx) => tx.type === "expense" || tx.type === "transfer_to_saving_plan")
    .reduce((sum, tx) => sum + asNumber(tx.amount), 0);

  const remainderAmount = roundAmount(totalIncome - totalOutcome, currency);
  const planMap = new Map(
    planSnapshots.map((plan) => {
      const saved = getPlanSavedAmount(plan.transactions);
      return [
        plan.id,
        {
          id: plan.id,
          name: plan.name,
          status: plan.status,
          remainingTargetAmount: Math.max(0, asNumber(plan.targetAmount) - saved),
        },
      ];
    }),
  );

  if (remainderAmount <= 0) {
    const planResults: AutoTransferPlanResult[] = allocations.map((allocation) => ({
      savingsPlanId: allocation.savingsPlanId,
      configuredPercentage: allocation.percentage,
      calculatedAmount: 0,
      appliedAmount: 0,
      status: "skipped",
      skipReason: "non_positive_remainder",
      transactionId: null,
    }));

    return prisma.autoTransferRun.create({
      data: {
        userId,
        monthStart: monthStartUtc.toJSDate(),
        timezone: activeTimezone,
        remainderAmount,
        allocationTotalPercentage,
        planResults: JSON.stringify(planResults),
        status: "skipped",
        skipReason: "non_positive_remainder",
      },
    });
  }

  const wallet = await ensureDefaultWallet(userId);
  const planResults: AutoTransferPlanResult[] = [];

  for (const allocation of allocations) {
    const plan = planMap.get(allocation.savingsPlanId);
    const calculatedAmount = roundAmount(remainderAmount * (allocation.percentage / 100), currency);

    if (!plan || !ELIGIBLE_PLAN_STATUSES.has(plan.status)) {
      planResults.push({
        savingsPlanId: allocation.savingsPlanId,
        configuredPercentage: allocation.percentage,
        calculatedAmount,
        appliedAmount: 0,
        status: "skipped",
        skipReason: "plan_unavailable",
        transactionId: null,
      });
      continue;
    }

    if (calculatedAmount <= 0) {
      planResults.push({
        savingsPlanId: allocation.savingsPlanId,
        configuredPercentage: allocation.percentage,
        calculatedAmount,
        appliedAmount: 0,
        status: "skipped",
        skipReason: "rounded_to_zero",
        transactionId: null,
      });
      continue;
    }

    const appliedAmount = roundAmount(Math.min(calculatedAmount, plan.remainingTargetAmount), currency);

    if (appliedAmount <= 0) {
      planResults.push({
        savingsPlanId: allocation.savingsPlanId,
        configuredPercentage: allocation.percentage,
        calculatedAmount,
        appliedAmount: 0,
        status: "skipped",
        skipReason: "target_reached",
        transactionId: null,
      });
      continue;
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId: wallet.id,
        savingsPlanId: plan.id,
        type: "transfer_to_saving_plan",
        amount: appliedAmount,
        date: monthStart.endOf("month").toUTC().toJSDate(),
        notes: `[AUTO_TRANSFER] ${monthStart.toFormat("yyyy-MM")} -> ${plan.name}`,
      },
      select: { id: true },
    });

    plan.remainingTargetAmount = Math.max(0, roundAmount(plan.remainingTargetAmount - appliedAmount, currency));

    planResults.push({
      savingsPlanId: plan.id,
      configuredPercentage: allocation.percentage,
      calculatedAmount,
      appliedAmount,
      status: "applied",
      skipReason: null,
      transactionId: transaction.id,
    });
  }

  const hasApplied = planResults.some((item) => item.status === "applied");

  try {
    return await prisma.autoTransferRun.create({
      data: {
        userId,
        monthStart: monthStartUtc.toJSDate(),
        timezone: activeTimezone,
        remainderAmount,
        allocationTotalPercentage,
        planResults: JSON.stringify(planResults),
        status: hasApplied ? "applied" : "skipped",
        skipReason: hasApplied ? null : "all_allocations_skipped",
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const run = await prisma.autoTransferRun.findUnique({
        where: {
          userId_monthStart: {
            userId,
            monthStart: monthStartUtc.toJSDate(),
          },
        },
      });
      if (run) {
        return run;
      }
    }
    throw error;
  }
};
