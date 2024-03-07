<template>
  <div class="left">
    <el-button @click="flytoHome">flyto</el-button>
    <el-button @click="flyto">2333</el-button>
  </div>
</template>
<script setup>
// 引用cesium
import * as Cesium from 'cesium/Build/Cesium';

const flytoHome = () => {
  // eslint-disable-next-line no-console
  console.log(window.earthViewer);
  // Create an initial camera view
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
  window.earthViewer.scene.camera.setView(homeCameraView);
};
const flyto = () => {};
</script>
<style scoped>
.left {
  width: 200px;
  height: 100%;
  background-color: transparent;
  position: absolute;
  left: 0;
  top: 0;
  overflow: auto;
  padding: 10px;
  box-sizing: border-box;
  border-right: 1px solid #e0e0e0;
}
</style>
