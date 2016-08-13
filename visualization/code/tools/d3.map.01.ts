
/// <reference path="../../typings/references.d.ts" />


// import * as R from 'ramda';
// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import * as mapboxgl from 'mapbox-gl';
// import * as d3 from 'd3';
// import * as topojson from 'topojson';

declare var topojson: any;

/**
*/
export class D3Map01 {

  private parent;
  private renderer;
  private scene;
  private camera;
  private controls;
  private width: number;
  private height: number;

  constructor(private map: any) {
    this.init();
    this.animate();
  }


  private init = () => {
    require('../../styles/d3.map.01.less');



    var bbox = document.body.getBoundingClientRect();
    var width = bbox.width;
    var height = bbox.height
    // Setup our svg layer that we can manipulate with d3
    var container = this.map.getCanvasContainer()

    var canvas: any = d3.select(container).append("canvas").node()
    canvas.width = width;
    canvas.height = height
    var ctx = canvas.getContext('2d')
    // we calculate the scale given mapbox state (derived from viewport-mercator-project's code)
    // to define a d3 projection
    const getD3 = () => {
      var bbox = document.body.getBoundingClientRect();
      var center = this.map.getCenter();
      var zoom = this.map.getZoom();
      // 512 is hardcoded tile size, might need to be 256 or changed to suit your map config
      var scale = (512) * 0.5 / Math.PI * Math.pow(2, zoom);

      var d3projection = d3.geo.mercator()
        .center([center.lng, center.lat])
        .translate([bbox.width / 2, bbox.height / 2])
        .scale(scale);

      return d3projection;
    }
    // calculate the original d3 projection
    var d3Projection = getD3();

    var path = d3.geo.path()

    var url = "london_stations.topojson";
    d3.json(url, (err, data) => {
      var points = topojson.feature(data, data.objects.london_stations)
      // console.log(data[0], getLL(data[0]), project(data[0]))
      console.log(`Loaded ${data.length} elements`);


      const render = () => {
        d3Projection = getD3();
        path.projection(d3Projection)
        ctx.clearRect(0, 0, width, height)

        ctx.fillStyle = "#0082a3";
        ctx.strokeStyle = "#004d60"
        points.features.forEach((d) => {
          var p = d3Projection(d.geometry.coordinates)
          ctx.beginPath()
          ctx.arc(p[0], p[1], 6, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        })

      }

      // re-render our visualization whenever the view changes
      this.map.on("viewreset", () => {
        render()
      })
      this.map.on("move", () => {
        render()
      })

      // render our initial visualization
      render()
    })




  }

  private animate = () => {

  }

}


export default D3Map01;