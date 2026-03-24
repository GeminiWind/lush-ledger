-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT,
    "savingsPlanId" TEXT,
    "recurringTemplateId" TEXT,
    "recurringInterval" TEXT,
    "recurringDayOfMonth" INTEGER,
    "recurringMonth" INTEGER,
    "recurringStartDate" DATETIME,
    "recurringEndDate" DATETIME,
    "isRecurringTemplate" BOOLEAN NOT NULL DEFAULT false,
    "lastRecurringRunAt" DATETIME,
    "amount" DECIMAL NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_savingsPlanId_fkey" FOREIGN KEY ("savingsPlanId") REFERENCES "SavingsPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("accountId", "amount", "categoryId", "createdAt", "date", "id", "notes", "recurringEndDate", "savingsPlanId", "type", "userId") SELECT "accountId", "amount", "categoryId", "createdAt", "date", "id", "notes", "recurringEndDate", "savingsPlanId", "type", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_accountId_idx" ON "Transaction"("accountId");
CREATE INDEX "Transaction_categoryId_idx" ON "Transaction"("categoryId");
CREATE INDEX "Transaction_savingsPlanId_idx" ON "Transaction"("savingsPlanId");
CREATE INDEX "Transaction_recurringTemplateId_idx" ON "Transaction"("recurringTemplateId");
CREATE INDEX "Transaction_isRecurringTemplate_idx" ON "Transaction"("isRecurringTemplate");
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");
CREATE UNIQUE INDEX "Transaction_recurringTemplateId_date_key" ON "Transaction"("recurringTemplateId", "date");
CREATE TABLE "new_UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserSettings" ("currency", "id", "updatedAt", "userId") SELECT "currency", "id", "updatedAt", "userId" FROM "UserSettings";
DROP TABLE "UserSettings";
ALTER TABLE "new_UserSettings" RENAME TO "UserSettings";
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
