/** @type {import("lint-staged").Configuration} */
const config = {
  "*.{js,jsx,ts,tsx,mjs,cjs}": ["eslint --fix", "prettier --write"],

  "*.{json,jsonc,md,mdx,css,scss,yml,yaml}": ["prettier --write"],
};

export default config;
