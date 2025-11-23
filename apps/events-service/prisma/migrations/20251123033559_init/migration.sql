-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" JSONB,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_userId_type_createdAt_idx" ON "Event"("userId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "Event_userId_entityType_createdAt_idx" ON "Event"("userId", "entityType", "createdAt");

-- CreateIndex
CREATE INDEX "Event_userId_entityId_createdAt_idx" ON "Event"("userId", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "Event_userId_createdAt_idx" ON "Event"("userId", "createdAt");
