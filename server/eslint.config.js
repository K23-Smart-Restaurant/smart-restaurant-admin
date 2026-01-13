import globals from 'globals';
import pluginJs from '@eslint/js';

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
    {
        rules: {
            // Error prevention
            'no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
            'no-debugger': 'error',
            'no-duplicate-imports': 'error',
            'no-template-curly-in-string': 'warn',

            // Best practices
            eqeqeq: ['error', 'always'],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-return-await': 'warn',
            'prefer-const': 'error',
            'prefer-template': 'warn',

            // Node.js specific
            'no-path-concat': 'error',
            'no-process-exit': 'warn',

            // Code style (non-formatting)
            'no-var': 'error',
            'object-shorthand': ['warn', 'always'],
            'prefer-arrow-callback': 'warn',
            'prefer-destructuring': [
                'warn',
                {
                    array: false,
                    object: true,
                },
            ],
        },
    },
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            'coverage/**',
            'uploads/**',
            '*.config.js',
            '*.config.mjs',
            '*.config.ts',
        ],
    },
];
