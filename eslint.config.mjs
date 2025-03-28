import nextEslint from '@next/eslint-plugin-next';
import eslintPluginEslintrc from '@eslint/eslintrc';
import tseslint from 'typescript-eslint';

const { FlatCompat } = eslintPluginEslintrc;
const compat = new FlatCompat();

export default [
  {
    ignores: ['**/*.js', '**/*.mjs', '**/*.cjs'],
  },
  ...tseslint.configs.recommended,
  ...compat.extends('eslint:recommended'),
  {
    plugins: {
      '@next/next': nextEslint,
    },
    rules: {
      'no-var': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
];
