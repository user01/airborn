
import Map from './components/map';
import ThreeTest from './tools/three.test';


const initScreen = () => {
  console.log('Screen online');
  require('../styles/main.less');
  const map = new Map(document.getElementById('map'));
  const threeTest = new ThreeTest(document.getElementById('threejs'));
}

document.addEventListener('DOMContentLoaded', initScreen, false);