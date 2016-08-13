
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
  const d3map01 = new D3Map01(map.map);
}

document.addEventListener('DOMContentLoaded', initScreen, false);