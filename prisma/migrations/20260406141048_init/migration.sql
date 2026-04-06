-- CreateTable
CREATE TABLE "Davetli" (
    "id" SERIAL NOT NULL,
    "kod" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "il" TEXT,
    "ilce" TEXT,
    "email" TEXT,
    "katilimVar" BOOLEAN NOT NULL DEFAULT false,
    "katilimTarihi" TIMESTAMP(3),
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Davetli_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Davetli_kod_key" ON "Davetli"("kod");
