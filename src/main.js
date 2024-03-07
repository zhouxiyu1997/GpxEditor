import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import router from './router/index';

import App from './App.vue';

// 引用自定义样式
import './styles/index.scss';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const app = createApp(App);
app.use(ElementPlus);
app.use(createPinia());
app.use(router);
app.mount('#app');
