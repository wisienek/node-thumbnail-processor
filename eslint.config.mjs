import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['node_modules/*', 'dist/*', 'src/processors/origin.processor*'],
  },
  {
    plugins: {},
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {},
  },
  ...compat
    .extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended')
    .map((config) => ({
      ...config,
      files: ['**/*.ts', '**/*.tsx'],
    })),
  {
    files: ['**/*.ts', '**/*.tsx'],

    plugins: {
      '@typescript-eslint': typescriptEslintEslintPlugin,
    },

    languageOptions: {
      parser: tsParser,
    },

    rules: {
      curly: 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      'no-extra-semi': 'off',
      'no-new-func': 'error',
      'no-compare-neg-zero': 'error',
      'no-unsafe-optional-chaining': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'warn',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowFunctionsWithoutTypeParameters: true,
          allowIIFEs: true,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
        },
      ],
      'no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'none',
        },
      ],
    },
  },
  ...compat.extends().map((config) => ({
    ...config,
    files: ['**/*.js', '**/*.jsx'],
  })),
  {
    files: ['**/*.js', '**/*.jsx'],

    rules: {
      curly: 'error',
    },
  },
];
