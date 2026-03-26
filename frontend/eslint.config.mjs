// eslint.config.mjs — Next.js 15 flat config (baseline minimal)
/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {},
  },
]

export default eslintConfig
