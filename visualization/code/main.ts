
import Map from './components/map';
import ThreeTest from './tools/three.test';
import D3Test from './tools/d3.test';
import D3Map01 from './tools/d3.map.01';


const initScreen = () => {
  console.log('Screen online');
  require('../styles/main.less');
  const map = new Map(document.getElementById('map'));
  // const threeTest = new ThreeTest(document.getElementById('threejs'));
  // const d3test = new D3Test(document.getElementById('d3'));
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

}

document.addEventListener('DOMContentLoaded', initScreen, false);