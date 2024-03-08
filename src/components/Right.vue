<template>
  <div class="right flex flex-col">
    <p>{{ currentProvider }}</p>
    <el-button @click="ZoomIn"> <Plus style="width: 1em; height: 1em" /></el-button>
    <el-button @click="ZoomOut"> <Minus style="width: 1em; height: 1em" /></el-button>
    <el-button @click="switchToStreetMap()">街道地图</el-button>
    <el-button @click="switchToSatelliteMap()">卫星地图</el-button>
  </div>
</template>
<script setup>
// 引用cesium
import * as Cesium from 'cesium/Build/Cesium';
import { ref } from 'vue';
const currentProvider = ref('streetMap');
let earthViewer;
const intervalId = setInterval(() => {
  if (window.earthViewer) {
    earthViewer = window.earthViewer;
    clearInterval(intervalId);
  }
}, 100); // 每100毫秒检查一次
const ZoomIn = () => {
  window.earthViewer.scene.camera.zoomIn();
  console.log(earthViewer);
  console.log(window.earthViewer);
};
const ZoomOut = () => {
  earthViewer.scene.camera.zoomOut();
};
const switchToStreetMap = () => {
  earthViewer.imageryLayers.removeAll();
  earthViewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://a.tile.openstreetmap.org/',
      maximumLevel: 18,
    }),
  );
  currentProvider.value = 'streetMap';
};
const switchToSatelliteMap = () => {
  earthViewer.imageryLayers.removeAll();
  earthViewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maximumLevel: 18,
    }),
  );
  currentProvider.value = 'satelliteMap';
};
</script>
<style scoped>
.right {
  width: 200px;
  height: calc(100% - 400px);
  background-color: rgba(0, 153, 204, 0.5);
  position: absolute;
  right: 0;
  top: 200px;
  overflow: auto;
  box-sizing: border-box;
  border-left: 1px solid #e0e0e0;
}
</style>
