// @ts-check
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import rootConfig from '../../eslint.config.mjs';

export default tseslint.config(
  // Импортируем базовые правила из корня
  ...rootConfig,

  // TypeScript рекомендации
  ...tseslint.configs.recommended,

  // TypeScript с type checking
  ...tseslint.configs.recommendedTypeChecked,

  // Prettier
  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },

  {
    ignores: ['eslint.config.mjs', 'dist/**', 'src/database', 'src/main.ts'],
  },
);
