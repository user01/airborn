
/// <reference path="../../typings/references.d.ts" />


// import * as R from 'ramda';
// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import * as mapboxgl from 'mapbox-gl';
// import * as d3 from 'd3';
// import * as topojson from 'topojson';


/** 
*/
export class ThreeTest {

  private parent;
  private renderer;
  private scene;
  private camera;
  private controls;

  constructor(private rootElement: HTMLElement) {
    this.init();
    this.animate();
  }

  private init = () => {
    const threeDomElm = document.getElementById('designer');
    var wdt = 405;
    var hgh = 250;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, wdt / hgh, 0.1, 1000);

    var renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(wdt, hgh);
    document.getElementById('designer').appendChild(renderer.domElement);

    var geometry = new THREE.CubeGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;
    camera.lookAt(cube.position);
    scene.add(camera);

    var render = function () {
      requestAnimationFrame(render);

      cube.rotation.x += 0.1;
      cube.rotation.y += 0.1;

      renderer.render(scene, camera);
    };

    render();
  }




  private animate = () => {

  }

}


export default ThreeTest;