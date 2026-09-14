# Smart Space Booking — Backend API
**UKK RPL 2026/2027 | SMK Telkom Malang | Paket B — Kategori Backend**

RESTful API Sistem Reservasi Coworking Space & Workstation  
Stack: **NestJS + Prisma ORM + PostgreSQL**

---

## Cara Menjalankan Aplikasi

### Prasyarat
- Node.js >= 18
- PostgreSQL (running, buat database baru)
- npm >= 9

### Langkah 1 — Install dependencies
```bash
cd smart-space-booking
npm install
```

### Langkah 2 — Konfigurasi environment
```bash
copy .env.example .env
```
Edit `.env`, sesuaikan nilai ini:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:PORT/NAMA_DATABASE"
JWT_SECRET="isi_bebas_minimal_32_karakter"
JWT_MAKER_SECRET="isi_bebas_minimal_32_karakter"
PORT=3000
BASE_URL="http://localhost:3000"
```

### Langkah 3 — Jalankan migrasi database
```bash
npx prisma migrate dev --name init
```
Ini akan membuat semua tabel secara otomatis.

### Langkah 4 — (Opsional) Isi data demo
```bash
npx ts-node prisma/seed.ts
```
Akan membuat akun demo siap pakai:
| Role | Username | Password | App Key |
|---|---|---|---|
| App Maker | demo_maker | Password123! | mk_demo_ukk_2026_paket_b |
| Admin Space | admin_moklet | Admin123! | — |
| Member | johndoe | Secret123! | — |

### Langkah 5 — Jalankan server

**Development (auto-reload):**
```bash
npm run start:dev
```

**Production:**
```bash
npm run build
npm run start:prod
```

---

## Base URL & Port

| | URL |
|---|---|
| API Base | `http://localhost:3000` |
| Swagger UI | `http://localhost:3000/docs` |
| Swagger JSON | `http://localhost:3000/docs-json` |

---

## Autentikasi & Multi-Tenancy

### App Maker (isolasi data per siswa)
1. Daftar: `POST /api/maker/register` → dapat `app_key`
2. Sertakan header `x-maker-key: <app_key>` di **setiap request**

### User (Member / Admin Space)
1. Login: `POST /api/auth/login` → dapat `access_token`
2. Sertakan header `Authorization: Bearer <access_token>`

---

## Daftar 50 Endpoint

### Root
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/` | Publik |
| GET | `/health` | Publik |

### App Maker
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/maker/register` | Publik |
| POST | `/api/maker/login` | Publik |
| GET | `/api/maker/me` | Bearer Maker |
| GET | `/api/maker/stats` | Bearer Maker + x-maker-key |
| GET | `/api/maker/list` | Publik |

### Auth
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register/member` | x-maker-key |
| POST | `/api/auth/register/admin-space` | x-maker-key |
| POST | `/api/auth/login` | x-maker-key |
| GET | `/api/auth/profile` | Bearer + x-maker-key |

### Spaces (Publik/User)
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/spaces/types` | x-maker-key |
| GET | `/api/spaces/availability?id_space=&tanggal=&jam_mulai=&durasi_jam=` | x-maker-key |
| GET | `/api/spaces?tipe=&search=` | x-maker-key |
| GET | `/api/spaces/:id` | x-maker-key |

### Diskon (Publik/User)
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/diskon/active` | x-maker-key |
| POST | `/api/diskon/check` | x-maker-key |
| GET | `/api/diskon/:id` | x-maker-key |

### Reservasi (Member)
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/reservasi` | Bearer Member + x-maker-key |
| GET | `/api/reservasi/my` | Bearer Member + x-maker-key |
| GET | `/api/reservasi/my/history?month=&year=` | Bearer Member + x-maker-key |
| GET | `/api/reservasi/:id/e-ticket` | Bearer + x-maker-key |
| GET | `/api/reservasi/:id` | Bearer + x-maker-key |
| PATCH | `/api/reservasi/:id/cancel` | Bearer Member + x-maker-key |

### Admin Panel
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/admin/profile` | Bearer Admin + x-maker-key |
| PUT | `/api/admin/profile` | Bearer Admin + x-maker-key |
| GET | `/api/admin/members?search=` | Bearer Admin + x-maker-key |
| POST | `/api/admin/members` | Bearer Admin + x-maker-key |
| GET | `/api/admin/members/:id` | Bearer Admin + x-maker-key |
| PUT | `/api/admin/members/:id` | Bearer Admin + x-maker-key |
| DELETE | `/api/admin/members/:id` | Bearer Admin + x-maker-key |
| GET | `/api/admin/spaces` | Bearer Admin + x-maker-key |
| POST | `/api/admin/spaces` | Bearer Admin + x-maker-key |
| GET | `/api/admin/spaces/:id` | Bearer Admin + x-maker-key |
| PUT | `/api/admin/spaces/:id` | Bearer Admin + x-maker-key |
| DELETE | `/api/admin/spaces/:id` | Bearer Admin + x-maker-key |
| GET | `/api/admin/diskon` | Bearer Admin + x-maker-key |
| POST | `/api/admin/diskon` | Bearer Admin + x-maker-key |
| GET | `/api/admin/diskon/:id` | Bearer Admin + x-maker-key |
| PUT | `/api/admin/diskon/:id` | Bearer Admin + x-maker-key |
| DELETE | `/api/admin/diskon/:id` | Bearer Admin + x-maker-key |
| GET | `/api/admin/reservasi?month=&year=&status=&id_space=&tanggal=` | Bearer Admin + x-maker-key |
| PATCH | `/api/admin/reservasi/:id/status` | Bearer Admin + x-maker-key |
| POST | `/api/admin/reservasi/:id/check-in` | Bearer Admin + x-maker-key |
| POST | `/api/admin/reservasi/:id/check-out` | Bearer Admin + x-maker-key |
| GET | `/api/admin/reports/monthly?month=&year=` | Bearer Admin + x-maker-key |
| GET | `/api/admin/reports/income?month=&year=` | Bearer Admin + x-maker-key |

### Upload Media
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/upload/image` | x-maker-key |
| POST | `/api/upload/spaces` | x-maker-key |
| POST | `/api/upload/members` | x-maker-key |

---

## Struktur Folder
```
smart-space-booking/
├── src/
│   ├── admin/          # Panel Admin (CRUD member, space, diskon, reservasi, laporan)
│   ├── auth/           # Autentikasi (register/login Member & Admin Space)
│   ├── common/         # Guards, decorators, filters, interceptors
│   ├── diskon/         # Katalog diskon publik
│   ├── maker/          # Multi-tenancy App Maker
│   ├── prisma/         # Prisma service & module
│   ├── reservasi/      # Reservasi member (buat, e-ticket, histori, cancel)
│   ├── spaces/         # Katalog space publik
│   ├── upload/         # Upload media (foto space, member, umum)
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma         # Definisi skema database
│   ├── migrations/           # SQL migration files (berkas wajib)
│   └── seed.ts               # Data demo awal
├── docs/
│   ├── swagger.json          # Export Swagger OpenAPI (berkas wajib)
│   ├── postman_collection.json  # Postman collection (berkas wajib)
│   └── test_api.ps1          # Script test otomatis
├── uploads/                  # Folder media yang diupload
├── .env.example              # Template konfigurasi
├── package.json
└── README.md                 # Dokumen ini (berkas wajib)
```

---

## Berkas Wajib Pengumpulan

| # | Berkas | Lokasi | Status |
|---|---|---|---|
| 1 | Source code lengkap | Seluruh folder `smart-space-booking/` | ✅ |
| 2 | Script migrasi database | `prisma/migrations/` | ✅ |
| 3 | Dokumentasi API — Swagger | `docs/swagger.json` + `http://localhost:3000/docs` | ✅ |
| 3 | Dokumentasi API — Postman | `docs/postman_collection.json` | ✅ |
| 4 | Cara menjalankan aplikasi | `README.md` (dokumen ini) | ✅ |

---

## Keamanan

- Password di-hash menggunakan **bcrypt** (salt rounds: 10) — berlaku untuk register member, admin space, app maker, dan update password oleh admin
- JWT token terpisah untuk App Maker (`JWT_MAKER_SECRET`) dan User (`JWT_SECRET`)
- Isolasi data multi-tenancy: semua query difilter berdasarkan `maker_id` via `x-maker-key`
- Role-based access: endpoint admin hanya bisa diakses role `admin_space`, endpoint member hanya role `member`
