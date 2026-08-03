# Setup Lokal

## 1. Persyaratan

Pastikan tersedia:

- Git
- Node.js `>=22.18.0 <23`
- pnpm `11.17.0`
- PostgreSQL atau Neon PostgreSQL

Periksa versi:

```bash
node --version
pnpm --version
git --version
```

Aktifkan pnpm melalui Corepack bila diperlukan:

```bash
corepack enable
corepack prepare pnpm@11.17.0 --activate
```

## 2. Clone dan install

```bash
git clone <repository-url>
cd nextjs-standard-template
pnpm install
```

Pada CI dan deployment gunakan:

```bash
pnpm install --frozen-lockfile
```

## 3. Siapkan environment

```bash
cp .env.example .env
```

Isi minimal:

```env
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
SITE_INDEXING_ENABLED="false"
SKIP_ENV_VALIDATION="false"
LOG_LEVEL="debug"
```

Gunakan pooled connection string untuk `DATABASE_URL` dan direct connection string untuk `DIRECT_DATABASE_URL`.

Buat secret:

```bash
openssl rand -base64 32
```

Validasi:

```bash
pnpm env:check
```

## 4. Siapkan database

```bash
pnpm db:generate
pnpm db:deploy
pnpm db:status
pnpm db:check
pnpm db:tables
```

Generated Prisma Client disimpan di `src/generated/prisma` dan tidak boleh diedit manual.

## 5. Seed role dan superadmin

Untuk bootstrap superadmin, isi:

```env
INITIAL_SUPERADMIN_NAME="Super Administrator"
INITIAL_SUPERADMIN_EMAIL="admin@example.com"
INITIAL_SUPERADMIN_PASSWORD="gunakan-password-kuat"
```

Kemudian:

```bash
pnpm db:seed
pnpm seed:verify
```

Setelah bootstrap berhasil, kredensial bootstrap dapat dikosongkan dari environment deployment.

## 6. Jalankan aplikasi

```bash
pnpm dev
```

Buka `http://localhost:3000`.

## 7. Verifikasi instalasi

```bash
pnpm verify
pnpm test:e2e
pnpm knip
pnpm knip:production
```

## 8. Mengubah database schema

Ubah `prisma/schema.prisma`, lalu:

```bash
pnpm db:format
pnpm db:validate
pnpm db:migrate -- --name nama_perubahan
pnpm db:generate
pnpm verify
```

Commit schema dan migration dalam commit yang sama. Jangan mengubah migration yang sudah diterapkan pada shared atau production database.

## 9. Mengubah Better Auth schema

```bash
pnpm auth:info
pnpm auth:generate
pnpm auth:schema-check
```

Generated comparison schema berada di `prisma/auth.generated.prisma`. Review sebelum mengubah schema utama.

## 10. Mengubah permission dan role

- Permission: `src/authorization/permissions.ts`
- Role: `src/authorization/roles.ts`

Setelah perubahan:

```bash
pnpm authz:check
pnpm seed:check
pnpm db:seed
pnpm seed:verify
pnpm verify
```

## 11. Unit test

```bash
pnpm test:run
pnpm test:watch
```

Unit test berada di `tests/unit`. Default Vitest environment adalah `jsdom`.

Untuk server-only test:

```ts
// @vitest-environment node
```

## 12. E2E test

```bash
pnpm test:e2e:install
pnpm test:e2e
```

Mode visual:

```bash
pnpm test:e2e:headed
pnpm test:e2e:ui
```

Playwright menjalankan server pada `http://127.0.0.1:3100`.

## 13. Commit

```bash
git add <file-yang-relevan>
pnpm commit
```

Commit diperiksa oleh Husky, lint-staged, dan Commitlint.

## Troubleshooting

### Environment gagal

```bash
pnpm env:check
```

### Database tidak tersambung

```bash
pnpm db:check
pnpm db:status
```

### Prisma Client tidak sinkron

```bash
pnpm db:generate
pnpm typecheck
```

### Port digunakan proses lain

```bash
pnpm exec next dev --port 3001
```

Sesuaikan `BETTER_AUTH_URL`.

### Browser Playwright belum tersedia

```bash
pnpm test:e2e:install
```

### Knip melaporkan export

Pastikan export memang diperlukan. Jangan menambahkan pengecualian global hanya untuk menyembunyikan dead code.
