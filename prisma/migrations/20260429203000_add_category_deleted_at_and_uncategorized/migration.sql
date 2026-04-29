-- Add soft-delete support for categories.
ALTER TABLE "Category"
ADD COLUMN "deletedAt" DATETIME;

CREATE INDEX "Category_userId_deletedAt_idx"
ON "Category"("userId", "deletedAt");

-- Backfill one active "Uncategorized" category per user when missing.
INSERT INTO "Category" ("id", "userId", "name", "icon", "createdAt", "deletedAt")
SELECT
  'uncat_' || lower(hex(randomblob(12))),
  u."id",
  'Uncategorized',
  'category',
  CURRENT_TIMESTAMP,
  NULL
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1
  FROM "Category" c
  WHERE c."userId" = u."id"
    AND c."name" = 'Uncategorized'
    AND c."deletedAt" IS NULL
);
