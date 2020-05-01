module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true
  },
  extends: ['standard', 'standard-react', 'standard-jsx'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    shallow: 'writable',
    render: 'writable',
    mount: 'writable',
    toJson: 'writable',
    React: 'writable',
    page: true,
    browser: true,
    context: true,
    jestPuppeteer: true
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  extends: ['plugin:flowtype/recommended'],
  plugins: ['react', 'standard', 'flowtype', 'import', 'node', 'promise', 'react-hooks'],
  rules: {
    'react/prop-types': 'off',
    'flowtype/no-types-missing-file-annotation': 'off',
    'max-len': [
      2,
      {
        code: 100,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }
    ],
    'space-before-function-paren': ['error', 'always'],
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn' // Checks effect dependencies
  }
}
