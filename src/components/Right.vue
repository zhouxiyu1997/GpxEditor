<template>
  <div class="right">
    right <el-button type="primary">切换底图</el-button>
    <el-button @click="ZoomIn">放大</el-button>
    <el-button @click="ZoomOut">缩小</el-button>
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
