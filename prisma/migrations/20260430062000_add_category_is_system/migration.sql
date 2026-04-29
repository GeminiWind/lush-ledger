ALTER TABLE "Category"
ADD COLUMN "isSystem" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Category"
SET "isSystem" = true
WHERE "name" = 'Uncategorized'
  AND "deletedAt" IS NULL;

CREATE INDEX "Category_userId_isSystem_deletedAt_idx"
ON "Category"("userId", "isSystem", "deletedAt");
