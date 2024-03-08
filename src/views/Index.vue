<template>
  <div class="main-container">
    <SceneViewer ref="map" @ready="ready" />
    <Top />
    <Left />
    <Right />
    <Bottom />
  </div>
</template>
<script setup>
import Left from '../components/Left.vue';
import Right from '../components/Right.vue';
import Top from '../components/Top.vue';
import Bottom from '../components/Bottom.vue';
import SceneViewer from '../components/SceneViewer.vue';
const ready = viewer => {
  window.earthViewer = viewer;
};
</script>

<style lang="scss" scoped>
.main-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
}
</style>
