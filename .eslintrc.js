module.exports = {
  /**
   * 默认情况下，ESLint会在所有父级目录里寻找配置文件，一直到根目录。
   * 为了将ESLint限制在一个特定的项目，设置root: true；
   * ESLint一旦发现配置文件中有 root: true，就会停止在父级目录中寻找。
   */
  root: true,

  // 指定如何解析语法。可以为空，但若不为空，只能配该值，原因见下文。
  parser: 'vue-eslint-parser',

  // 优先级低于parse的语法解析配置
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    // sourceType: 'module', // "script" (默认) 或 "module"（如果你的代码是 ECMAScript 模块)
    // 指定js版本ES6。语法上的支持
    ecmaVersion: 'latest', //latest、6
  },
  env: {
    // 开启浏览器全局变量。
    browser: true,
    // 会自动开启es6语法支持。
    es6: true,
    // 开启Node.js 全局变量和 Node.js 作用域
    node: true,
    'vue/setup-compiler-macros': true, // 解决’defineProps’ is not defined
  },
  plugins: ['prettier', 'vue'],
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended', 'plugin:prettier/recommended'],
  globals: {
    Cesium: true,
  },

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

    'vue/multi-word-component-names': 'off',
  },
};
