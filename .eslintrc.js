module.exports = {
  root: true,
  parserOptions: {
      parser: 'babel-eslint',
      sourceType: 'module'
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: [
      // "eslint:recommended",
      'standard',
      'plugin:vue/essential'
  ],
  // required to lint *.vue files
  plugins: ['vue'],
  // add your custom rules here
  rules: {
      'max-len': [
          'error',
          {
              code: 200,
              ignoreUrls: true,
              ignoreStrings: true,
              ignoreTemplateLiterals: true,
              ignoreRegExpLiterals: true
          }
      ],
      'space-before-function-paren': 0,
      semi: 0,
      camelcase: 0,
      quotes: ['error', 'single'],
      indent: ['error', 4, { SwitchCase: 1, MemberExpression: 1 }],
      // allow paren-less arrow functions
      'arrow-parens': 0,
      // allow async-await
      'generator-star-spacing': 0,
      'vue/no-parsing-error': 0,
      // allow debugger during development
      'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
      outerIIFEBody: 0
  },
  globals: {
    gtag: false,
    IM_WS_HOST: false,
    weex: false,
    WXEnvironment: false,
    sa: false
  }
};
