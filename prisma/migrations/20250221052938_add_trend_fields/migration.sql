-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "subNiche" TEXT,
    "contentType" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "stylePreferences" TEXT NOT NULL,
    "blocks" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "versionHistory" TEXT NOT NULL,
    "parentId" TEXT,
    "videoFormat" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT NOT NULL,
    "isBase" BOOLEAN NOT NULL DEFAULT false,
    "thumbnail" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "trendScore" REAL NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Template_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Template" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Template" ("blocks", "category", "contentType", "createdAt", "description", "id", "isBase", "isPublished", "name", "niche", "parameters", "parentId", "stylePreferences", "subNiche", "tags", "targetAudience", "thumbnail", "updatedAt", "userId", "version", "versionHistory", "videoFormat") SELECT "blocks", "category", "contentType", "createdAt", "description", "id", "isBase", "isPublished", "name", "niche", "parameters", "parentId", "stylePreferences", "subNiche", "tags", "targetAudience", "thumbnail", "updatedAt", "userId", "version", "versionHistory", "videoFormat" FROM "Template";
DROP TABLE "Template";
ALTER TABLE "new_Template" RENAME TO "Template";
CREATE INDEX "Template_userId_idx" ON "Template"("userId");
CREATE INDEX "Template_isPublished_idx" ON "Template"("isPublished");
CREATE INDEX "Template_category_idx" ON "Template"("category");
CREATE INDEX "Template_niche_idx" ON "Template"("niche");
CREATE INDEX "Template_contentType_idx" ON "Template"("contentType");
CREATE INDEX "Template_trendScore_idx" ON "Template"("trendScore");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
