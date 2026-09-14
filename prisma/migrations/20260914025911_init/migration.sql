-- CreateEnum
CREATE TYPE "Role" AS ENUM ('member', 'admin_space');

-- CreateEnum
CREATE TYPE "SpaceTipe" AS ENUM ('desk', 'meeting_room', 'private_office');

-- CreateEnum
CREATE TYPE "ReservasiStatus" AS ENUM ('belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan');

-- CreateTable
CREATE TABLE "app_makers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "app_key" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_makers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'member',
    "maker_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" SERIAL NOT NULL,
    "nama_member" VARCHAR(100) NOT NULL,
    "instansi" VARCHAR(100) NOT NULL,
    "alamat" TEXT NOT NULL,
    "telp" VARCHAR(20) NOT NULL,
    "foto" VARCHAR(255),
    "id_user" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_owners" (
    "id" SERIAL NOT NULL,
    "nama_coworking" VARCHAR(100) NOT NULL,
    "nama_pemilik" VARCHAR(100) NOT NULL,
    "telp" VARCHAR(20) NOT NULL,
    "alamat" TEXT,
    "deskripsi" TEXT,
    "id_user" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" SERIAL NOT NULL,
    "nama_space" VARCHAR(100) NOT NULL,
    "harga_per_jam" DOUBLE PRECISION NOT NULL,
    "tipe" "SpaceTipe" NOT NULL,
    "kapasitas" INTEGER NOT NULL,
    "foto" VARCHAR(255),
    "deskripsi" TEXT,
    "id_owner" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diskons" (
    "id" SERIAL NOT NULL,
    "nama_diskon" VARCHAR(100) NOT NULL,
    "persentase_diskon" DOUBLE PRECISION NOT NULL,
    "tanggal_awal" TIMESTAMP(3) NOT NULL,
    "tanggal_akhir" TIMESTAMP(3) NOT NULL,
    "id_owner" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diskons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservasis" (
    "id" SERIAL NOT NULL,
    "kode_booking" VARCHAR(50) NOT NULL,
    "tanggal_reservasi" DATE NOT NULL,
    "jam_mulai" VARCHAR(5) NOT NULL,
    "jam_selesai" VARCHAR(5) NOT NULL,
    "durasi_jam" INTEGER NOT NULL,
    "id_owner" INTEGER NOT NULL,
    "id_member" INTEGER NOT NULL,
    "status" "ReservasiStatus" NOT NULL DEFAULT 'belum_dikonfirm',
    "check_in_time" TIMESTAMP(3),
    "check_out_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservasis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_reservasis" (
    "id" SERIAL NOT NULL,
    "id_reservasi" INTEGER NOT NULL,
    "id_space" INTEGER NOT NULL,
    "id_diskon" INTEGER,
    "harga_per_jam" DOUBLE PRECISION NOT NULL,
    "total_harga_awal" DOUBLE PRECISION NOT NULL,
    "potongan_diskon" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_bayar" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detail_reservasis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_makers_username_key" ON "app_makers"("username");

-- CreateIndex
CREATE UNIQUE INDEX "app_makers_email_key" ON "app_makers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "app_makers_app_key_key" ON "app_makers"("app_key");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_maker_id_key" ON "users"("username", "maker_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_id_user_key" ON "members"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "space_owners_id_user_key" ON "space_owners"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "reservasis_kode_booking_key" ON "reservasis"("kode_booking");

-- CreateIndex
CREATE UNIQUE INDEX "detail_reservasis_id_reservasi_key" ON "detail_reservasis"("id_reservasi");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_maker_id_fkey" FOREIGN KEY ("maker_id") REFERENCES "app_makers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_owners" ADD CONSTRAINT "space_owners_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_id_owner_fkey" FOREIGN KEY ("id_owner") REFERENCES "space_owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservasis" ADD CONSTRAINT "reservasis_id_owner_fkey" FOREIGN KEY ("id_owner") REFERENCES "space_owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservasis" ADD CONSTRAINT "reservasis_id_member_fkey" FOREIGN KEY ("id_member") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_reservasis" ADD CONSTRAINT "detail_reservasis_id_reservasi_fkey" FOREIGN KEY ("id_reservasi") REFERENCES "reservasis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_reservasis" ADD CONSTRAINT "detail_reservasis_id_space_fkey" FOREIGN KEY ("id_space") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_reservasis" ADD CONSTRAINT "detail_reservasis_id_diskon_fkey" FOREIGN KEY ("id_diskon") REFERENCES "diskons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
