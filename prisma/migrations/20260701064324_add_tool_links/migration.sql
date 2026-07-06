-- CreateTable
CREATE TABLE "ToolCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolLink" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "desc" TEXT,
    "emoji" TEXT DEFAULT '🔗',
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ToolLink_categoryId_idx" ON "ToolLink"("categoryId");

-- AddForeignKey
ALTER TABLE "ToolLink" ADD CONSTRAINT "ToolLink_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ToolCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
