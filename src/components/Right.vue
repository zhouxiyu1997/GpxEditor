<template>
  <div class="right flex flex-col">
    <p>{{ currentProvider }}</p>
    <div @click="ZoomIn" class="icon"><Plus style="width: 2em; height: 2em" /></div>
    <div @click="ZoomOut" class="icon"><Minus style="width: 2em; height: 2em" /></div>
    <div @click="switchToStreetMap()">街道地图</div>
    <div @click="switchToSatelliteMap()">卫星地图</div>
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
}, 1000);
const ZoomIn = () => {
  window.earthViewer.scene.camera.zoomIn(1000); //相机向前移动1000米
};
const ZoomOut = () => {
  earthViewer.scene.camera.zoomOut(1000); //相机向后移动1000米
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
