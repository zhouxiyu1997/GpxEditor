<template>
  <div class="Top">
    <!-- <div @click="clear" class="icon" title="新建gpx"><DocumentAdd style="width: 2em; height: 2em" /></div> -->
    <div>
      <label class="upload-button" for="upload"> 上传文件 </label>
      <input type="file" accept=".gpx" @change="handleFileUpload" id="upload" />
      <el-button @click="clear" title="新建gpx">新建gpx</el-button>
      <el-button @click="clear">导出gpx</el-button>
      <el-button @click="clear">清除gpx</el-button>
      <el-button @click="isShowMoreBtn">更多实验</el-button>
    </div>
    <div v-if="isShowMore">
      <el-button @click="setSun">光照</el-button>
      <el-button @click="sethomeCamera">视角改变</el-button>
      <el-button @click="setEntity">新建实体</el-button>
      <el-button @click="settwoPoint">新建俩个点</el-button>
      <el-button @click="setbillboard">新建广告牌</el-button>
      <el-button @click="setView">新建视角</el-button>
      <el-button @click="setmingyuan">新建面</el-button>
    </div>
    <div>
      <span>GPX数据详情:{{ GpxDetail }}</span>
    </div>
  </div>
</template>
<script setup>
// 引用cesium
import * as Cesium from 'cesium/Build/Cesium';
import { ref } from 'vue';
let GpxDetail = ref('');
let isShowMore = ref(false);
let earthViewer;
const intervalId = setInterval(() => {
  if (window.earthViewer) {
    earthViewer = window.earthViewer;
    clearInterval(intervalId);
  }
}, 1000);
//gpx文件操作
const handleFileUpload = event => {
  const file = event.target.files[0];
  if (file) {
    readAndDisplayGPX(file);
  }
};
const readAndDisplayGPX = file => {
  const reader = new FileReader();
  reader.onload = event => {
    const gpxData = event.target.result;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxData, 'text/xml');

    const trackPoints = xmlDoc.querySelectorAll('trkpt');
    const positions = [];
    const positions2 = [];

    let totalDistance = 0;
    let totalClimb = 0;
    let totalDescent = 0;

    trackPoints.forEach((point, index) => {
      const lat = parseFloat(point.getAttribute('lat'));
      const lon = parseFloat(point.getAttribute('lon'));
      const elevation = parseFloat(point.querySelector('ele').textContent);
      const time = new Date(point.querySelector('time').textContent);
      positions.push(lon, lat, elevation);
      positions2.push({ lon, lat, elevation, time });
      // Calculate distance, climb, and descent
      if (index > 0) {
        const prevPoint = positions2[index - 1];
        const distance = Cesium.Cartesian3.distance(
          Cesium.Cartesian3.fromDegrees(prevPoint.lon, prevPoint.lat, prevPoint.elevation),
          Cesium.Cartesian3.fromDegrees(lon, lat, elevation),
        );
        totalDistance += distance;
        const elevationChange = elevation - prevPoint.elevation;
        if (elevationChange > 0) {
          totalClimb += elevationChange;
        } else {
          totalDescent += Math.abs(elevationChange);
        }
      }
    });
    const totalTime = (positions2[positions2.length - 1].time - positions2[0].time) / 1000; // in seconds
    const averageSpeed = totalDistance / totalTime; // in meters per second
    GpxDetail.value = `Average speed: ${averageSpeed} m/s,Total climb: ${totalClimb} m,Total descent: ${totalDescent} m`;
    // Add the line to the map
    earthViewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
        width: 2,
        material: Cesium.Color.RED,
      },
    });
    earthViewer.zoomTo(earthViewer.entities);
  };
  reader.readAsText(file);
};
// 更多实验
const isShowMoreBtn = () => {
  isShowMore.value = !isShowMore.value;
};
const setSun = () => {
  // Enable lighting based on the sun position
  earthViewer.scene.globe.enableLighting = true;
};
const sethomeCamera = () => {
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
  earthViewer.scene.camera.setView(homeCameraView);
};
const setEntity = () => {
  earthViewer.entities.add({
    name: 'BBox',
    position: Cesium.Cartesian3.fromDegrees(120.55538, 31.87532, 100.0),
    box: {
      dimensions: new Cesium.Cartesian3(40.0, 100.0, 150.0),
      material: Cesium.Color.BLUE,
    },
  });
  earthViewer.zoomTo(earthViewer.entities);
};
const settwoPoint = () => {
  earthViewer.entities.add({
    name: 'Red line on the surface',
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights([120.55538, 31.87532, 0, 120.55538, 31.87532, 1000]),
      width: 5,
      material: new Cesium.PolylineOutlineMaterialProperty({
        color: Cesium.Color.RED,
      }),
    },
  });
  earthViewer.zoomTo(earthViewer.entities);
};
const setbillboard = () => {
  earthViewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(120.55538, 31.87532, 100.0),
    billboard: {
      image: '/vite.svg',
    },
  });
  earthViewer.zoomTo(earthViewer.entities);
};
const setView = () => {
  earthViewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(120.55538, 31.87532, 100.0),
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: 0.0,
    },
  });
};
const setmingyuan = () => {
  earthViewer.entities.add({
    name: 'Wyoming',
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray([
        -109.080842, 45.002073, -105.91517, 45.002073, -104.058488, 44.996596, -104.053011, 43.002989, -104.053011,
        41.003906, -105.728954, 40.998429, -107.919731, 41.003906, -109.04798, 40.998429, -111.047063, 40.998429,
        -111.047063, 42.000709, -111.047063, 44.476286, -111.05254, 45.002073,
      ]),
      height: 0,
      material: Cesium.Color.RED.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.BLACK,
    },
  });
  earthViewer.zoomTo(earthViewer.entities);
};
const clear = () => {
  earthViewer.entities.removeAll();
};
</script>
<style scoped lang="scss">
.Top {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100px;
  background-color: rgba(255, 153, 0, 0.5);
  position: absolute;
  left: 0;
  top: 0;
  overflow: auto;
  box-sizing: border-box;
  border-right: 1px solid #e0e0e0;
}
.upload-button {
  padding: 8px 18px;
  font-size: 14px;
  background: #00bfff;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  margin-right: 12px;
}

input {
  display: none;
}
</style>
