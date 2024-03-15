import * as Cesium from 'cesium/Build/Cesium';
export function until() {
  return 'until';
}
//todo，localstorage转为indexDB，加上jsdoc注释

//保存gpx文件到localstroge
export function readGpx(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const positions = [];
    reader.onload = event => {
      const gpxData = event.target.result;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(gpxData, 'text/xml');
      //把file储存到localStorage
      localStorage.setItem('gpx', gpxData);
      const trackPoints = xmlDoc.querySelectorAll('trkpt');
      trackPoints.forEach(point => {
        const lat = parseFloat(point.getAttribute('lat'));
        const lon = parseFloat(point.getAttribute('lon'));
        const elevation = parseFloat(point.querySelector('ele').textContent);
        const time = new Date(point.querySelector('time').textContent);
        positions.push({ lon, lat, elevation, time });
      });
      resolve(positions); // Resolve the promise with positions
    };
    reader.onerror = reject; // Reject the promise if there is an error
    reader.readAsText(file);
  });
}
//重划线、点、label
export function drawGpx(earthViewer, positions) {
  // Remove all existing entities
  earthViewer.entities.removeAll();
  //绘制线
  let positions2 = positions.flatMap(obj => [obj.lon, obj.lat, obj.elevation]);
  // Add the line to the map
  earthViewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions2),
      width: 2,
      material: Cesium.Color.RED,
    },
  });
  //add the points to the map
  positions.forEach((point, index) => {
    earthViewer.entities.add({
      id: index,
      position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.elevation),
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
      },
    });
    // Add a label to the point
    if (index % 10 == 0) {
      earthViewer.entities.add({
        id: index + '-label',
        position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.elevation),
        label: {
          text: index.toString(),
          font: '14px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -9),
        },
      });
    }
  });
  earthViewer.zoomTo(earthViewer.entities);
}
//根据数组内容计算gpx数据
export function countGpx(positions) {
  let totalDistance = 0;
  let totalClimb = 0;
  let totalDescent = 0;
  let GpxDetail = '';
  positions.forEach((point, index) => {
    // Calculate distance, climb, and descent
    if (index > 0) {
      const prevPoint = positions[index - 1];
      const distance = Cesium.Cartesian3.distance(
        Cesium.Cartesian3.fromDegrees(prevPoint.lon, prevPoint.lat, prevPoint.elevation),
        Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.elevation),
      );
      totalDistance += distance;
      const elevationChange = point.elevation - prevPoint.elevation;
      if (elevationChange > 0) {
        totalClimb += elevationChange;
      } else {
        totalDescent += Math.abs(elevationChange);
      }
    }
  });
  const totalTime = (positions[positions.length - 1].time - positions[0].time) / 1000; // in seconds
  const averageSpeed = totalDistance / totalTime; // in meters per second
  GpxDetail = `平均速度: ${averageSpeed} m/s,总爬升: ${totalClimb} m,总距离: ${totalDescent} m`;
  return GpxDetail;
}
//delect gpx数据通过id
export function delectGpx(index, index2) {
  const positions = [];
  // 解析 GPX 数据
  const gpxData = localStorage.getItem('gpx');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxData, 'text/xml');

  // 获取所有 trkpt 元素
  const trackPoints = xmlDoc.querySelectorAll('trkpt');
  // 检查索引是否有效
  if (index < 0 || index2 >= trackPoints.length || index > index2) {
    throw new Error('Index out of range');
  }

  // 删除指定范围内的 trkpt 元素
  for (let i = index2; i >= index; i--) {
    const trkptToRemove = trackPoints[i];
    trkptToRemove.parentNode.removeChild(trkptToRemove);
  }

  // 将修改后的 XML 文档转换回字符串
  const serializer = new XMLSerializer();
  const updatedGpxData = serializer.serializeToString(xmlDoc);
  // 将更新后的 GPX 数据存回 localStorage
  localStorage.setItem('gpx', updatedGpxData);
  const trackPoints2 = xmlDoc.querySelectorAll('trkpt');
  trackPoints2.forEach(point => {
    const lat = parseFloat(point.getAttribute('lat'));
    const lon = parseFloat(point.getAttribute('lon'));
    const elevation = parseFloat(point.querySelector('ele').textContent);
    const time = new Date(point.querySelector('time').textContent);
    positions.push({ lon, lat, elevation, time });
  });
  //返回更新后的trkpt
  return positions;
}
export default {
  until,
  readGpx,
  drawGpx,
  countGpx,
  delectGpx,
};
