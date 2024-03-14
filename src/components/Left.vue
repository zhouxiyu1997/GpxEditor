<template>
  <div class="left flex flex-col">
    <el-button @click="startEdit">点击编辑(TODO)</el-button>
    <el-button @click="startDelectById(0)">点击删除(TODO)</el-button>
    <el-input v-model="inputID" style="width: 100px" placeholder="0-100" />
    <el-button @click="startDelectById()">根据id删除</el-button>
    <el-button @click="until">框选删除(TODO)</el-button>
  </div>
</template>
<script setup>
// 引用cesium
import * as Cesium from 'cesium/Build/Cesium';
import { ref } from 'vue';
import { until, delectGpx, drawGpx, countGpx } from '../api/until';
let earthViewer;
let inputID = ref('');
const intervalId = setInterval(() => {
  if (window.earthViewer) {
    earthViewer = window.earthViewer;
    clearInterval(intervalId);
  }
}, 1000);
const startEdit = () => {
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
  earthViewer.scene.camera.setView(homeCameraView);
};
const startDelectById = () => {
  //读取inputID.value，设为index,index2
  let index = parseInt(inputID.value.split('-')[0]);
  let index2 = parseInt(inputID.value.split('-')[1]);
  let positions = delectGpx(index, index2);
  //todo更新到兄弟组件
  console.log(countGpx(positions));
  drawGpx(earthViewer, positions);
};
</script>
<style scoped>
.left {
  width: 200px;
  height: calc(100% - 400px);
  /* background-color: rgba(173, 216, 230, 0.5); */
  position: absolute;
  left: 0;
  top: 200px;
  overflow: auto;
  box-sizing: border-box;
  .el-button {
    margin: 10px;
  }
}
</style>
