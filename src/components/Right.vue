<template>
  <div class="right flex-1 flex flex-col">
    <p>{{ currentProvider }}</p>
    <el-button type="primary" @click="switchToStreetMap()">街道地图</el-button>
    <el-button type="primary" @click="switchToSatelliteMap()">卫星地图</el-button>
    <el-button @click="ZoomIn"> <Plus style="width: 1em; height: 1em" /></el-button>
    <el-button @click="ZoomOut"> <Minus style="width: 1em; height: 1em" /></el-button>
  </div>
</template>
<script setup>
// 引用cesium
import * as Cesium from 'cesium/Build/Cesium';
import { ref } from 'vue';
const currentProvider = ref('https://a.tile.openstreetmap.org/');
const earthViewer = window.earthViewer;
const ZoomIn = () => {
  earthViewer.scene.camera.zoomIn();
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
  currentProvider.value = 'https://a.tile.openstreetmap.org/';
};
const switchToSatelliteMap = () => {
  earthViewer.imageryLayers.removeAll();
  earthViewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maximumLevel: 18,
    }),
  );
  currentProvider.value =
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
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
