<template>
  <div class="right  flex-1 flex flex-col">
    right <el-button type="primary">切换底图</el-button>
    <el-button @click="ZoomIn"> <Plus style="width: 1em; height: 1em; margin-right: 8px" /></el-button>
    <el-button @click="ZoomOut"> <Minus style="width: 1em; height: 1em; margin-right: 8px" /></el-button>
  </div>
</template>
<script setup>
const ZoomIn = () => {
  window.earthViewer.scene.camera.zoomIn();
};
const ZoomOut = () => {
  window.earthViewer.scene.camera.zoomOut();
};
</script>
<style scoped>
.right {
  width: 200px;
  height: 100%;
  background-color: transparent;
  position: absolute;
  right: 0;
  top: 0;
  overflow: auto;
  padding: 10px;
  box-sizing: border-box;
  border-left: 1px solid #e0e0e0;
}
</style>
