export default [
  {
    ignores: [
      'node_modules/**',
      '.deploy/**',
      'coverage/**',
    ],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'commonjs',
      globals: {
        Buffer: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
        setTimeout: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
    rules: {
      complexity: ['warn', 10],
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'max-lines-per-function': ['warn', {
        max: 90,
        skipBlankLines: true,
        skipComments: true,
      }],
      'no-console': 'warn',
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^error$',
      }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
];
