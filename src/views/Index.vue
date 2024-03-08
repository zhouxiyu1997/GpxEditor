<template>
  <div class="main-container">
    <SceneViewer v-if="isMap" ref="map" @ready="ready" />
    <Left />
    <div class="set">
      <button @click="setSun">setSun</button>
      <button @click="sethomeCamera">sethomeCamera</button>
      <button @click="setEntity">setEntity</button>
      <button @click="settwoPoint">settwoPoint</button>
      <button @click="setbillboard">setbillboard</button>
      <button @click="setView">setView</button>
      <button @click="setmingyuan">setmingyuan</button>
      <button @click="setlayer">setlayer</button>
      <button @click="clear">clear</button>
      <button @click="loadGpx">加载gpx</button>
      <input type="file" accept=".gpx" @change="handleFileUpload" />
    </div>
    <Right />
  </div>
</template>
<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Left from '../components/Left.vue';
import Right from '../components/Right.vue';
import SceneViewer from '../components/SceneViewer.vue';
import { ref } from 'vue';
// 引用cesium
import * as Cesium from 'cesium/Build/Cesium';
const isMap = ref(true);
let viewer = null;
const ready = viewer2 => {
  viewer = viewer2;
};
const setSun = () => {
  // Enable lighting based on the sun position
  viewer.scene.globe.enableLighting = true;
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
  viewer.scene.camera.setView(homeCameraView);
};
const setEntity = () => {
  viewer.entities.add({
    name: 'BBox',
    position: Cesium.Cartesian3.fromDegrees(120.55538, 31.87532, 100.0),
    box: {
      dimensions: new Cesium.Cartesian3(40.0, 100.0, 150.0),
      material: Cesium.Color.BLUE,
    },
  });
  viewer.zoomTo(viewer.entities);
};
const settwoPoint = () => {
  viewer.entities.add({
    name: 'Red line on the surface',
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights([120.55538, 31.87532, 0, 120.55538, 31.87532, 1000]),
      width: 5,
      material: new Cesium.PolylineOutlineMaterialProperty({
        color: Cesium.Color.RED,
      }),
    },
  });
  viewer.zoomTo(viewer.entities);
};
const setbillboard = () => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(120.55538, 31.87532, 100.0),
    billboard: {
      image: '/vite.svg',
    },
  });
  viewer.zoomTo(viewer.entities);
};
const setView = () => {
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(120.55538, 31.87532, 100.0),
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: 0.0,
    },
  });
};
const setmingyuan = () => {
  viewer.entities.add({
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
  viewer.zoomTo(viewer.entities);
};
const setlayer = () => {};
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

    trackPoints.forEach(point => {
      const lat = parseFloat(point.getAttribute('lat'));
      const lon = parseFloat(point.getAttribute('lon'));
      const elevation = parseFloat(point.querySelector('ele').textContent);

      positions.push(lon, lat, elevation);
    });
    console.log(positions);
    viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
        width: 5,
        material: Cesium.Color.RED,
      },
    });
    viewer.zoomTo(viewer.entities);
  };
  reader.readAsText(file);
};
const clear = () => {
  viewer.entities.removeAll();
};
</script>

<style lang="scss" scoped>
.main-container {
  height: 100%;
  overflow: hidden;
  position: relative;
}
.set {
  position: absolute;
  top: 0;
  left: 200px;
  z-index: 999;
  button {
    margin: 10px;
  }
}
</style>
