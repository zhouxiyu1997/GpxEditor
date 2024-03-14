export function until() {
  return 'until';
}
//todo，localstorage转为indexDB，加上jsdoc注释
export function readGpx(file) {}
//重载localstroge里面的gpx文件，重划线、点
export function reloadGpx() {
  console.log('reloadGpx');
  return 'reloadGpx';
}
//重新读取gpx数据并生成postions[{lat,lng,ele,time}]数组
export function reloadGpxData() {
  console.log('reloadGpxData');
  return 'reloadGpxData';
}
//根据数组内容计算gpx数据
export default {
  until,
  reloadGpx,
};
