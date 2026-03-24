ALTER TABLE "Account" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Account"
SET "isDefault" = true
WHERE "id" IN (
  SELECT a."id"
  FROM "Account" a
  WHERE a."id" = (
    SELECT a2."id"
    FROM "Account" a2
    WHERE a2."userId" = a."userId"
    ORDER BY a2."createdAt" ASC, a2."id" ASC
    LIMIT 1
  )
);

CREATE UNIQUE INDEX "Account_userId_isDefault_key"
ON "Account"("userId")
WHERE "isDefault" = true;
