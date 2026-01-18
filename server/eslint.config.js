import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2024,
      },
    },
  },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      // Error prevention
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_|^next$',  // Allow unused 'next' in Express middleware
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-template-curly-in-string': 'warn',

      // Best practices
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-return-await': 'off',  // Allow await on return (clearer async flow)
      'no-useless-catch': 'off',  // Allow try/catch wrappers for logging/transforming errors
      'prefer-const': 'error',
      'prefer-template': 'warn',

      // Node.js specific
      'no-path-concat': 'error',
      'no-process-exit': 'warn',

      // Code style (non-formatting) - suppress overly strict rules
      'no-var': 'error',
      'object-shorthand': ['warn', 'always'],
      'prefer-arrow-callback': 'warn',
      'prefer-destructuring': 'off',  // Allow both destructuring and direct assignment
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.config.js',
      '*.config.mjs',
    ],
  },
];
