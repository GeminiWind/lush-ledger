-- Add timezone configuration to user settings for month-end scheduling.
ALTER TABLE "UserSettings"
ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- Store one auto-transfer rule per user.
CREATE TABLE "AutoTransferRule" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "allocations" TEXT NOT NULL,
  "allocationTotalPercentage" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "AutoTransferRule_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AutoTransferRule_userId_key" ON "AutoTransferRule"("userId");
CREATE INDEX "AutoTransferRule_userId_idx" ON "AutoTransferRule"("userId");

-- Store one month-end execution snapshot per user and month.
CREATE TABLE "AutoTransferRun" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "monthStart" DATETIME NOT NULL,
  "timezone" TEXT NOT NULL,
  "remainderAmount" DECIMAL NOT NULL DEFAULT 0,
  "allocationTotalPercentage" INTEGER NOT NULL DEFAULT 0,
  "planResults" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "skipReason" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AutoTransferRun_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AutoTransferRun_userId_monthStart_key" ON "AutoTransferRun"("userId", "monthStart");
CREATE INDEX "AutoTransferRun_userId_createdAt_idx" ON "AutoTransferRun"("userId", "createdAt");
CREATE INDEX "AutoTransferRun_monthStart_idx" ON "AutoTransferRun"("monthStart");
