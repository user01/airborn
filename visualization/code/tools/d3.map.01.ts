
/// <reference path="../../typings/references.d.ts" />


import * as R from 'ramda';
// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import * as mapboxgl from 'mapbox-gl';
// import * as d3 from 'd3';
// import * as topojson from 'topojson';
import * as moment from 'moment';

import data from './local.data.tmp';
import colorlist from './color.list';

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

  private planeDots: Array<{ lon: number, lat: number }> = [];

  constructor(private map: any) {
    this.loadData();
  }


  private init = () => {
    require('../../styles/d3.map.01.less');



    const bbox = document.body.getBoundingClientRect();
    const width = bbox.width;
    const height = bbox.height
    // Setup our svg layer that we can manipulate with d3
    const container = this.map.getCanvasContainer()

    const canvas: any = d3.select(container).append("canvas").node();
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    // we calculate the scale given mapbox state (derived from viewport-mercator-project's code)
    // to define a d3 projection
    const getD3 = () => {
      const bbox = document.body.getBoundingClientRect();
      const center = this.map.getCenter();
      const zoom = this.map.getZoom();
      // 512 is hardcoded tile size, might need to be 256 or changed to suit your map config
      const scale = (512) * 0.5 / Math.PI * Math.pow(2, zoom);

      const d3projection = d3.geo.mercator()
        .center([center.lng, center.lat])
        .translate([bbox.width / 2, bbox.height / 2])
        .scale(scale);

      return d3projection;
    }
    // calculate the original d3 projection
    var d3Projection = getD3();

    const render = () => {
      d3Projection = getD3();
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#0082a3";
      ctx.strokeStyle = "#004d60";

      const planeHexes = R.pipe(R.map(R.prop('hex')), R.uniq)(this.planeDots);
      const colorScale = d3.scale.ordinal()
        .domain(planeHexes)
        .range(R.take(planeHexes.length, colorlist));


      const groupedPlanes = R.pipe(
        R.groupBy(R.prop('hex')),
        R.values,
        R.map((planeSet: Array<{ lon: number, lat: number, hex: string, fraction: number, date: number }>) => {
          const hex = R.pipe(R.head, R.prop('hex'))(planeSet);
          planeSet = R.sortBy(
            R.prop('fraction'),
            planeSet
          );
          ctx.fillStyle = colorScale(hex);
          ctx.strokeStyle = "#004d60";
          ctx.strokeStyle = ctx.fillStyle;
          planeSet.forEach((d) => {
            const p = d3Projection([d.lon, d.lat]);
            ctx.beginPath();
            ctx.arc(p[0], p[1], 1 + this.map.getZoom() * 0.5 * d.fraction, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          });

          // Draw the path
          ctx.beginPath();
          planeSet.forEach((d) => {
            const p = d3Projection([d.lon, d.lat]);
            ctx.lineTo(p[0], p[1]);
          });
          ctx.stroke();

        })
      )(this.planeDots);

    };

    // re-render our visualization whenever the view changes
    this.map.on("viewreset", () => {
      render();
    })
    this.map.on("move", () => {
      render();
    })

    // render our initial visualization
    render();
  }

  private loadData = () => {
    const url = 'https://alpha.codex10.com/airborn/planes/40/184a711d-2a72-4160-afa1-b46c26277184';
    d3.json(url, (err, data: any) => {

      const localData = R.map((datum: any) => R.merge(datum, { date: moment(datum.date) }), data);


      this.planeDots = R.pipe(
        R.groupBy(R.prop('hex')),
        R.values,
        R.map((entrySet) => {

          const minDate =
            (<any>R.pipe)(
              R.map(R.prop('date')),
              moment.min
            )(entrySet);
          const maxDate =
            (<any>R.pipe)(
              R.map(R.prop('date')),
              moment.max
            )(entrySet);
          const millisecondsRange = maxDate.diff(minDate);

          return R.map((datum: any) => {
            return {
              lon: datum.lon,
              lat: datum.lat,
              hex: datum.hex,
              fraction: moment(datum.date).diff(minDate) / millisecondsRange,
              date: datum.date.valueOf()
            };
          }, entrySet);

        }),
        R.flatten
      )(localData);

      this.init();
    });
  }

}


export default D3Map01;