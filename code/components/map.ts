
/// <reference path="../../typings/references.d.ts" />


// import * as R from 'ramda';
// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import * as mapboxgl from 'mapbox-gl';


/** Main Map Element
*/
export class Map {


  constructor(private rootElement: HTMLElement) {
    this.render();
  }

  private render = () => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoicm9vdDc3IiwiYSI6ImNpcm1zdzNsdDA4eGZmbG04YXVrc2ttMHYifQ.Xh7pNJm_GMFLrHMVCguMrw';
    var map = new mapboxgl.Map({
      container: this.rootElement,
      style: 'mapbox://styles/root77/cirmswz9m0000g5nl6lbfih36',
      // maxZoom: 15,
      // zoom: 15,
      attributionControl: false,
      center: [-75.284247, 40.528183],
      // center: [-122.420679, 37.772537],
      zoom: 13
    });
    // ReactDOM.render(
    //   (<div>
    //     <p>Map will be here</p>
    //   </div>), this.rootElement);
  }

}


export default Map;