<template>
  <div class="Top">
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
    earthViewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
        width: 5,
        material: Cesium.Color.RED,
      },
    });
    earthViewer.zoomTo(earthViewer.entities);
  };
  reader.readAsText(file);
};
const clear = () => {
  earthViewer.entities.removeAll();
};
</script>
<style scoped lang="scss">
.Top {
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
</style>
