import { endOfMonthDate, getMonthRange, nowDate } from "@/lib/date";
import { getMonthlyAllocationEligibility, monthKeyOf, monthStartOf } from "@/lib/monthly-cap";
import { prisma } from "@/lib/db";
import { resolveProcessingMonthStart } from "@/lib/month-end-allocation-cron";
import { enqueueMonthEndAllocationJobs } from "@/lib/queue/producer";
import { ensureDefaultWallet } from "@/lib/wallet";
import type { MonthEndAllocationTriggerSource } from "@/lib/queue/month-end-allocation-queue";

export type RemainderAllocationRunStatus =
  | "applied"
  | "no_op_zero_remainder"
  | "no_op_not_visible"
  | "no_op_no_eligible_plans";

export type RemainderUnallocatedReason =
  | "none"
  | "exceeds_eligible_need"
  | "zero_remainder"
  | "not_visible"
  | "no_eligible_plans";

export type SavingsRemainderAllocationEntry = {
  savingsPlanId: string;
  priorityPercent: number;
  plannedAmount: number;
  appliedAmount: number;
  result: "applied" | "capped" | "skipped";
  transactionId: string | null;
  allocationRunKey?: string | null;
  allocationTriggerSource?: MonthEndAllocationTriggerSource | null;
  allocationReplayReason?: string | null;
};

export type SavingsRemainderAllocationRun = {
  month: string;
  status: RemainderAllocationRunStatus;
  sourceRemainder: number;
  totalTransferred: number;
  unallocatedRemainder: number;
  unallocatedReason: RemainderUnallocatedReason;
  transferTransactionType: "transfer_to_saving_plan";
  entries: SavingsRemainderAllocationEntry[];
};

export type SavingsRemainderAllocationEligibilitySummary = {
  month: string;
  totalCap: number;
  totalLimit: number;
  isVisible: boolean;
  reason: string;
  latestRun: SavingsRemainderAllocationRun | null;
};

export type ExecuteSavingsRemainderAllocationInput = {
  userId: string;
  monthStart: Date;
  trigger: "manual" | "scheduled";
  triggerSource?: MonthEndAllocationTriggerSource;
  replayReason?: string;
};

export type MonthlyPrioritySetting = {
  savingsPlanId: string;
  priorityPercent: number;
};

type EligiblePlan = {
  id: string;
  priorityPercent: number;
  remainingNeed: number;
};

const toNumber = (value: unknown) => Number(value ?? 0);

const toCents = (value: number) => Math.max(0, Math.round(value * 100));
const fromCents = (value: number) => value / 100;

const sum = (values: number[]) => values.reduce((acc, value) => acc + value, 0);

const AUTO_NOTE_PREFIX = "AUTO_MONTH_END_ALLOCATION";

const ALLOCATION_RUN_KEY_TAG = "RUN_KEY";
const ALLOCATION_PRIORITY_TAG = "PERCENT";
const ALLOCATION_TRACE_MONTH_TAG = "TRACE_MONTH";
const ALLOCATION_TRACE_PLAN_TAG = "TRACE_PLAN";
const ALLOCATION_TRACE_APPLIED_TAG = "TRACE_APPLIED";
const ALLOCATION_TRACE_SOURCE_TAG = "TRACE_SOURCE";
const ALLOCATION_TRACE_REPLAY_REASON_TAG = "TRACE_REPLAY_REASON";

export const buildAutoAllocationNoteTag = (month: string) => {
  return `${AUTO_NOTE_PREFIX}:${month}`;
};

export const buildAutoAllocationAuditMetadata = (input: {
  noteTag: string;
  runKey: string;
  month: string;
  savingsPlanId: string;
  priorityPercent: number;
  appliedAmount: number;
  triggerSource?: MonthEndAllocationTriggerSource;
  replayReason?: string;
}) => {
  const parts = [
    input.noteTag,
    `${ALLOCATION_RUN_KEY_TAG}:${input.runKey}`,
    `${ALLOCATION_PRIORITY_TAG}:${input.priorityPercent.toFixed(2)}`,
    `${ALLOCATION_TRACE_MONTH_TAG}:${input.month}`,
    `${ALLOCATION_TRACE_PLAN_TAG}:${input.savingsPlanId}`,
    `${ALLOCATION_TRACE_APPLIED_TAG}:${input.appliedAmount.toFixed(2)}`,
  ];

  if (input.triggerSource) {
    parts.push(`${ALLOCATION_TRACE_SOURCE_TAG}:${input.triggerSource}`);
  }

  if (input.replayReason) {
    parts.push(`${ALLOCATION_TRACE_REPLAY_REASON_TAG}:${input.replayReason.replace(/;/g, " ")}`);
  }

  return parts.join(";");
};

const parseAllocationTagValue = (note: string | null | undefined, key: string) => {
  if (!note) {
    return null;
  }

  const token = note
    .split(";")
    .map((segment) => segment.trim())
    .find((segment) => segment.startsWith(`${key}:`));

  if (!token) {
    return null;
  }

  return token.slice(key.length + 1);
};

const parseTriggerSource = (note: string | null | undefined): MonthEndAllocationTriggerSource | null => {
  const source = parseAllocationTagValue(note, ALLOCATION_TRACE_SOURCE_TAG);
  return source === "cron" || source === "replay" ? source : null;
};

export const parseAutoAllocationAuditMetadata = (note: string | null | undefined) => {
  return {
    runKey: parseAllocationTagValue(note, ALLOCATION_RUN_KEY_TAG),
    month: parseAllocationTagValue(note, ALLOCATION_TRACE_MONTH_TAG),
    savingsPlanId: parseAllocationTagValue(note, ALLOCATION_TRACE_PLAN_TAG),
    appliedAmount: parseAllocationTagValue(note, ALLOCATION_TRACE_APPLIED_TAG),
    priorityPercent: parseAllocationTagValue(note, ALLOCATION_PRIORITY_TAG),
    triggerSource: parseAllocationTagValue(note, ALLOCATION_TRACE_SOURCE_TAG),
    replayReason: parseAllocationTagValue(note, ALLOCATION_TRACE_REPLAY_REASON_TAG),
  };
};

const toUnallocatedReason = (input: {
  status: RemainderAllocationRunStatus;
  unallocatedRemainder: number;
}): RemainderUnallocatedReason => {
  if (input.status === "no_op_not_visible") {
    return "not_visible";
  }
  if (input.status === "no_op_zero_remainder") {
    return "zero_remainder";
  }
  if (input.status === "no_op_no_eligible_plans") {
    return "no_eligible_plans";
  }

  return input.unallocatedRemainder > 0 ? "exceeds_eligible_need" : "none";
};

const createNoOpAllocationRun = (input: {
  month: string;
  status: Extract<RemainderAllocationRunStatus, "no_op_not_visible" | "no_op_zero_remainder" | "no_op_no_eligible_plans">;
  sourceRemainder: number;
  entries?: SavingsRemainderAllocationEntry[];
}) => {
  const unallocatedRemainder = input.status === "no_op_zero_remainder" ? 0 : input.sourceRemainder;

  return {
    month: input.month,
    status: input.status,
    sourceRemainder: input.sourceRemainder,
    totalTransferred: 0,
    unallocatedRemainder,
    unallocatedReason: toUnallocatedReason({
      status: input.status,
      unallocatedRemainder,
    }),
    transferTransactionType: "transfer_to_saving_plan" as const,
    entries: input.entries ?? [],
  };
};

export const selectEligibleSavingsPlans = (
  plans: Array<{
    id: string;
    status: string;
    monthlyContribution: number;
    targetAmount: number;
    savedAmount: number;
  }>,
): EligiblePlan[] => {
  const activeCandidates = plans
    .map((plan) => {
      const remainingNeed = Math.max(plan.targetAmount - plan.savedAmount, 0);
      const isEligibleStatus = plan.status === "active" || plan.status === "funded";

      return {
        id: plan.id,
        weight: Math.max(plan.monthlyContribution, 0),
        remainingNeed,
        isEligibleStatus,
      };
    })
    .filter((plan) => plan.isEligibleStatus && plan.remainingNeed > 0 && plan.weight > 0);

  const totalWeight = sum(activeCandidates.map((plan) => plan.weight));
  if (totalWeight <= 0) {
    return [];
  }

  return activeCandidates.map((plan) => ({
    id: plan.id,
    remainingNeed: plan.remainingNeed,
    priorityPercent: (plan.weight / totalWeight) * 100,
  }));
};

export const getSavingsRemainderPrioritySettings = async (
  userId: string,
  monthStart: Date,
): Promise<MonthlyPrioritySetting[]> => {
  const rows = await prisma.savingsPlanMonthlyPriority.findMany({
    where: {
      userId,
      monthStart: monthStartOf(monthStart),
    },
    orderBy: [{ priorityPercent: "desc" }, { createdAt: "asc" }],
    select: {
      savingsPlanId: true,
      priorityPercent: true,
    },
  });

  return rows.map((row) => ({
    savingsPlanId: row.savingsPlanId,
    priorityPercent: toNumber(row.priorityPercent),
  }));
};

export const replaceSavingsRemainderPrioritySettings = async (input: {
  userId: string;
  monthStart: Date;
  settings: MonthlyPrioritySetting[];
}) => {
  const normalizedMonth = monthStartOf(input.monthStart);
  const settings = input.settings
    .map((item) => ({
      savingsPlanId: item.savingsPlanId,
      priorityPercent: Math.max(0, Number(item.priorityPercent) || 0),
    }))
    .filter((item) => item.priorityPercent > 0);

  const total = sum(settings.map((item) => item.priorityPercent));
  const normalized = total > 0
    ? settings.map((item) => ({
        savingsPlanId: item.savingsPlanId,
        priorityPercent: (item.priorityPercent / total) * 100,
      }))
    : [];

  await prisma.$transaction(async (tx) => {
    await tx.savingsPlanMonthlyPriority.deleteMany({
      where: {
        userId: input.userId,
        monthStart: normalizedMonth,
      },
    });

    if (normalized.length === 0) {
      return;
    }

    for (const item of normalized) {
      await tx.savingsPlanMonthlyPriority.create({
        data: {
          userId: input.userId,
          savingsPlanId: item.savingsPlanId,
          monthStart: normalizedMonth,
          priorityPercent: item.priorityPercent,
        },
      });
    }
  });

  return normalized;
};

export const addDefaultPrimarySavingsRemainderSetting = async (input: {
  userId: string;
  monthStart: Date;
}) => {
  const normalizedMonth = monthStartOf(input.monthStart);
  const existing = await getSavingsRemainderPrioritySettings(input.userId, normalizedMonth);
  if (existing.length > 0) {
    return existing;
  }

  const primary = await prisma.savingsPlan.findFirst({
    where: {
      userId: input.userId,
      status: "active",
      isPrimary: true,
    },
    select: { id: true },
  });

  if (!primary) {
    return [];
  }

  return replaceSavingsRemainderPrioritySettings({
    userId: input.userId,
    monthStart: normalizedMonth,
    settings: [{ savingsPlanId: primary.id, priorityPercent: 100 }],
  });
};

const applyPrioritySettingsToEligiblePlans = (
  eligiblePlans: EligiblePlan[],
  settings: MonthlyPrioritySetting[],
): EligiblePlan[] => {
  if (settings.length === 0) {
    return eligiblePlans;
  }

  const eligibleById = new Map(eligiblePlans.map((plan) => [plan.id, plan]));
  const matched = settings
    .map((setting) => {
      const eligible = eligibleById.get(setting.savingsPlanId);
      if (!eligible) {
        return null;
      }
      return {
        ...eligible,
        priorityPercent: Math.max(0, setting.priorityPercent),
      };
    })
    .filter((item): item is EligiblePlan => Boolean(item));

  const total = sum(matched.map((item) => item.priorityPercent));
  if (total <= 0) {
    return [];
  }

  return matched.map((item) => ({
    ...item,
    priorityPercent: (item.priorityPercent / total) * 100,
  }));
};

export const computeRemainderAllocationEntries = (
  sourceRemainder: number,
  plans: EligiblePlan[],
): {
  totalTransferred: number;
  unallocatedRemainder: number;
  entries: SavingsRemainderAllocationEntry[];
} => {
  // Convert to integer cents so every redistribution step is deterministic
  // and the final reconciliation can avoid floating-point drift.
  let remainingPool = toCents(sourceRemainder);
  const state = plans.map((plan) => ({
    ...plan,
    remainingNeedCents: toCents(plan.remainingNeed),
    appliedCents: 0,
    capped: false,
  }));

  while (remainingPool > 0) {
    // Only plans with remaining target need participate in each round.
    const candidates = state.filter((plan) => plan.remainingNeedCents > 0);
    if (candidates.length === 0) {
      break;
    }

    const totalPriority = sum(candidates.map((plan) => plan.priorityPercent));
    if (totalPriority <= 0) {
      break;
    }

    // First pass: proportional split by priority with integer floor.
    const base = candidates.map((plan) => {
      const weighted = (remainingPool * plan.priorityPercent) / totalPriority;
      const floored = Math.floor(weighted);
      return {
        id: plan.id,
        floor: floored,
        fractional: weighted - floored,
      };
    });

    // Second pass: distribute leftover cents by highest fractional remainder,
    // so total assigned cents exactly matches remainingPool.
    let remainderUnits = remainingPool - sum(base.map((item) => item.floor));
    base.sort((left, right) => {
      if (right.fractional !== left.fractional) {
        return right.fractional - left.fractional;
      }
      return right.floor - left.floor;
    });

    const plannedById = new Map<string, number>();
    for (const item of base) {
      plannedById.set(item.id, item.floor);
    }

    let index = 0;
    while (remainderUnits > 0 && base.length > 0) {
      const candidate = base[index % base.length];
      plannedById.set(candidate.id, (plannedById.get(candidate.id) ?? 0) + 1);
      remainderUnits -= 1;
      index += 1;
    }

    let appliedThisRound = 0;
    for (const candidate of candidates) {
      const planned = plannedById.get(candidate.id) ?? 0;
      if (planned <= 0) {
        continue;
      }

      const applied = Math.min(planned, candidate.remainingNeedCents);
      candidate.appliedCents += applied;
      candidate.remainingNeedCents -= applied;
      // Mark capped when plan receives less than its calculated share
      // because remaining target need is smaller than planned amount.
      candidate.capped = candidate.capped || applied < planned;
      appliedThisRound += applied;
    }

    if (appliedThisRound <= 0) {
      break;
    }

    remainingPool -= appliedThisRound;
  }

  const entries: SavingsRemainderAllocationEntry[] = state.map((plan) => {
    const plannedAmount = fromCents(toCents(sourceRemainder) * (plan.priorityPercent / 100));
    const appliedAmount = fromCents(plan.appliedCents);
    const result: SavingsRemainderAllocationEntry["result"] =
      appliedAmount <= 0 ? "skipped" : plan.capped ? "capped" : "applied";

    return {
      savingsPlanId: plan.id,
      priorityPercent: plan.priorityPercent,
      plannedAmount,
      appliedAmount,
      result,
      transactionId: null,
    };
  });

  const totalTransferred = entries.reduce((acc, item) => acc + item.appliedAmount, 0);

  return {
    totalTransferred,
    unallocatedRemainder: Math.max(sourceRemainder - totalTransferred, 0),
    entries,
  };
};

export const createSavingsRemainderRunKey = (
  userId: string,
  monthStart: Date,
) => {
  return `${userId}:${monthKeyOf(monthStart)}`;
};

export const getSavingsRemainderAllocationSummary = async (
  userId: string,
  monthStart: Date,
): Promise<SavingsRemainderAllocationEligibilitySummary> => {
  const normalizedMonth = monthStartOf(monthStart);
  const month = monthKeyOf(normalizedMonth);
  const eligibility = await getMonthlyAllocationEligibility(userId, normalizedMonth);

  const { start, end } = getMonthRange(normalizedMonth);
  const autoNoteTag = buildAutoAllocationNoteTag(month);
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "transfer_to_saving_plan",
      date: { gte: start, lte: end },
      notes: { contains: autoNoteTag },
    },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      amount: true,
      savingsPlanId: true,
      notes: true,
    },
  });

  let latestRun: SavingsRemainderAllocationRun | null = null;
  if (transactions.length > 0) {
    const byPlan = new Map<
      string,
      {
        amount: number;
        transactionId: string;
        runKey: string | null;
        triggerSource: MonthEndAllocationTriggerSource | null;
        replayReason: string | null;
      }
    >();
    for (const tx of transactions) {
      if (!tx.savingsPlanId) {
        continue;
      }
      const parsedRunKey = parseAllocationTagValue(tx.notes, ALLOCATION_RUN_KEY_TAG);
      const parsedTriggerSource = parseTriggerSource(tx.notes);
      const parsedReplayReason = parseAllocationTagValue(tx.notes, ALLOCATION_TRACE_REPLAY_REASON_TAG);
      const existing = byPlan.get(tx.savingsPlanId);
      if (existing) {
        existing.amount += toNumber(tx.amount);
        existing.runKey = existing.runKey ?? parsedRunKey;
        existing.triggerSource =
          existing.triggerSource ?? parsedTriggerSource;
        existing.replayReason = existing.replayReason ?? parsedReplayReason;
      } else {
        byPlan.set(tx.savingsPlanId, {
          amount: toNumber(tx.amount),
          transactionId: tx.id,
          runKey: parsedRunKey,
          triggerSource: parsedTriggerSource,
          replayReason: parsedReplayReason,
        });
      }
    }

    const entries = Array.from(byPlan.entries()).map(([planId, item]) => ({
      savingsPlanId: planId,
      priorityPercent: 0,
      plannedAmount: item.amount,
      appliedAmount: item.amount,
      result: "applied" as const,
      transactionId: item.transactionId,
      allocationRunKey: item.runKey,
      allocationTriggerSource: item.triggerSource,
      allocationReplayReason: item.replayReason,
    }));
    const totalTransferred = entries.reduce((acc, item) => acc + item.appliedAmount, 0);
    const sourceRemainder = Math.max(eligibility.totalCap - eligibility.totalLimit, 0);
    const unallocatedRemainder = Math.max(sourceRemainder - totalTransferred, 0);

    latestRun = {
      month,
      status: "applied",
      sourceRemainder,
      totalTransferred,
      unallocatedRemainder,
      unallocatedReason: toUnallocatedReason({
        status: "applied",
        unallocatedRemainder,
      }),
      transferTransactionType: "transfer_to_saving_plan",
      entries,
    };
  }

  return {
    month,
    totalCap: eligibility.totalCap,
    totalLimit: eligibility.totalLimit,
    isVisible: eligibility.isVisible,
    reason: eligibility.reason,
    latestRun,
  };
};

export const executeSavingsRemainderAllocation = async (
  input: ExecuteSavingsRemainderAllocationInput,
): Promise<SavingsRemainderAllocationRun> => {
  const normalizedMonth = monthStartOf(input.monthStart);
  const month = monthKeyOf(normalizedMonth);
  const runKey = createSavingsRemainderRunKey(input.userId, normalizedMonth);
  const eligibility = await getMonthlyAllocationEligibility(input.userId, normalizedMonth);
  const sourceRemainder = Math.max(eligibility.totalCap - eligibility.totalLimit, 0);

  if (!eligibility.isVisible) {
    return createNoOpAllocationRun({
      month,
      status: "no_op_not_visible",
      sourceRemainder,
    });
  }

  if (sourceRemainder <= 0) {
    return createNoOpAllocationRun({
      month,
      status: "no_op_zero_remainder",
      sourceRemainder,
    });
  }

  const noteTag = buildAutoAllocationNoteTag(month);
  const { start, end } = getMonthRange(normalizedMonth);
  const existingTransactions = await prisma.transaction.findMany({
    where: {
      userId: input.userId,
      type: "transfer_to_saving_plan",
      date: { gte: start, lte: end },
      notes: { contains: noteTag },
    },
    select: {
      id: true,
      amount: true,
      savingsPlanId: true,
      notes: true,
    },
  });

  // Idempotency guard for scheduled queue processing:
  // if month-tagged allocation transactions already exist, return a computed
  // summary instead of writing duplicate transfer rows.
  if (existingTransactions.length > 0 && input.trigger === "scheduled") {
    const entries = existingTransactions
      .filter((tx) => Boolean(tx.savingsPlanId))
      .map((tx) => ({
        savingsPlanId: tx.savingsPlanId as string,
        priorityPercent: 0,
        plannedAmount: toNumber(tx.amount),
        appliedAmount: toNumber(tx.amount),
        result: "applied" as const,
        transactionId: tx.id,
        allocationRunKey: parseAllocationTagValue(tx.notes, ALLOCATION_RUN_KEY_TAG),
        allocationTriggerSource: parseTriggerSource(tx.notes),
        allocationReplayReason: parseAllocationTagValue(tx.notes, ALLOCATION_TRACE_REPLAY_REASON_TAG),
      }));
    const totalTransferred = entries.reduce((acc, item) => acc + item.appliedAmount, 0);
    const unallocatedRemainder = Math.max(sourceRemainder - totalTransferred, 0);

    return {
      month,
      status: "applied",
      sourceRemainder,
      totalTransferred,
      unallocatedRemainder,
      unallocatedReason: toUnallocatedReason({
        status: "applied",
        unallocatedRemainder,
      }),
      transferTransactionType: "transfer_to_saving_plan",
      entries,
    };
  }

  const plans = await prisma.savingsPlan.findMany({
    where: { userId: input.userId },
    select: {
      id: true,
      status: true,
      monthlyContribution: true,
      targetAmount: true,
    },
  });

  if (plans.length === 0) {
    return createNoOpAllocationRun({
      month,
      status: "no_op_no_eligible_plans",
      sourceRemainder,
    });
  }

  const savingsPlanIds = plans.map((plan) => plan.id);
  const txRows = await prisma.transaction.findMany({
    where: {
      userId: input.userId,
      savingsPlanId: { in: savingsPlanIds },
    },
    select: {
      savingsPlanId: true,
      type: true,
      amount: true,
    },
  });

  const savedByPlanId = new Map<string, number>();
  for (const tx of txRows) {
    if (!tx.savingsPlanId) {
      continue;
    }
    const amount = toNumber(tx.amount);
    const signed = tx.type === "expense" || tx.type === "refund" ? -amount : amount;
    savedByPlanId.set(tx.savingsPlanId, (savedByPlanId.get(tx.savingsPlanId) ?? 0) + signed);
  }

  const eligiblePlans = selectEligibleSavingsPlans(
    plans.map((plan) => ({
      id: plan.id,
      status: plan.status,
      monthlyContribution: toNumber(plan.monthlyContribution),
      targetAmount: toNumber(plan.targetAmount),
      savedAmount: Math.max(savedByPlanId.get(plan.id) ?? 0, 0),
    })),
  );

  const monthPrioritySettings = await getSavingsRemainderPrioritySettings(input.userId, normalizedMonth);
  const eligiblePlansWithSettings = applyPrioritySettingsToEligiblePlans(eligiblePlans, monthPrioritySettings);

  if (eligiblePlansWithSettings.length === 0) {
    return createNoOpAllocationRun({
      month,
      status: "no_op_no_eligible_plans",
      sourceRemainder,
    });
  }

  const computed = computeRemainderAllocationEntries(sourceRemainder, eligiblePlansWithSettings);

  if (computed.totalTransferred <= 0) {
    return createNoOpAllocationRun({
      month,
      status: "no_op_no_eligible_plans",
      sourceRemainder,
      entries: computed.entries,
    });
  }

  const wallet = await ensureDefaultWallet(input.userId);
  const transferDate = input.trigger === "scheduled" ? endOfMonthDate(normalizedMonth) : nowDate();

  const created = await prisma.$transaction(async (tx) => {
    const rows: Array<{ savingsPlanId: string; transactionId: string }> = [];

    for (const entry of computed.entries) {
      if (entry.appliedAmount <= 0) {
        continue;
      }

      // We create one auditable transfer per plan allocation entry so
      // month-level history can be reconstructed directly from transactions.
      const createdTx = await tx.transaction.create({
        data: {
          userId: input.userId,
          accountId: wallet.id,
          savingsPlanId: entry.savingsPlanId,
          type: "transfer_to_saving_plan",
          amount: entry.appliedAmount,
          date: transferDate,
          notes: buildAutoAllocationAuditMetadata({
            noteTag,
            runKey,
            month,
            savingsPlanId: entry.savingsPlanId,
            priorityPercent: entry.priorityPercent,
            appliedAmount: entry.appliedAmount,
            triggerSource: input.triggerSource,
            replayReason: input.replayReason,
          }),
        },
        select: { id: true },
      });

      rows.push({
        savingsPlanId: entry.savingsPlanId,
        transactionId: createdTx.id,
      });
    }

    return rows;
  });

  const transactionIdByPlan = new Map(created.map((item) => [item.savingsPlanId, item.transactionId]));
  const entries = computed.entries.map((entry) => ({
    ...entry,
    transactionId: entry.appliedAmount > 0 ? (transactionIdByPlan.get(entry.savingsPlanId) ?? null) : null,
    allocationRunKey: entry.appliedAmount > 0 ? runKey : null,
    allocationTriggerSource: entry.appliedAmount > 0 ? (input.triggerSource ?? null) : null,
    allocationReplayReason: entry.appliedAmount > 0 ? (input.replayReason ?? null) : null,
  }));

  const unallocatedReason = toUnallocatedReason({
    status: "applied",
    unallocatedRemainder: computed.unallocatedRemainder,
  });

  return {
    month,
    status: "applied",
    sourceRemainder,
    totalTransferred: computed.totalTransferred,
    unallocatedRemainder: computed.unallocatedRemainder,
    unallocatedReason,
    transferTransactionType: "transfer_to_saving_plan",
    entries,
  };
};

export const runScheduledMonthEndRemainderAllocation = async (
  referenceDate: Date = nowDate(),
  batchSize = 100,
) => {
  // Cron route delegates to this gate so month-end runs happen only inside
  // allowed windows (end-of-month or first-day catchup).
  const monthStart = resolveProcessingMonthStart(referenceDate);
  if (!monthStart) {
    return {
      processedMonth: null,
      queuedUsers: 0,
      duplicateJobs: 0,
    };
  }
  const enqueued = await enqueueMonthEndAllocationJobs({
    monthStart,
    triggerSource: "cron",
    batchSize,
  });

  return {
    processedMonth: enqueued.month,
    queuedUsers: enqueued.queuedUsers,
    duplicateJobs: enqueued.duplicateJobs,
  };
};
