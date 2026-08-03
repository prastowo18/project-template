/** @type {import("cz-git").UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],

  rules: {
    "header-max-length": [2, "always", 100],
    "subject-empty": [2, "never"],
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
  },

  prompt: {
    useEmoji: false,
    allowCustomScopes: true,
    allowEmptyScopes: true,

    types: [
      {
        value: "feat",
        name: "feat:     Menambahkan fitur baru",
      },
      {
        value: "fix",
        name: "fix:      Memperbaiki bug",
      },
      {
        value: "docs",
        name: "docs:     Mengubah dokumentasi",
      },
      {
        value: "style",
        name: "style:    Mengubah format tanpa mengubah logika",
      },
      {
        value: "refactor",
        name: "refactor: Mengubah struktur kode tanpa fitur baru",
      },
      {
        value: "perf",
        name: "perf:     Meningkatkan performa",
      },
      {
        value: "test",
        name: "test:     Menambah atau memperbaiki test",
      },
      {
        value: "build",
        name: "build:    Mengubah build atau dependency",
      },
      {
        value: "ci",
        name: "ci:       Mengubah konfigurasi CI/CD",
      },
      {
        value: "chore",
        name: "chore:    Pekerjaan pemeliharaan lainnya",
      },
      {
        value: "revert",
        name: "revert:   Membatalkan commit sebelumnya",
      },
    ],
  },
};

export default config;
