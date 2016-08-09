
import Map from './components/map'


const initScreen = () => {
  console.log('Screen online');
  require('../styles/main.less');
  const map = new Map(document.getElementById('map'));
  // const map = new Map('map');
}

document.addEventListener('DOMContentLoaded', initScreen, false);