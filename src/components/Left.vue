<template>
  <div class="left flex flex-col">
    <el-button @click="startEdit">点击编辑</el-button>
    <el-button @click="startDelectById(3)">点击删除</el-button>
    <el-button @click="startDelectById(0)">根据id删除</el-button>
    <el-button @click="startEdit">框选删除</el-button>
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
const startDelectById = index => {
  // 解析 GPX 数据
  const gpxData = localStorage.getItem('gpx');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxData, 'text/xml');

  // 获取所有 trkpt 元素
  const trackPoints = xmlDoc.querySelectorAll('trkpt');

  // 检查索引是否有效
  if (index < 0 || index >= trackPoints.length) {
    throw new Error('Index out of range');
  }

  // 删除指定的 trkpt 元素
  const trkptToRemove = trackPoints[index];
  trkptToRemove.parentNode.removeChild(trkptToRemove);

  // 将修改后的 XML 文档转换回字符串
  const serializer = new XMLSerializer();
  const updatedGpxData = serializer.serializeToString(xmlDoc);

  // 将更新后的 GPX 数据存回 localStorage
  localStorage.setItem('gpx', updatedGpxData);
  // 删除地图上的实体
  // earthViewer.entities.removeById(index);
  // earthViewer.entities.removeById(index + '-label');
  //重划线
  reLine();
};
const reLine = () => {
  // 解析 GPX 数据
  const gpxData = localStorage.getItem('gpx');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxData, 'text/xml');

  // 获取所有 trkpt 元素
  const trackPoints = xmlDoc.querySelectorAll('trkpt');
  // 删除地图上的实体
  earthViewer.entities.removeAll();
  // 重划线
  for (let i = 0; i < trackPoints.length; i++) {
    const trkpt = trackPoints[i];
    const lat = trkpt.getAttribute('lat');
    const lon = trkpt.getAttribute('lon');
    const ele = trkpt.querySelector('ele').textContent;
    earthViewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat, ele),
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
      },
    });
  }
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
