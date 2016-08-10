
import Map from './components/map';
import ThreeTest from './tools/three.test';


const initScreen = () => {
  console.log('Screen online');
  require('../styles/main.less');
  // const map = new Map(document.getElementById('map'));
  // const map = new Map('map');
  const threeTest = new ThreeTest(document.getElementById('map'));
}

document.addEventListener('DOMContentLoaded', initScreen, false);