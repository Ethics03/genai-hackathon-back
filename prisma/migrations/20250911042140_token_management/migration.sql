-- CreateTable
CREATE TABLE "public"."GmailToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessTokenEncrypted" TEXT NOT NULL,
    "accessTokenIv" VARCHAR(32) NOT NULL,
    "accessTokenTag" VARCHAR(32) NOT NULL,
    "refreshTokenEncrypted" TEXT,
    "refreshTokenIv" VARCHAR(32),
    "refreshTokenTag" VARCHAR(32),
    "tokenType" TEXT NOT NULL DEFAULT 'Bearer',
    "scope" TEXT,
    "expiresAt" TIMESTAMP(3),
    "tokenHash" VARCHAR(64) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GmailToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GmailToken_userId_idx" ON "public"."GmailToken"("userId");

-- CreateIndex
CREATE INDEX "GmailToken_tokenHash_idx" ON "public"."GmailToken"("tokenHash");

-- CreateIndex
CREATE INDEX "GmailToken_isActive_idx" ON "public"."GmailToken"("isActive");

-- CreateIndex
CREATE INDEX "GmailToken_lastUsedAt_idx" ON "public"."GmailToken"("lastUsedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GmailToken_userId_key" ON "public"."GmailToken"("userId");

-- AddForeignKey
ALTER TABLE "public"."GmailToken" ADD CONSTRAINT "GmailToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
