import splunkConfig from '@splunk/eslint-config/flat-browser.mjs';
import tseslint from 'typescript-eslint';

export default [
    { ignores: ['build/**', 'coverage/**', 'src/data/generated/**'] },
    ...splunkConfig,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            'react/prop-types': 'off',
            'react/require-default-props': 'off',
            'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
            '@typescript-eslint/no-explicit-any': 'warn',
            // This project uses the classic JSX runtime (see babel-preset), so
            // every file with JSX needs `React` in scope even though nothing
            // else in the file references it by name.
            '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
        },
    },
    {
        files: ['**/*.test.{ts,tsx}', 'src/test/**'],
        rules: {
            'import/no-extraneous-dependencies': 'off',
        },
    },
];
