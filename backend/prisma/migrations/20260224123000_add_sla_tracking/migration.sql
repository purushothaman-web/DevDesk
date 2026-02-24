-- Add per-organization SLA configuration
ALTER TABLE "Organization"
ADD COLUMN "slaLowHours" INTEGER NOT NULL DEFAULT 72,
ADD COLUMN "slaMediumHours" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN "slaHighHours" INTEGER NOT NULL DEFAULT 4;

-- Add per-ticket SLA tracking fields
ALTER TABLE "Ticket"
ADD COLUMN "slaDueAt" TIMESTAMP(3),
ADD COLUMN "slaBreachNotifiedAt" TIMESTAMP(3);
