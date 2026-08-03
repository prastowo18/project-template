# Security Policy

## Supported version

Repository template ini mempertahankan dukungan keamanan pada versi terbaru di branch utama.

Project turunan harus menentukan kebijakan versinya sendiri.

## Reporting a vulnerability

Jangan membuka detail kerentanan yang belum diperbaiki melalui public issue.

Laporkan secara privat melalui GitHub Private Vulnerability Reporting bila fitur tersebut diaktifkan pada repository.

Sertakan ringkasan masalah, komponen dan versi terdampak, langkah reproduksi minimal, dampak, bukti konsep yang aman, dan saran mitigasi bila tersedia.

Jangan menyertakan kredensial, token, data pengguna, atau data production nyata.

## Security baseline

Sebelum release:

```bash
pnpm release:check
```

Pemeriksaan mencakup dependency vulnerability audit, dead-code audit, schema validation, authorization dan seed validation, formatting, lint, typecheck, unit test, production build, dan Playwright E2E.

## Dependency policy

Dependency baru harus memiliki tujuan jelas, berasal dari sumber tepercaya, berlisensi sesuai, tidak memperkenalkan kerentanan high atau critical, tidak menduplikasi dependency yang sudah tersedia, dan lulus Dependency Review pada pull request.

## Secret handling

- Jangan commit `.env`.
- Gunakan secret berbeda per environment.
- Rotasi secret yang pernah terekspos.
- Jangan mencatat password, token, cookie, atau credential.
- Jangan memakai database production pada development atau CI.
