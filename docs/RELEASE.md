# Release Baseline

## 1. Periksa branch dan working tree

```bash
git branch --show-current
git status --short
```

Working tree harus bersih.

## 2. Sinkronkan dependency

```bash
pnpm install --frozen-lockfile
pnpm db:generate
```

## 3. Jalankan release gate

```bash
pnpm release:check
```

Release tidak boleh dilanjutkan ketika salah satu pemeriksaan gagal.

## 4. Periksa database

```bash
pnpm db:status
pnpm db:validate
```

Pastikan migration telah direview dan di-commit.

## 5. Periksa environment production

Wajib tersedia:

```text
DATABASE_URL
DIRECT_DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
PUBLIC_REGISTRATION_ENABLED
SITE_INDEXING_ENABLED
LOG_LEVEL
```

Gunakan `PUBLIC_REGISTRATION_ENABLED="false"` untuk aplikasi internal atau admin provisioning.

## 6. Terapkan migration

```bash
pnpm db:deploy
```

Jalankan melalui release job sebelum traffic berpindah ke versi baru.

## 7. Deploy dan smoke test

Periksa `/api/health`, `/login`, kebijakan `/register`, authentication, permission guard, audit log, `x-request-id`, security headers, `robots.txt`, dan structured log.

## 8. Tag release

Setelah deployment tervalidasi:

```bash
git tag -a v0.1.0 -m "release: v0.1.0"
git push origin v0.1.0
```

Sesuaikan versi berdasarkan perubahan.

## 9. Rollback

Hentikan rollout, simpan log dan request ID, periksa kompatibilitas schema, rollback aplikasi hanya bila schema kompatibel, dan gunakan forward migration untuk koreksi database.
