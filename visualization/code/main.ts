
import Map from './components/map';
import ThreeTest from './tools/three.test';
import D3Test from './tools/d3.test';


const initScreen = () => {
  console.log('Screen online');
  require('../styles/main.less');
  // const map = new Map(document.getElementById('map'));
  const threeTest = new ThreeTest(document.getElementById('threejs'));
  const d3test = new D3Test(document.getElementById('d3'));
}

document.addEventListener('DOMContentLoaded', initScreen, false);