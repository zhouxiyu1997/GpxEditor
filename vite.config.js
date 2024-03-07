// import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';

import path from 'path';
// import { resolve } from 'path'; // 主要用于alias文件路径别名

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { visualizer } from 'rollup-plugin-visualizer';
import cesium from 'vite-plugin-cesium'; // 引入插件

// https://vitejs.dev/config/
export default () => {
  return {
    // 开发或生产环境服务的公共基础路径
    // base: loadEnv(mode, process.cwd()).VITE_BASEURL,
    plugins: [
      vue(),
      eslintPlugin({
        include: ['src/**/*.js', 'src/**/*.vue', 'src/*.js', 'src/*.vue'],
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      // 设置开启生产打包分析文件大小功能
      visualizer({
        open: true, //注意这里要设置为true，否则无效
        gzipSize: true,
        brotliSize: true,
      }),
      cesium(),
    ],
    resolve: {
      alias: {
        '@/': path.join(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true,
          additionalData: `
            @import "./src/styles/variables.scss";
            @import "./src/styles/mixin.scss";
            `,
        },
      },
    },
    esbuild: {},

    // 开发服务器配置
    server: {
      cors: true, // 默认启⽤并允许任何源
      open: true, // 在服务器启动时⾃动在浏览器中打开应⽤程序
      //反向代理配置，注意rewrite写法，开始没看⽂档在这⾥踩了坑
      proxy: {},
      hmr: true, //开启热更新
    },
    // 构建选项
    build: {
      target: 'esnext',
      outDir: 'dist', // 指定输出路径，要和库的包区分开
      assetsDir: 'static/img/', // 指定生成静态资源的存放路径
      sourcemap: false,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          // project: resolve(__dirname, 'project.html'),
        },
        // 打包以后的js,css和img资源分别分门别类在js/css/img文件夹中
        output: {
          chunkFileNames: 'static/js1/[name]-[hash].js',
          entryFileNames: 'static/js2/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            // 静态资源分拆打包
            // 将src的文件打包成一个vendor.js
            // if (id.includes('src')) {
            //   return 'page'
            // }
            // return ''
            // node_modules的包逐个打包
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          },
        },
      },
      minify: 'esbuild', // 'terser' 相对较慢，但大多数情况下构建后的文件体积更小，默认'esbuild'
      // terserOptions: {
      //   // minify 为terser生效 若minify为esbuild 则需要走esbuild的配置
      //   compress: {
      //     drop_console: mode === 'production', // 生产环境去除console
      //     drop_debugger: mode === 'production', // 生产环境去除debugger
      //   },
      // },
      brotliSize: false, // 不统计
    },

    // 预览选项
    preview: {},

    // 依赖优化选型
    optimizeDeps: {},
  };
};
