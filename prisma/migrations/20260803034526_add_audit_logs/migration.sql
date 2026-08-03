-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "outcome" TEXT NOT NULL DEFAULT 'success',
    "actorUserId" TEXT,
    "actorEmail" TEXT,
    "subjectType" TEXT,
    "subjectId" TEXT,
    "scopeType" TEXT,
    "scopeId" TEXT,
    "requestId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorUserId_createdAt_idx" ON "audit_logs"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_subjectType_subjectId_createdAt_idx" ON "audit_logs"("subjectType", "subjectId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_scopeType_scopeId_createdAt_idx" ON "audit_logs"("scopeType", "scopeId", "createdAt");
