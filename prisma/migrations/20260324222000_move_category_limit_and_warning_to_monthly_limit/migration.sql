ALTER TABLE "CategoryMonthlyLimit" ADD COLUMN "warningEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "CategoryMonthlyLimit" ADD COLUMN "warnAt" INTEGER NOT NULL DEFAULT 80;

UPDATE "CategoryMonthlyLimit"
SET
  "limit" = COALESCE((
    SELECT c."monthlyLimit"
    FROM "Category" c
    WHERE c."id" = "CategoryMonthlyLimit"."categoryId"
  ), "limit"),
  "warningEnabled" = COALESCE((
    SELECT c."warningEnabled"
    FROM "Category" c
    WHERE c."id" = "CategoryMonthlyLimit"."categoryId"
  ), "warningEnabled"),
  "warnAt" = COALESCE((
    SELECT c."warnAt"
    FROM "Category" c
    WHERE c."id" = "CategoryMonthlyLimit"."categoryId"
  ), "warnAt");

ALTER TABLE "Category" DROP COLUMN "monthlyLimit";
ALTER TABLE "Category" DROP COLUMN "warningEnabled";
ALTER TABLE "Category" DROP COLUMN "warnAt";
