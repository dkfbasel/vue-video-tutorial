module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard',
    '@vue/typescript'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'quotes': ['warn', 'single'],
    'indent': ['error', 2],
    'space-before-function-paren': ['error', 'never']
  },
  parserOptions: {
    parser: '@typescript-eslint/parser'
  }
}
