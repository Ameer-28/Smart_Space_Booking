/**
 * Prisma Seed — Smart Space Booking
 * Jalankan: npx ts-node prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Admin Space
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  let adminUser = await prisma.user.findUnique({
    where: { username: 'admin_moklet' },
    include: { spaceOwner: true },
  });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        username: 'admin_moklet',
        password: adminPassword,
        role: 'admin_space',
        spaceOwner: {
          create: {
            nama_coworking: 'Moklet Hub Coworking Space',
            nama_pemilik: 'Ahmad Bidin, S.Kom',
            telp: '081298765432',
            alamat: 'Jl. Telkom No. 1, Sawojajar, Malang',
            deskripsi: 'Coworking space modern di jantung kota Malang',
          },
        },
      },
      include: { spaceOwner: true },
    });
  }
  console.log(`✅ Admin: ${adminUser.username} | owner_id: ${adminUser.spaceOwner?.id}`);

  const ownerId = adminUser.spaceOwner!.id;

  // 2. Spaces
  const existingSpacesCount = await prisma.space.count({ where: { id_owner: ownerId } });
  if (existingSpacesCount === 0) {
    await prisma.space.createMany({
      data: [
        { nama_space: 'Personal Desk - Flexi 01', harga_per_jam: 20000, tipe: 'desk', kapasitas: 1, deskripsi: 'Meja kerja individual, WiFi 100Mbps, stopkontak, lampu LED, free air mineral', id_owner: ownerId },
        { nama_space: 'Personal Desk - Flexi 02', harga_per_jam: 20000, tipe: 'desk', kapasitas: 1, deskripsi: 'Meja kerja individual, WiFi 100Mbps, monitor 24 inch, stopkontak', id_owner: ownerId },
        { nama_space: 'Meeting Room Alpha', harga_per_jam: 100000, tipe: 'meeting_room', kapasitas: 8, deskripsi: 'Ruang rapat 8 orang, Smart TV 55 inch, whiteboard, AC, soundbar Bluetooth', id_owner: ownerId },
        { nama_space: 'Private Office Suite A', harga_per_jam: 150000, tipe: 'private_office', kapasitas: 4, deskripsi: 'Ruang kantor privat 4 orang, full AC, keamanan 24 jam, akses WiFi dedicated', id_owner: ownerId },
      ],
    });
    console.log('✅ 4 Spaces created');
  } else {
    console.log(`⏭  Spaces already seeded (${existingSpacesCount})`);
  }

  // 3. Diskon
  const existingDiskon = await prisma.diskon.count({ where: { id_owner: ownerId } });
  if (existingDiskon === 0) {
    await prisma.diskon.createMany({
      data: [
        { nama_diskon: 'DISKONHEMAT20', persentase_diskon: 20, tanggal_awal: new Date('2026-01-01'), tanggal_akhir: new Date('2026-12-31T23:59:59'), id_owner: ownerId },
        { nama_diskon: 'UKKPROMO50', persentase_diskon: 50, tanggal_awal: new Date('2026-08-01'), tanggal_akhir: new Date('2026-09-30T23:59:59'), id_owner: ownerId },
      ],
    });
    console.log('✅ 2 Diskons created');
  } else {
    console.log(`⏭  Diskons already seeded (${existingDiskon})`);
  }

  // 4. Member
  const memberPassword = await bcrypt.hash('Secret123!', 10);
  const existingMember = await prisma.user.findUnique({
    where: { username: 'johndoe' },
  });
  if (!existingMember) {
    await prisma.user.create({
      data: {
        username: 'johndoe',
        password: memberPassword,
        role: 'member',
        member: {
          create: {
            nama_member: 'John Doe',
            instansi: 'Universitas Indonesia',
            alamat: 'Jl. Sudirman No. 123, Jakarta Selatan',
            telp: '081234567890',
          },
        },
      },
    });
    console.log('✅ Member: johndoe created');
  } else {
    console.log('⏭  Member johndoe already exists');
  }

  console.log('\n🎉 Seed selesai!');
  console.log('\n📋 Akun Demo:');
  console.log('  Admin      → username: admin_moklet | password: Admin123!');
  console.log('  Member     → username: johndoe | password: Secret123!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
