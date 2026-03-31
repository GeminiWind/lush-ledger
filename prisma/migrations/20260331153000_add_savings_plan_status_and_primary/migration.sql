-- Add status + primary marker for savings plan selection UX
ALTER TABLE "SavingsPlan"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';

ALTER TABLE "SavingsPlan"
ADD COLUMN "isPrimary" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "SavingsPlan_userId_status_idx" ON "SavingsPlan"("userId", "status");
CREATE INDEX "SavingsPlan_userId_isPrimary_idx" ON "SavingsPlan"("userId", "isPrimary");
