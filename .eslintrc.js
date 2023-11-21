module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // 0:off 1:warn 2:error
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-var': 'error', // 禁用var
    // 'no-unused-vars': [2, { args: 'none' }], // 消除未使用的变量  不检查函数的参数
    'no-redeclare': 2, // 禁止多次声明同一变量
    'no-dupe-keys': 2, // 在创建对象字面量时不允许键重复
    'no-underscore-dangle': 0, // 允许下划线开头结尾
    'comma-dangle': ['error', 'always-multiline'],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    semi: ['error', 'always'],
    quotes: [2, 'single'],
    camelcase: 0,
    eqeqeq: ['error', 'always', { null: 'ignore' }], // 强制使用全等
    // 取消文件末尾必须有空行
    'eol-last': 'off',
    // 关闭 prettier/prettier 语法报错
    'prettier/prettier': 'off',
    'react-native/no-inline-styles': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
  },
};
