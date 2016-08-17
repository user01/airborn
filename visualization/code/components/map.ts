/// <reference path="../../typings/references.d.ts" />

import * as mapboxgl from 'mapbox-gl';

/** Mapbox Custom Map Element
*/
export class Map {

  public map: mapboxgl.Map;

  constructor(private rootElement: HTMLElement) {
    this.render();
  }

  private render = () => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoicm9vdDc3IiwiYSI6ImNpcm1zdzNsdDA4eGZmbG04YXVrc2ttMHYifQ.Xh7pNJm_GMFLrHMVCguMrw';
    this.map = new mapboxgl.Map({
      container: this.rootElement,
      style: 'mapbox://styles/root77/cirmswz9m0000g5nl6lbfih36',
      attributionControl: false,
      center: [-78.496234, 38.033056],
      zoom: 13
    });
  }

}


export default Map;