-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "logIndex" INTEGER NOT NULL DEFAULT 0,
    "client" TEXT,
    "project" TEXT,
    "category" TEXT,
    "invoice" TEXT,
    "period" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Disclosure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "label" TEXT,
    "periodStart" TEXT NOT NULL,
    "periodEnd" TEXT NOT NULL,
    "fields" TEXT NOT NULL,
    "txHashes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Tag_address_idx" ON "Tag"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_address_txHash_logIndex_key" ON "Tag"("address", "txHash", "logIndex");

-- CreateIndex
CREATE INDEX "Disclosure_address_idx" ON "Disclosure"("address");
