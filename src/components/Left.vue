<template>
  <div class="left">
    <el-button @click="flytoHome">flytoHome</el-button>
    <el-button @click="flyto">2333</el-button>
  </div>
</template>
<script setup>
// 引用cesium
import * as Cesium from 'cesium/Build/Cesium';
let earthViewer;
const intervalId = setInterval(() => {
  if (window.earthViewer) {
    earthViewer = window.earthViewer;
    clearInterval(intervalId);
  }
}, 100); // 每100毫秒检查一次
const flytoHome = () => {
  var initialPosition = new Cesium.Cartesian3.fromDegrees(
    -73.998114468289017509,
    40.674512895646692812,
    2631.082799425431,
  );
  var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(
    7.1077496389876024807,
    -31.987223091598949054,
    0.025883251314954971306,
  );
  var homeCameraView = {
    destination: initialPosition,
    orientation: {
      heading: initialOrientation.heading,
      pitch: initialOrientation.pitch,
      roll: initialOrientation.roll,
    },
  };
  // Set the initial view
  earthViewer.scene.camera.setView(homeCameraView);
};
const flyto = () => {};
</script>
<style scoped>
.left {
  width: 200px;
  height: calc(100% - 400px);
  background-color: rgba(173, 216, 230, 0.5);
  position: absolute;
  left: 0;
  top: 200px;
  overflow: auto;
  box-sizing: border-box;
  border-right: 1px solid #e0e0e0;
}
</style>
