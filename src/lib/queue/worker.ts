import { Worker, type Job } from "bullmq";
import { fromISODate, startOfMonthDate } from "@/lib/date";
import { executeSavingsRemainderAllocation } from "@/lib/savings-remainder-allocation";
import {
  getMonthEndAllocationQueueEvents,
  MONTH_END_ALLOCATION_USER_JOB,
  MONTH_END_ALLOCATION_USER_QUEUE,
  type MonthEndAllocationUserJobData,
} from "@/lib/queue/month-end-allocation-queue";
import { getQueueConnection } from "@/lib/queue/connection";

const getConcurrency = () => {
  const raw = Number(process.env.MONTH_END_ALLOCATION_WORKER_CONCURRENCY ?? 5);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 5;
};

const parseMonthStart = (month: string) => {
  const parsed = fromISODate(`${month}-01`);
  if (!parsed) {
    throw new Error(`Invalid month format: ${month}`);
  }

  return startOfMonthDate(parsed);
};

export const createMonthEndAllocationWorker = () => {
  return new Worker<MonthEndAllocationUserJobData>(
    MONTH_END_ALLOCATION_USER_QUEUE,
    async (job: Job<MonthEndAllocationUserJobData>) => {
      if (job.name !== MONTH_END_ALLOCATION_USER_JOB) {
        return { ignored: true };
      }

      const monthStart = parseMonthStart(job.data.month);
      const result = await executeSavingsRemainderAllocation({
        userId: job.data.userId,
        monthStart,
        trigger: "scheduled",
        triggerSource: job.data.triggerSource,
        replayReason: job.data.replayReason,
      });

      return {
        status: result.status,
        transferred: result.totalTransferred,
        triggerSource: job.data.triggerSource,
      };
    },
    {
      connection: getQueueConnection(),
      concurrency: getConcurrency(),
    },
  );
};

export const startMonthEndAllocationWorker = async () => {
  const worker = createMonthEndAllocationWorker();
  const events = getMonthEndAllocationQueueEvents();
  await events.waitUntilReady();

  return {
    worker,
    events,
  };
};

if (process.argv[1]?.endsWith("worker.ts")) {
  void startMonthEndAllocationWorker();
}
