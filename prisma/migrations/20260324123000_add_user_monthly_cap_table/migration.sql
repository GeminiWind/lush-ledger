CREATE TABLE "UserMonthlyCap" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "monthStart" DATETIME NOT NULL,
  "unallocatedBackup" DECIMAL NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "UserMonthlyCap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "UserMonthlyCap_userId_monthStart_key" ON "UserMonthlyCap"("userId", "monthStart");
CREATE INDEX "UserMonthlyCap_userId_idx" ON "UserMonthlyCap"("userId");
CREATE INDEX "UserMonthlyCap_monthStart_idx" ON "UserMonthlyCap"("monthStart");
