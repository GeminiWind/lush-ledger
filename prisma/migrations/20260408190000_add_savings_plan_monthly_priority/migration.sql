-- Add month-level savings plan priority settings for remainder allocation
CREATE TABLE "SavingsPlanMonthlyPriority" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "savingsPlanId" TEXT NOT NULL,
  "monthStart" DATETIME NOT NULL,
  "priorityPercent" DECIMAL NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "SavingsPlanMonthlyPriority_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "SavingsPlanMonthlyPriority_savingsPlanId_fkey"
    FOREIGN KEY ("savingsPlanId") REFERENCES "SavingsPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "SavingsPlanMonthlyPriority_userId_savingsPlanId_monthStart_key"
  ON "SavingsPlanMonthlyPriority"("userId", "savingsPlanId", "monthStart");

CREATE INDEX "SavingsPlanMonthlyPriority_userId_monthStart_idx"
  ON "SavingsPlanMonthlyPriority"("userId", "monthStart");

CREATE INDEX "SavingsPlanMonthlyPriority_savingsPlanId_idx"
  ON "SavingsPlanMonthlyPriority"("savingsPlanId");
