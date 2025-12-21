import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettier,
  {
    ignores: ['**/dist/**', '**/build/**', '**/node_modules/**', '**/coverage/**', '**/logger/**'],
  },
];
