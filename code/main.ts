
import Map from './components/map.tsx'


const initScreen = () => {
  console.log('Screen online');
  const map = new Map(document.getElementById('map'));
}

document.addEventListener('DOMContentLoaded', initScreen, false);