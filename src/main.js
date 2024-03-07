import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import router from './router/index';

import App from './App.vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 引用自定义样式
import './styles/index.scss';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const app = createApp(App);
app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(createPinia());
app.use(router);
app.mount('#app');
