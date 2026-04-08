import { prisma } from "@/lib/db";
import { monthKeyOf, monthStartOf } from "@/lib/monthly-cap";
import {
  getMonthEndAllocationUserQueue,
  MONTH_END_ALLOCATION_USER_JOB,
  toMonthEndAllocationJobId,
  type MonthEndAllocationTriggerSource,
} from "@/lib/queue/month-end-allocation-queue";

const isDuplicateJobIdError = (error: unknown) => {
  return error instanceof Error && error.message.includes("JobId");
};

type EnqueueMonthInput = {
  monthStart: Date;
  triggerSource: MonthEndAllocationTriggerSource;
  batchSize?: number;
};

export const enqueueMonthEndAllocationJobs = async (input: EnqueueMonthInput) => {
  const monthStart = monthStartOf(input.monthStart);
  const month = monthKeyOf(monthStart);
  const batchSize = Math.max(1, Math.floor(input.batchSize ?? 100));

  const queue = getMonthEndAllocationUserQueue();

  let lastUserId: string | null = null;
  let queuedUsers = 0;
  let duplicateJobs = 0;

  while (true) {
    let users: Array<{ id: string }>;
    if (lastUserId) {
      users = await prisma.user.findMany({
        select: { id: true },
        take: batchSize,
        skip: 1,
        cursor: { id: lastUserId },
        orderBy: { id: "asc" },
      });
    } else {
      users = await prisma.user.findMany({
        select: { id: true },
        take: batchSize,
        orderBy: { id: "asc" },
      });
    }

    if (users.length === 0) {
      break;
    }

    for (const user of users) {
      try {
        await queue.add(
          MONTH_END_ALLOCATION_USER_JOB,
          {
            userId: user.id,
            month,
            triggerSource: input.triggerSource,
          },
          {
            jobId: toMonthEndAllocationJobId(user.id, month),
          },
        );
        queuedUsers += 1;
      } catch (error) {
        if (isDuplicateJobIdError(error)) {
          duplicateJobs += 1;
          continue;
        }

        throw error;
      }
    }

    lastUserId = users[users.length - 1]?.id ?? null;
  }

  return {
    month,
    queuedUsers,
    duplicateJobs,
  };
};

type ReplayInput = {
  monthStart: Date;
  userId: string;
  reason?: string;
};

export const enqueueUserMonthReplayJob = async (input: ReplayInput) => {
  const monthStart = monthStartOf(input.monthStart);
  const month = monthKeyOf(monthStart);

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true },
  });

  if (!user) {
    return {
      userId: input.userId,
      month,
      enqueued: false,
      reason: "user_not_found",
    };
  }

  const queue = getMonthEndAllocationUserQueue();

  try {
    await queue.add(
      MONTH_END_ALLOCATION_USER_JOB,
      {
        userId: user.id,
        month,
        triggerSource: "replay",
        replayReason: input.reason,
      },
      {
        jobId: toMonthEndAllocationJobId(user.id, month),
      },
    );

    return {
      userId: user.id,
      month,
      enqueued: true,
    };
  } catch (error) {
    if (isDuplicateJobIdError(error)) {
      return {
        userId: user.id,
        month,
        enqueued: false,
        reason: "duplicate_job",
      };
    }

    throw error;
  }
};
