import cron, { type ScheduledTask } from "node-cron";
import { DateTime } from "luxon";
import { prisma } from "@/lib/db";
import { enqueueAutoTransferJob, startAutoTransferWorker } from "@/lib/savings-auto-transfer-queue";
import { resolveUserTimezone } from "@/lib/savings-auto-transfer";

let schedulerSingleton: ScheduledTask | null = null;

export const isSchedulerWindowUtc = (value: Date) => {
  const utcDay = DateTime.fromJSDate(value, { zone: "utc" }).day;
  return utcDay >= 27 || utcDay === 1;
};

const buildMonthStartToEvaluate = (timezone: string, now = new Date()) => {
  const localNow = DateTime.fromJSDate(now, { zone: "utc" }).setZone(timezone);
  if (localNow.day !== 1) {
    return null;
  }

  return localNow.startOf("month").minus({ months: 1 });
};

export const enqueueDueAutoTransferJobs = async (now = new Date()) => {
  if (!isSchedulerWindowUtc(now)) {
    return { enqueued: 0, checked: 0 };
  }

  const users = await prisma.user.findMany({
    where: {
      autoTransferRule: {
        is: {
          enabled: true,
        },
      },
    },
    select: {
      id: true,
      settings: {
        select: {
          timezone: true,
        },
      },
    },
  });

  let enqueued = 0;
  for (const user of users) {
    const timezone = resolveUserTimezone(user.settings?.timezone);
    const monthStart = buildMonthStartToEvaluate(timezone, now);
    if (!monthStart) {
      continue;
    }

    const job = await enqueueAutoTransferJob({
      userId: user.id,
      monthStartISO: monthStart.toISODate() || "",
      timezone,
    });

    if (job) {
      enqueued += 1;
    }
  }

  console.info("[auto-transfer][scheduler] enqueue run", {
    checked: users.length,
    enqueued,
  });

  return { enqueued, checked: users.length };
};

export const startAutoTransferScheduler = () => {
  startAutoTransferWorker();

  if (schedulerSingleton) {
    return schedulerSingleton;
  }

  schedulerSingleton = cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        await enqueueDueAutoTransferJobs(new Date());
      } catch (error) {
        console.error("[auto-transfer][scheduler] execution failed", error);
      }
    },
    {
      timezone: "UTC",
    },
  );

  console.info("[auto-transfer][scheduler] started");
  return schedulerSingleton;
};
