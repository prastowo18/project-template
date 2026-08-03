# Deployment

Project mendukung deployment standar Next.js seperti Vercel dan standalone deployment untuk container atau self-hosted server.

## Pre-deployment checklist

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm verify:all
pnpm knip
pnpm knip:production
```

Pastikan:

- Git working tree bersih
- Seluruh migration sudah di-commit
- Secret production berbeda dari development dan CI
- Database backup atau restore plan tersedia
- `BETTER_AUTH_URL` menggunakan domain production
- `SITE_INDEXING_ENABLED` ditentukan secara eksplisit
- Tidak ada credential di source atau Git history

## Environment production

```env
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="https://app.example.com"
SITE_INDEXING_ENABLED="false"
PUBLIC_REGISTRATION_ENABLED="false"
SKIP_ENV_VALIDATION="false"
LOG_LEVEL="info"
NEXT_TELEMETRY_DISABLED="1"
```

Untuk standalone deployment:

```env
NEXT_OUTPUT_MODE="standalone"
```

Jangan menggunakan `SKIP_ENV_VALIDATION="true"` pada runtime production normal.

## Database migration

Gunakan:

```bash
pnpm db:deploy
```

Jalankan sebagai release job sebelum aplikasi baru menerima traffic. Jangan memakai `prisma migrate dev` di production.

Urutan:

1. Pastikan backup atau restore point.
2. Install dependency.
3. Generate Prisma Client.
4. Jalankan migration.
5. Build.
6. Deploy.
7. Smoke test.

## Seed production

```bash
pnpm db:seed
pnpm seed:verify
```

Jalankan saat database baru, catalog berubah, atau superadmin awal perlu dibuat.

## Vercel

Install command:

```bash
pnpm install --frozen-lockfile
```

Build command:

```bash
pnpm build
```

Jangan set `NEXT_OUTPUT_MODE=standalone` untuk deployment Vercel standar.

Masukkan seluruh environment variable melalui Project Settings. Gunakan database dan secret terpisah untuk preview.

Migration harus dijalankan melalui release process terkontrol, bukan build command.

## Standalone deployment

```env
NEXT_OUTPUT_MODE="standalone"
```

```bash
pnpm build
```

Hasil utama berada di `.next/standalone`.

Sertakan:

```text
.next/standalone
.next/static
public
```

Runtime:

```bash
node .next/standalone/server.js
```

Jalankan container sebagai non-root user. Migration tetap dilakukan oleh release job terpisah.

## Health check

```text
GET /api/health
```

Gunakan untuk load balancer, readiness, uptime monitoring, dan post-deployment smoke test.

## Structured log

Field penting:

- `timestamp`
- `level`
- `event`
- `service`
- `environment`
- `requestId`

Gunakan `x-request-id` untuk korelasi. Jangan mencatat password, token, cookie, atau database credential.

## Indexing

Aplikasi internal:

```env
SITE_INDEXING_ENABLED="false"
```

Aplikasi publik:

```env
SITE_INDEXING_ENABLED="true"
```

Periksa `/robots.txt`, `/sitemap.xml`, dan `/manifest.webmanifest`.

## Security checks

Pastikan response memiliki Content Security Policy, Referrer Policy, X-Content-Type-Options, X-Frame-Options, Permissions Policy, dan HSTS pada production HTTPS.

Authentication rate limiting menggunakan tabel database `RateLimit`. Pada skala tinggi, tambahkan rate limiting di CDN, WAF, load balancer, atau reverse proxy.

## Post-deployment smoke test

1. `/api/health` sukses.
2. `/login` dapat dibuka.
3. Dashboard meminta session.
4. User tanpa permission diarahkan ke `/forbidden`.
5. Halaman admin hanya dapat diakses role berizin.
6. Audit log mencatat aktivitas administratif.
7. Header `x-request-id` tersedia.
8. `robots.txt` sesuai kebijakan.
9. Structured log tidak membocorkan secret.

## Rollback

Rollback kode tidak selalu berarti rollback database. Gunakan forward migration.

1. Hentikan rollout.
2. Pertahankan log dan request ID.
3. Periksa kompatibilitas schema.
4. Rollback aplikasi hanya jika schema kompatibel.
5. Buat migration korektif bila perlu.
6. Jangan menghapus migration yang sudah diterapkan.
