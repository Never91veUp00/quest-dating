module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'prefer-const': 'warn',
    'no-var': 'error',
    'object-shorthand': 'warn',
    'quote-props': ['warn', 'as-needed'],
    'prefer-template': 'warn',
    'prefer-arrow-callback': 'warn',
    'arrow-spacing': 'warn',
    'no-useless-concat': 'warn',
    'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 0 }],
    'comma-dangle': ['warn', 'never'],
    'semi': ['warn', 'never'],
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'indent': ['warn', 2, { SwitchCase: 1 }],
    'max-len': ['warn', { 
      code: 120, 
      ignoreComments: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true
    }]
  },
  overrides: [
    {
      files: ['server/**/*.js'],
      env: {
        node: true,
        browser: false
      }
    },
    {
      files: ['client/**/*.js', 'client/**/*.vue'],
      env: {
        browser: true,
        node: false
      },
      extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended'
      ],
      rules: {
        'vue/multi-word-component-names': 'off',
        'vue/no-unused-vars': 'warn'
      }
    }
  ]
}