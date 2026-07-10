const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: ['node_modules/**', 'dist/**', '.features-gen/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
);
