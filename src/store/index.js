import { defineStore } from 'pinia';
export const PiniaStore = defineStore('main', {
  //导出 pinia仓库
  state: () => {
    //相当于全局的 data()
    return {
      name: '张三',
      age: 18,
    };
  },
  getters: {}, //相当于全局的computed
  actions: {}, //相当于全局methods
});
