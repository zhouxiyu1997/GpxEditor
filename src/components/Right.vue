<template>
  <div class="right flex flex-col">
    <p>{{ currentProvider }}</p>
    <div @click="ZoomIn" class="zoom"><Plus style="width: 2em; height: 2em" /></div>
    <div @click="ZoomOut" class="zoom"><Minus style="width: 2em; height: 2em" /></div>
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
}, 1000); // 每100毫秒检查一次
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
  .zoom {
    width: 2em;
    height: 2em;
    background-color: #fff;
    margin: 10px;
  }
}
</style>
