# Menggunakan Repository sebagai Template

## Opsi 1: GitHub Template Repository

Aktifkan **Template repository** pada GitHub repository settings.

Untuk project baru:

1. Pilih **Use this template**.
2. Pilih **Create a new repository**.
3. Tentukan owner dan nama repository.
4. Clone repository baru.
5. Ikuti checklist penyesuaian.

Metode ini tidak membawa commit history template.

## Opsi 2: Clone manual

```bash
git clone <template-repository-url> nama-project
cd nama-project
rm -rf .git
git init
git add .
git commit -m "chore: initialize project from standard template"
```

## 1. Ganti identitas package

Ubah nama di `package.json` menjadi lowercase dengan tanda hubung.

## 2. Ganti identitas aplikasi

Ubah `src/config/application.ts`:

- `name`
- `shortName`
- `description`
- `language`
- `locale`
- `themeColor`
- `backgroundColor`

## 3. Ganti branding

Periksa:

```text
public/app-icon.svg
src/app/apple-icon.tsx
src/config/social-image.tsx
```

Pastikan icon terbaca pada ukuran kecil dan social image tetap 1200 × 630.

## 4. Buat database baru

Gunakan database terpisah untuk setiap project:

```env
DATABASE_URL="..."
DIRECT_DATABASE_URL="..."
```

Pertahankan baseline migration yang ada.

## 5. Buat auth secret baru

```bash
openssl rand -base64 32
```

Jangan menyalin secret dari project lain.

## 6. Tentukan URL dan indexing

```env
BETTER_AUTH_URL="http://localhost:3000"
SITE_INDEXING_ENABLED="false"
```

Untuk production gunakan domain canonical.

## 7. Sesuaikan permission

Ubah `src/authorization/permissions.ts`.

Gunakan pola `resource.action`, misalnya:

```text
invoice.read
invoice.create
invoice.update
invoice.delete
```

## 8. Sesuaikan role

Ubah `src/authorization/roles.ts`.

Gunakan permission guard, bukan pemeriksaan nama role langsung.

```bash
pnpm authz:check
pnpm seed:check
pnpm db:seed
pnpm seed:verify
```

## 9. Sesuaikan audit event

Audit catalog berada di `src/audit`.

Catat perubahan data penting, hak akses, authentication security events, dan aktivitas administratif. Jangan mencatat secret.

## 10. Review authentication

Periksa:

```text
src/app/(auth)/login
src/app/(auth)/register
src/features/auth
```

Untuk aplikasi internal, pertimbangkan menghapus registrasi publik atau menggantinya dengan invitation/admin provisioning.

## 11. Tambahkan feature

Struktur yang disarankan:

```text
src/features/<feature-name>
src/server/<feature-name>
src/app/(dashboard)/<feature-name>
tests/unit/<feature-name>.test.ts
tests/e2e/<feature-name>.spec.ts
```

## 12. Tambahkan Prisma model

```bash
pnpm db:format
pnpm db:validate
pnpm db:migrate -- --name add_feature_name
pnpm db:generate
pnpm verify
```

Commit schema dan migration bersama.

## 13. Perbarui dokumentasi

Cari seluruh penyebutan nama template:

```bash
grep -R \
  --line-number \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  "Next.js Standard Template" \
  .
```

Perbarui README, docs, metadata, branding, test expectation, dan package name.

## 14. Validasi project baru

```bash
pnpm install
pnpm env:check
pnpm db:generate
pnpm db:deploy
pnpm db:seed
pnpm authz:check
pnpm seed:check
pnpm seed:verify
pnpm knip
pnpm knip:production
pnpm verify:all
```

## Checklist

- [ ] Package name diganti
- [ ] Application metadata diganti
- [ ] Icon dan social image diganti
- [ ] Database baru tersedia
- [ ] Auth secret baru tersedia
- [ ] Canonical URL ditentukan
- [ ] Indexing policy ditentukan
- [ ] Role dan permission direview
- [ ] Superadmin bootstrap dijalankan
- [ ] README disesuaikan
- [ ] CI berhasil
- [ ] Unit dan E2E test berhasil
- [ ] Knip audit bersih
- [ ] Production build berhasil
- [ ] Tidak ada `.env` atau secret dalam Git
