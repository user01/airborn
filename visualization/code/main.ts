
import Map from './components/map';
// import PlaneModel from './tools/three.plane.model';
import D3Map01 from './tools/d3.map.01';


const initScreen = () => {
  console.log('Screen online');
  require('../styles/main.less');
  const map = new Map(document.getElementById('map'));
  // const threeTest = new PlaneModel(document.getElementById('threejs'));
  const d3map01 = new D3Map01(map.map, document.getElementById('d3'));

  d3.select('#title')
    .text('Airspace')
    .transition()
    .duration(8000)
    .transition()
    .duration(6000)
    .style('opacity', 0.15)
    .transition()
    .duration(45000)
    .style('opacity', 0)
    .remove();

  d3.select('#subtitle')
    .text('Charlottesville')
    .transition()
    .duration(8000)
    .transition()
    .duration(6000)
    .style('opacity', 0)
    .remove();

  setTimeout(() => {
    // force a refresh every 30 minutes, just in case it gets stuck
    window.location.reload();
  }, 1800 * 1000);
}

document.addEventListener('DOMContentLoaded', initScreen, false);