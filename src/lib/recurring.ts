import { prisma } from "@/lib/db";

const dayLimitOfMonth = (year: number, monthIndex: number) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

const occurrenceWithAnchor = (
  year: number,
  monthIndex: number,
  dayOfMonth: number,
  anchorDate: Date,
) => {
  const clampedDay = Math.min(dayOfMonth, dayLimitOfMonth(year, monthIndex));
  return new Date(
    year,
    monthIndex,
    clampedDay,
    anchorDate.getHours(),
    anchorDate.getMinutes(),
    anchorDate.getSeconds(),
    anchorDate.getMilliseconds(),
  );
};

const nextOccurrenceDate = (
  interval: string,
  currentRunDate: Date,
  anchorDate: Date,
  dayOfMonth: number,
  recurringMonth?: number | null,
) => {
  if (interval === "yearly") {
    const monthIndex = recurringMonth ? recurringMonth - 1 : anchorDate.getMonth();
    return occurrenceWithAnchor(currentRunDate.getFullYear() + 1, monthIndex, dayOfMonth, anchorDate);
  }

  const nextMonth = new Date(currentRunDate.getFullYear(), currentRunDate.getMonth() + 1, 1);
  return occurrenceWithAnchor(nextMonth.getFullYear(), nextMonth.getMonth(), dayOfMonth, anchorDate);
};

export const materializeRecurringTransactions = async (userId: string, now = new Date()) => {
  const templates = await prisma.transaction.findMany({
    where: {
      userId,
      isRecurringTemplate: true,
      recurringInterval: { in: ["monthly", "yearly"] },
    },
    orderBy: { createdAt: "asc" },
  });

  let generatedCount = 0;

  for (const template of templates) {
    if (!template.recurringInterval) {
      continue;
    }

    const anchorDate = template.recurringStartDate ?? template.date;
    const dayOfMonth = template.recurringDayOfMonth ?? anchorDate.getDate();
    const baselineRun = template.lastRecurringRunAt ?? template.date;
    const recurringEndDate = template.recurringEndDate;

    let lastProcessedDate = baselineRun;
    let candidate = nextOccurrenceDate(
      template.recurringInterval,
      baselineRun,
      anchorDate,
      dayOfMonth,
      template.recurringMonth,
    );

    while (candidate <= now && (!recurringEndDate || candidate <= recurringEndDate)) {
      const existing = await prisma.transaction.findUnique({
        where: {
          recurringTemplateId_date: {
            recurringTemplateId: template.id,
            date: candidate,
          },
        },
      });

      if (!existing) {
        await prisma.transaction.create({
          data: {
            userId: template.userId,
            accountId: template.accountId,
            categoryId: template.categoryId,
            savingsPlanId: template.savingsPlanId,
            recurringTemplateId: template.id,
            type: template.type,
            amount: template.amount,
            date: candidate,
            notes: template.notes,
            isRecurringTemplate: false,
          },
        });
        generatedCount += 1;
      }

      lastProcessedDate = candidate;
      candidate = nextOccurrenceDate(
        template.recurringInterval,
        candidate,
        anchorDate,
        dayOfMonth,
        template.recurringMonth,
      );
    }

    if (lastProcessedDate.getTime() > baselineRun.getTime()) {
      await prisma.transaction.update({
        where: { id: template.id },
        data: { lastRecurringRunAt: lastProcessedDate },
      });
    }
  }

  return generatedCount;
};
