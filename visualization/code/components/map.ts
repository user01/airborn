
/// <reference path="../../typings/references.d.ts" />


// import * as R from 'ramda';
// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import * as mapboxgl from 'mapbox-gl';
// import * as d3 from 'd3';
// import * as topojson from 'topojson';


/** Main Map Element
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
      // center: [-0.1, 51.5119112],
      zoom: 13
      // zoom: 10.5,
    });

    // this.map.scrollZoom.disable()
    // this.map.addControl(new mapboxgl.Navigation());


    setTimeout(() => {
      console.log('Flying!');

      this.map.flyTo({
        // These options control the ending camera position: centered at
        // the target, at zoom level 9, and north up.
        center: [-78.496034, 38.033096],
        zoom: 8,
        bearing: 0,

        // These options control the flight curve, making it move
        // slowly and zoom out almost completely before starting
        // to pan.
        speed: 1.5, // make the flying slow
        // speed: 0.2, // make the flying slow
        curve: 1, // change the speed at which it zooms out

        // This can be any easing function: it takes a number between
        // 0 and 1 and returns another number between 0 and 1.
        easing: (t) => {
          return t;
        }
      });
    }, 2000);

    // mapboxgl.accessToken = 'pk.eyJ1IjoiZW5qYWxvdCIsImEiOiJjaWhtdmxhNTIwb25zdHBsejk0NGdhODJhIn0.2-F2hS_oTZenAWc0BMf_uw'

    // //Setup mapbox-gl map
    // var map = new mapboxgl.Map({
    //   container: 'map', // container id
    //   style: 'mapbox://styles/enjalot/cihmvv7kg004v91kn22zjptsc',
    //   center: [-0.1, 51.5119112],
    //   zoom: 10.5,
    // });

    // map.scrollZoom.disable()
    // map.addControl(new mapboxgl.Navigation());

    // var bbox = document.body.getBoundingClientRect();
    // var width = bbox.width;
    // var height = bbox.height
    // // Setup our svg layer that we can manipulate with d3
    // var container = map.getCanvasContainer()

    // var canvas = <any>d3.select(container).append("canvas").node()
    // canvas.width = width;
    // canvas.height = height
    // var ctx = canvas.getContext('2d')
    // // we calculate the scale given mapbox state (derived from viewport-mercator-project's code)
    // // to define a d3 projection
    // function getD3() {
    //   var bbox = document.body.getBoundingClientRect();
    //   var center = map.getCenter();
    //   var zoom = map.getZoom();
    //   // 512 is hardcoded tile size, might need to be 256 or changed to suit your map config
    //   var scale = (512) * 0.5 / Math.PI * Math.pow(2, zoom);

    //   var d3projection = d3.geo.mercator()
    //     .center([center.lng, center.lat])
    //     .translate([bbox.width / 2, bbox.height / 2])
    //     .scale(scale);

    //   return d3projection;
    // }
    // // calculate the original d3 projection
    // var d3Projection = getD3();

    // var path = d3.geo.path()

    // var url = "http://enjalot.github.io/wwsd/data/UK/london_stations.topojson";
    // d3.json(url, function (err, data) {
    //   var points = topojson.feature(data, data.objects.london_stations)
    //   //console.log(data[0], getLL(data[0]), project(data[0]))



    //   function d3render() {
    //     d3Projection = getD3();
    //     path.projection(d3Projection)
    //     ctx.clearRect(0, 0, width, height)

    //     ctx.fillStyle = "#0082a3";
    //     ctx.strokeStyle = "#004d60"
    //     points.features.forEach(function (d) {
    //       var p = d3Projection(d.geometry.coordinates)
    //       ctx.beginPath()
    //       ctx.arc(p[0], p[1], 6, 0, Math.PI * 2)
    //       ctx.fill()
    //       ctx.stroke()
    //     })

    //   }

    //   // re-d3render our visualization whenever the view changes
    //   map.on("viewreset", function () {
    //     d3render()
    //   })
    //   map.on("move", function () {
    //     d3render()
    //   })

    //   // d3render our initial visualization
    //   d3render()
    // })
  }

}


export default Map;