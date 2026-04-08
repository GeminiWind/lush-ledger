import { Queue, QueueEvents, type JobsOptions } from "bullmq";
import { getQueueConnection } from "@/lib/queue/connection";

export const MONTH_END_ALLOCATION_USER_QUEUE = "month-end-allocation-user";
export const MONTH_END_ALLOCATION_USER_JOB = "run-user-allocation";

export type MonthEndAllocationTriggerSource = "cron" | "replay";

export type MonthEndAllocationUserJobData = {
  userId: string;
  month: string;
  triggerSource: MonthEndAllocationTriggerSource;
  replayReason?: string;
};

const defaultJobOptions: JobsOptions = {
  attempts: 5,
  backoff: {
    type: "exponential",
    delay: 1_000,
  },
  removeOnComplete: 500,
  removeOnFail: 1_000,
};

type QueueGlobals = {
  monthEndAllocationUserQueue?: Queue<MonthEndAllocationUserJobData>;
  monthEndAllocationQueueEvents?: QueueEvents;
};

const globalForMonthEndQueue = globalThis as unknown as QueueGlobals;

export const toMonthEndAllocationJobId = (userId: string, month: string) => `allocation:${month}:${userId}`;

export const getMonthEndAllocationUserQueue = () => {
  if (!globalForMonthEndQueue.monthEndAllocationUserQueue) {
    globalForMonthEndQueue.monthEndAllocationUserQueue = new Queue<MonthEndAllocationUserJobData>(
      MONTH_END_ALLOCATION_USER_QUEUE,
      {
        connection: getQueueConnection(),
        defaultJobOptions,
      },
    );
  }

  return globalForMonthEndQueue.monthEndAllocationUserQueue;
};

export const getMonthEndAllocationQueueEvents = () => {
  if (!globalForMonthEndQueue.monthEndAllocationQueueEvents) {
    globalForMonthEndQueue.monthEndAllocationQueueEvents = new QueueEvents(MONTH_END_ALLOCATION_USER_QUEUE, {
      connection: getQueueConnection(),
    });
  }

  return globalForMonthEndQueue.monthEndAllocationQueueEvents;
};
