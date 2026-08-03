# Next.js Standard Template

Template aplikasi Next.js untuk project internal maupun production yang membutuhkan authentication, permission-based authorization, PostgreSQL, audit log, observability, testing, dan standar kualitas kode sejak awal.

## Fitur utama

- Next.js App Router
- React dan TypeScript strict mode
- pnpm
- Prisma ORM dan Neon PostgreSQL
- Better Auth
- Authentication email dan password
- Role dan permission authorization
- Administrasi pengguna dan role
- Audit log
- Database-backed authentication rate limiting
- Structured JSON logging
- Request correlation ID
- Health check endpoint
- Security headers
- Metadata, manifest, robots, dan sitemap
- Vitest dan Playwright
- ESLint dan Prettier
- Husky, lint-staged, Commitlint, dan Commitizen
- Knip dependency dan dead-code audit
- GitHub Actions CI
- Vercel dan standalone deployment

## Persyaratan

- Node.js `>=22.18.0 <23`
- pnpm `11.17.0`
- PostgreSQL atau Neon PostgreSQL
- Git

Aktifkan versi pnpm project:

```bash
corepack enable
corepack prepare pnpm@11.17.0 --activate
```

## Setup cepat

```bash
pnpm install
cp .env.example .env
```

Isi environment variable di `.env`, kemudian jalankan:

```bash
pnpm env:check
pnpm db:generate
pnpm db:deploy
pnpm db:seed
pnpm dev
```

Aplikasi development tersedia di `http://localhost:3000`.

Panduan lengkap tersedia di [docs/SETUP.md](docs/SETUP.md).

## Environment variables

| Variable                      | Wajib | Keterangan                                        |
| ----------------------------- | ----- | ------------------------------------------------- |
| `DATABASE_URL`                | Ya    | Pooled PostgreSQL connection string untuk runtime |
| `DIRECT_DATABASE_URL`         | Ya    | Direct connection string untuk migration          |
| `BETTER_AUTH_SECRET`          | Ya    | Secret Better Auth minimal 32 karakter            |
| `BETTER_AUTH_URL`             | Ya    | URL canonical aplikasi                            |
| `SITE_INDEXING_ENABLED`       | Tidak | Search engine indexing, default `false`           |
| `PUBLIC_REGISTRATION_ENABLED` | Tidak | Registrasi akun publik, default `false`           |
| `SKIP_ENV_VALIDATION`         | Tidak | Lewati validasi env pada kondisi build tertentu   |
| `INITIAL_SUPERADMIN_NAME`     | Tidak | Nama superadmin awal                              |
| `INITIAL_SUPERADMIN_EMAIL`    | Tidak | Email superadmin awal                             |
| `INITIAL_SUPERADMIN_PASSWORD` | Tidak | Password superadmin awal                          |
| `LOG_LEVEL`                   | Tidak | `debug`, `info`, `warn`, atau `error`             |
| `NEXT_OUTPUT_MODE`            | Tidak | Isi `standalone` untuk self-hosted deployment     |
| `NEXT_TELEMETRY_DISABLED`     | Tidak | Nonaktifkan telemetry Next.js                     |

Jangan commit file `.env` atau kredensial database.

## Perintah utama

### Development

```bash
pnpm dev
pnpm build
pnpm start
```

### Kualitas kode

```bash
pnpm format
pnpm format:check
pnpm lint
pnpm lint:fix
pnpm typecheck
```

### Testing

```bash
pnpm test:run
pnpm test:watch
pnpm test:e2e
pnpm test:e2e:headed
pnpm test:e2e:ui
pnpm test:e2e:report
```

### Verifikasi

```bash
pnpm verify
pnpm verify:all
```

`pnpm verify` menjalankan formatting check, lint, typecheck, unit test, dan production build. `pnpm verify:all` menambahkan Playwright E2E.

### Database

```bash
pnpm db:generate
pnpm db:validate
pnpm db:format
pnpm db:migrate
pnpm db:deploy
pnpm db:status
pnpm db:seed
pnpm db:studio
pnpm db:check
pnpm db:tables
pnpm seed:verify
```

### Authentication dan authorization

```bash
pnpm auth:info
pnpm auth:generate
pnpm auth:schema-check
pnpm authz:check
pnpm seed:check
```

### Security dan dependency audit

```bash
pnpm security:audit
pnpm security:check
pnpm release:check
pnpm knip
pnpm knip:production
```

### Commit

```bash
pnpm commit
```

Commit mengikuti Conventional Commits dan diperiksa oleh Commitlint.

## Struktur project

```text
src/
├── admin/                 Domain logic administrasi
├── app/                   Next.js App Router
│   ├── (auth)/            Login dan registrasi
│   ├── (dashboard)/       Dashboard dan halaman admin
│   └── api/               Route handlers
├── audit/                 Audit event dan sanitization
├── authorization/         Permission dan role catalog
├── components/            Reusable UI components
├── config/                Metadata dan branding
├── env/                   Environment validation
├── features/              Feature modules
├── generated/             Generated Prisma Client
├── lib/                   Shared client utilities
├── observability/         Logger dan request correlation
├── security/              Security configuration
└── server/                Server-only services
```

```text
prisma/
├── migrations/            Versioned database migrations
├── schema.prisma          Database schema
└── seed.ts                Role, permission, dan superadmin seed
```

```text
tests/
├── e2e/                   Playwright tests
├── unit/                  Vitest tests
└── setup.ts               Unit-test setup
```

## Authorization

Akses administratif menggunakan permission, bukan pemeriksaan nama role secara langsung.

- Permission catalog: `src/authorization/permissions.ts`
- Role catalog: `src/authorization/roles.ts`

Setelah mengubah role atau permission:

```bash
pnpm authz:check
pnpm seed:check
pnpm db:seed
pnpm seed:verify
```

## Audit log

Authentication event, perubahan role, perubahan permission, dan aktivitas administratif penting dicatat di tabel `AuditLog`.

Jangan memasukkan password, token, cookie, secret, atau kredensial ke audit metadata.

## Observability

Setiap request menerima correlation header `x-request-id`.

Structured log menggunakan JSON dan menyertakan timestamp, level, event, environment, service, dan request ID.

Health endpoint:

```text
GET /api/health
```

## Search engine indexing

Indexing dinonaktifkan secara default:

```env
SITE_INDEXING_ENABLED="false"
```

Aktifkan hanya untuk aplikasi yang memiliki halaman publik:

```env
SITE_INDEXING_ENABLED="true"
```

## Continuous integration

GitHub Actions menjalankan frozen-lockfile installation, Prisma Client generation, formatting check, ESLint, typecheck, unit test, production build, Playwright E2E, dan upload laporan Playwright.

Workflow: `.github/workflows/ci.yml`

## Dokumentasi

- [Setup lokal](docs/SETUP.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Menggunakan repository sebagai template](docs/TEMPLATE-USAGE.md)
- [Release baseline](docs/RELEASE.md)
- [Security policy](SECURITY.md)

## Keamanan

- Jangan commit `.env`.
- Gunakan secret berbeda untuk setiap environment.
- Jangan memakai database production untuk local atau CI.
- Jalankan migration sebelum aplikasi baru menerima traffic.
- Pastikan `BETTER_AUTH_URL` sesuai domain production.
- Gunakan `SITE_INDEXING_ENABLED=false` untuk aplikasi internal.
- Jangan mencatat data sensitif dalam audit log atau structured log.
