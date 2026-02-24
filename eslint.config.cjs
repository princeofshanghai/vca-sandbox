const js = require('@eslint/js');
const globals = require('globals');
const tsEslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh').default;

module.exports = [
  {
    ignores: ['dist', '.eslintrc.cjs'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,cjs,mjs}', 'vite.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...tsEslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-undef': 'off',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': ['error', { ignoreDeclarationMerge: true }],
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: [
      'src/components/layout/**/*.{ts,tsx}',
      'src/components/dashboard/**/*.{ts,tsx}',
      'src/views/dashboard/**/*.{ts,tsx}',
      'src/views/auth/**/*.{ts,tsx}',
      'src/views/share/**/*.{ts,tsx}',
      'src/views/ComponentLibraryView.tsx',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='button']",
          message:
            'Shell UI: use components from src/components/shell or src/components/ui instead of raw <button>.',
        },
        {
          selector: "JSXOpeningElement[name.name='input']",
          message:
            'Shell UI: use components from src/components/shell or src/components/ui instead of raw <input>.',
        },
        {
          selector: "JSXOpeningElement[name.name='select']",
          message:
            'Shell UI: use components from src/components/shell or src/components/ui instead of raw <select>.',
        },
        {
          selector: "JSXOpeningElement[name.name='textarea']",
          message:
            'Shell UI: use components from src/components/shell or src/components/ui instead of raw <textarea>.',
        },
      ],
    },
  },
];
