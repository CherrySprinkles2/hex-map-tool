module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  rules: {
    'arrow-body-style': ['error', 'always'],
    'react/react-in-jsx-scope': 'off',
    'no-undef': 'off',
    'no-unused-vars': 'off',
  },
  settings: {
    react: { version: 'detect' },
  },
  env: {
    browser: true,
    es2020: true,
  },
};
