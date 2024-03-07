<!-- eslint-disable no-console -->
<script setup>
import {
  ref,
  // computed,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  watchEffect,
} from 'vue';

//数据，相当于Vue2.x里面的data
let sum = ref(0);

// 计算属性
// const ee = computed(() => {
//   return 'ee';
// });

// 父组件传值props
// eslint-disable-next-line no-unused-vars
// const props = defineProps({
//   msg: String,
// });

defineProps({
  msg: String,
});

//通过组合式API的形式去使用生命周期钩子
onBeforeMount(() => {
  console.log('---onBeforeMount---');
});
onMounted(() => {
  console.log('---onMounted---');
});

onBeforeUpdate(() => {
  console.log('---onBeforeUpdate---');
});
onUpdated(() => {
  console.log('---onUpdated---');
});

onBeforeUnmount(() => {
  console.log('---onBeforeUnmount---');
});
onUnmounted(() => {
  console.log('---onUnmounted---');
});

watchEffect(() => {
  console.log('---watchEffect---');
});
</script>

<template>
  <div>{{ sum }}</div>
</template>

<style lang="scss" scoped></style>
