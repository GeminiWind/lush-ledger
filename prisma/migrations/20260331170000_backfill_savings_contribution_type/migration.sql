-- Backfill old savings contributions to the new explicit transfer type.
UPDATE "Transaction"
SET "type" = 'transfer_to_saving_plan'
WHERE "savingsPlanId" IS NOT NULL
  AND "type" IN ('income', 'transfer_to_saving_pan');
