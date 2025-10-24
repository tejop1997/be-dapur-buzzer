# Dapur Buzzer Back-end

Layanan back-end menggunakan Nuxt 4 (Nitro) + MongoDB (Mongoose). Menyediakan autentikasi (JWT) dan API CRUD untuk slider banner. Dioptimalkan untuk prototipe dengan penanganan gambar Base64.

## Stack

- **Nuxt 4** (Nitro server, route ada di `server/api`)
- **MongoDB + Mongoose** (plugin di `server/plugins/mongoose.ts`)
- **JWT (jose)** untuk autentikasi (`server/utils/jwt.ts`)

## Prasyarat

- Node.js 18+
- Instance MongoDB aktif

## Variabel Lingkungan

Salin `.env.example` menjadi `.env`, lalu isi nilainya:

- **MONGODB_URI**: Connection string MongoDB (tanpa nama DB, contoh `mongodb+srv://user:pass@cluster`)
- **MONGODB_DB**: Nama database (opsional; jika kosong, pakai default dari URI)
- **JWT_SECRET**: Secret untuk sign/verify JWT

## Instalasi

```bash
npm install
# Rekomendasi untuk TypeScript (global Node seperti process/Buffer)
npm i -D @types/node
```

## Menjalankan (Development)

```bash
npm run dev
```

- URL dev default: `http://localhost:3000` (atau sesuai output terminal)
- Nitro mengikuti env `PORT` jika diset

## Koneksi Database

`server/plugins/mongoose.ts` memakai `MONGODB_URI` dan opsional `MONGODB_DB`. Log sukses/gagal koneksi akan tampil saat server start.

## Autentikasi

- Register: `POST /api/auth/register` → buat user (`email`, `password`, opsional `role`)
- Login: `POST /api/auth/login` → mengembalikan `token` dan set cookie `token` (httpOnly)
- Middleware: `server/middleware/auth.ts` mengisi `event.context.user` jika JWT valid (dari header `Authorization: Bearer <token>` atau cookie `token`)
- Endpoint khusus admin butuh `event.context.user.role === "admin"`

## CORS

Diatur di `nuxt.config.ts` untuk semua route `/api/**`:

- `cors: true`
- `access-control-allow-headers: Authorization, Content-Type, X-Requested-With`

Jika memakai cookie/kredensial lintas origin, tambahkan (opsional):

- `access-control-allow-origin: http://localhost:5173` (sesuaikan dengan origin frontend)
- `access-control-allow-credentials: true`

## Slider Banner API

Model: `server/models/slider.ts`

- Field:
  - `title: string` (wajib)
  - `imageData: Buffer` (wajib, hasil decode Base64)
  - `imageType: string` (wajib, contoh `image/png`)
  - `link?: string`
  - `active: boolean` (default true)

Endpoint:

- `GET /api/sliders`
  - Query: `active=true|false`, `search=<title>`, `page`, `limit`
  - Response mengembalikan `image` sebagai data URL (`data:<mime>;base64,<...>`)

- `POST /api/sliders` (khusus admin)
  - Body (dua format didukung):
    - Data URL: `{ title, image: "data:image/png;base64,<...>", link?, active? }`
    - Base64 mentah: `{ title, image: "<base64>", imageType: "image/png", link?, active? }`
  - Batas ukuran: ~2MB

- `GET /api/sliders/:id`
  - Mengembalikan `image` sebagai data URL

- `PUT /api/sliders/:id` (khusus admin)
  - Partial update. Format gambar sama seperti POST.

- `DELETE /api/sliders/:id` (khusus admin)

## Contoh Curl

Login dan ambil token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"<password>"}'
```

Buat slider (pakai data URL):

```bash
curl -X POST http://localhost:3000/api/sliders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Banner A",
    "image":"data:image/png;base64,iVBORw0KGgoAAA...",
    "active": true
  }'
```

List slider:

```bash
curl "http://localhost:3000/api/sliders?active=true&page=1&limit=20"
```

## Produksi

Build:

```bash
npm run build
```

Preview lokal:

```bash
npm run preview
```

Deploy mengikuti dokumentasi Nuxt/Nitro (preset saat ini: `vercel`).

## Pemecahan Masalah

- 403 "Admin only": pastikan Anda mengirim header `Authorization: Bearer <token>` atau cookie `token`, login sebagai admin, dan `JWT_SECRET` terpasang. Login ulang jika baru mengubah role di DB.
- TypeScript tidak menemukan `process`/`Buffer`: pasang `@types/node` dan pastikan `tsconfig.json` berisi `"types": ["node"]`.
