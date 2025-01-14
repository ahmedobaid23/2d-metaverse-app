/*
  Warnings:

  - You are about to drop the `spaceElements` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "spaceElements" DROP CONSTRAINT "spaceElements_elementId_fkey";

-- DropForeignKey
ALTER TABLE "spaceElements" DROP CONSTRAINT "spaceElements_spaceId_fkey";

-- DropTable
DROP TABLE "spaceElements";

-- CreateTable
CREATE TABLE "SpaceElements" (
    "id" TEXT NOT NULL,
    "elementId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,

    CONSTRAINT "SpaceElements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpaceElements_id_key" ON "SpaceElements"("id");

-- AddForeignKey
ALTER TABLE "SpaceElements" ADD CONSTRAINT "SpaceElements_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceElements" ADD CONSTRAINT "SpaceElements_elementId_fkey" FOREIGN KEY ("elementId") REFERENCES "Element"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
