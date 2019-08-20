module.exports = {
  'env': {
    'browser': true,
    'es6': true,
    'jest': true
  },
  'extends': ['standard', 'standard-react', 'standard-jsx'],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
    'shallow':'writable',
    'render':'writable',
    'mount':'writable',
    'toJson':'writable',
    'React':'writable'
  },
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  "extends": [
    "plugin:flowtype/recommended"
  ],
  'plugins': [
    'react',
    'standard',
    'flowtype',
    'import',
    'node',
    'promise'
  ],
  'rules': {
    "react/prop-types": 'off',
    "flowtype/no-types-missing-file-annotation": 'off',
    'code': 100
  }
}
