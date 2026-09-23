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
| Role | Username | Password |
|---|---|---|
| Admin Space | admin_moklet | Admin123! |
| Member | johndoe | Secret123! |

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

## Autentikasi

### User (Member / Admin Space)
1. Login: `POST /api/auth/login` → dapat `access_token`
2. Sertakan header `Authorization: Bearer <access_token>`

---

## Daftar Endpoint

### Root
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/` | Publik |
| GET | `/health` | Publik |

### Auth
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register/member` | Publik |
| POST | `/api/auth/register/admin-space` | Publik |
| POST | `/api/auth/login` | Publik |
| GET | `/api/auth/profile` | Bearer |

### Spaces (Katalog & Ketersediaan)
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/spaces/types` | Publik |
| GET | `/api/spaces/availability?id_space=&tanggal=&jam_mulai=&durasi_jam=` | Publik |
| GET | `/api/spaces?tipe=&search=` | Publik |
| GET | `/api/spaces/:id` | Publik |

### Diskon & Promo
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/diskon/active` | Publik |
| POST | `/api/diskon/check` | Publik |
| GET | `/api/diskon/:id` | Publik |

### Reservasi (Member)
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/reservasi` | Bearer Member |
| GET | `/api/reservasi/my` | Bearer Member |
| GET | `/api/reservasi/my/history?month=&year=` | Bearer Member |
| GET | `/api/reservasi/:id/e-ticket` | Bearer |
| GET | `/api/reservasi/:id` | Bearer |
| PATCH | `/api/reservasi/:id/cancel` | Bearer Member |

### Admin Panel
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/admin/profile` | Bearer Admin |
| PUT | `/api/admin/profile` | Bearer Admin |
| GET | `/api/admin/members?search=` | Bearer Admin |
| POST | `/api/admin/members` | Bearer Admin |
| GET | `/api/admin/members/:id` | Bearer Admin |
| PUT | `/api/admin/members/:id` | Bearer Admin |
| DELETE | `/api/admin/members/:id` | Bearer Admin |
| GET | `/api/admin/spaces` | Bearer Admin |
| POST | `/api/admin/spaces` | Bearer Admin |
| GET | `/api/admin/spaces/:id` | Bearer Admin |
| PUT | `/api/admin/spaces/:id` | Bearer Admin |
| DELETE | `/api/admin/spaces/:id` | Bearer Admin |
| GET | `/api/admin/diskon` | Bearer Admin |
| POST | `/api/admin/diskon` | Bearer Admin |
| GET | `/api/admin/diskon/:id` | Bearer Admin |
| PUT | `/api/admin/diskon/:id` | Bearer Admin |
| DELETE | `/api/admin/diskon/:id` | Bearer Admin |
| GET | `/api/admin/reservasi?month=&year=&status=&id_space=&tanggal=` | Bearer Admin |
| PATCH | `/api/admin/reservasi/:id/status` | Bearer Admin |
| POST | `/api/admin/reservasi/:id/check-in` | Bearer Admin |
| POST | `/api/admin/reservasi/:id/check-out` | Bearer Admin |
| GET | `/api/admin/reports/monthly?month=&year=` | Bearer Admin |
| GET | `/api/admin/reports/income?month=&year=` | Bearer Admin |

### Upload Media
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/upload/image` | Publik |
| POST | `/api/upload/spaces` | Publik |
| POST | `/api/upload/members` | Publik |

---

## Struktur Folder
```
smart-space-booking/
├── src/
│   ├── admin/          # Panel Admin (CRUD member, space, diskon, reservasi, laporan)
│   ├── auth/           # Autentikasi (register/login Member & Admin Space)
│   ├── common/         # Guards, decorators, filters, interceptors
│   ├── diskon/         # Katalog diskon publik
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

- Password di-hash menggunakan **bcrypt** (salt rounds: 10) — berlaku untuk register member, admin space, dan update password oleh admin
- JWT token untuk autentikasi user (`JWT_SECRET`)
- Role-based access: endpoint admin hanya bisa diakses role `admin_space`, endpoint member hanya role `member`
