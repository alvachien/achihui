// @ts-check
// Flat config (ESLint 9). Migrated from .eslintrc.json.
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = tseslint.config(
  // Global ignores (a config object with ONLY `ignores` is a global ignore).
  {
    ignores: ['projects/**/*', 'dist/**/*', 'coverage/**/*'],
  },

  // Global linter options for all files.
  {
    linterOptions: {
      // Disable directives for rules relaxed below (or removed in v21) would
      // otherwise be reported as unused. Silence that noise.
      reportUnusedDisableDirectives: 'off',
    },
  },

  // TypeScript files (components, services, etc.)
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
      prettierRecommended,
    ],
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        { prefix: 'hih', style: 'kebab-case', type: 'element' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { prefix: 'hih', style: 'camelCase', type: 'attribute' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Not in typescript-eslint v7 recommended (the prior config); the codebase
      // uses `!` extensively and idiomatically. Adopting this is a separate effort.
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Wave 7 (UI-13): *ngIf/*ngFor -> @if/@for template-control-flow migration.
      '@angular-eslint/template/prefer-control-flow': 'off',
    },
  },

  // HTML templates
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, prettierRecommended],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'off',
    },
  },

  // Test files and test helpers: allow explicit any; test stubs may opt out of
  // standalone and use @HostBinding (the stub is not a real directive).
  {
    files: ['**/*.spec.ts', 'src/test-setup.ts', 'src/testing/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@angular-eslint/prefer-standalone': 'off',
    },
  },
);
