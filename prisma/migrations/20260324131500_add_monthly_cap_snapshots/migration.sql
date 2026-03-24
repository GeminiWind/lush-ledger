ALTER TABLE "UserMonthlyCap" ADD COLUMN "totalLimit" DECIMAL NOT NULL DEFAULT 0;
ALTER TABLE "UserMonthlyCap" ADD COLUMN "totalCap" DECIMAL NOT NULL DEFAULT 0;

CREATE TABLE "CategoryMonthlyLimit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "monthStart" DATETIME NOT NULL,
  "limit" DECIMAL NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CategoryMonthlyLimit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CategoryMonthlyLimit_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CategoryMonthlyLimit_userId_categoryId_monthStart_key" ON "CategoryMonthlyLimit"("userId", "categoryId", "monthStart");
CREATE INDEX "CategoryMonthlyLimit_userId_monthStart_idx" ON "CategoryMonthlyLimit"("userId", "monthStart");
CREATE INDEX "CategoryMonthlyLimit_categoryId_idx" ON "CategoryMonthlyLimit"("categoryId");
