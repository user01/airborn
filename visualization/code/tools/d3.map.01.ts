
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
  private svg: d3.Selection<any>;
  private svgCircles: d3.Selection<any>;
  private svgLines: d3.Selection<any>;

  private planeDots: Array<{ lon: number, lat: number, hex: string, fraction: number }> = [];
  private planeLines: Array<{
    hex: string,
    values: Array<{ lon: number, lat: number, fraction: number }>
  }> = [];

  constructor(private map: mapboxgl.Map, private rootElement: HTMLElement) {
    require('../../styles/d3.map.01.less');
    this.resize();

    this.svg = d3.select(this.rootElement).append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      .attr("transform", "translate(0,0)");

    this.svgCircles = this.svg.append('g').attr('class', 'circles');
    this.svgLines = this.svg.append('g').attr('class', 'lines');

    this.loadData();
    // this.renderChart();

    this.map.on("viewreset", this.renderPosition);
    this.map.on("move", this.renderPosition);
  }

  private resize = () => {
    const mapContainer = this.map.getContainer();
    this.width = mapContainer.clientWidth - 5;
    this.height = mapContainer.clientHeight - 5;
  }

  private loadData = () => {
    const url = 'https://alpha.codex10.com/airborn/planes/200/184a711d-2a72-4160-afa1-b46c26277184';
    d3.json(url, (err, data: any) => {

      console.log('  ------------- New JSON');

      const localData = R.map((datum: any) => R.merge(datum, { date: moment(datum.date) }), data);


      this.planeDots = R.pipe(
        R.groupBy(R.prop('hex')),
        R.values,
        R.map((entrySet: Array<any>) => {

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
              id: datum._id,
              lon: datum.lon,
              lat: datum.lat,
              hex: datum.hex,
              fraction: entrySet.length < 2 ? 0 : moment(datum.date).diff(minDate) / millisecondsRange,
              date: datum.date.valueOf()
            };
          }, entrySet);

        }),
        R.flatten
      )(localData);

      this.planeLines = <any>R.pipe(
        R.groupBy(R.prop('hex')),
        R.mapObjIndexed((values: Array<any>, hex, obj) => {
          return {
            hex,
            values: R.sortBy(R.prop('fraction'), values)
          };
        }),
        R.values
        // R.take(1)
      )(this.planeDots);

      console.log(this.planeDots);
      console.log(this.planeLines);
      // this.init();
      this.renderPosition();
      this.renderStyle();
      setTimeout(this.loadData, 10000);
    });
  }

  private renderPosition = () => {
    console.log('Rendering positions');

    const planeHexes = R.pipe(R.map(R.prop('hex')), R.uniq)(this.planeDots);
    const colorScale = d3.scale.ordinal()
      .domain(planeHexes)
      .range(R.take(planeHexes.length, colorlist));

    const zoom = this.map.getZoom();
    // 512 is hardcoded tile size, might need to be 256 or changed to suit your map config
    const scale = (512) * 0.5 / Math.PI * Math.pow(2, zoom);
    const center = this.map.getCenter();

    const d3projection = d3.geo.mercator()
      .center([center.lng, center.lat])
      .translate([this.width / 2, this.height / 2])
      .scale(scale);

    const dots = this.svgCircles
      .selectAll('circle')
      .data(this.planeDots, R.prop('id'));

    dots
      .enter()
      .append('circle')
      .attr('r', 0);

    dots
      .attr('fill', (d) => { return <string>colorScale(d.hex); })
      .attr('cx', (d) => d3projection([d.lon, d.lat])[0])
      .attr('cy', (d) => d3projection([d.lon, d.lat])[1])
      .style('cursor', 'pointer');

    dots.exit()
      .attr('class', 'exit')
      .remove();


    const line = d3.svg.line()
      .interpolate("cardinal")
      .x((d: any) => d3projection([d.lon, d.lat])[0])
      .y((d: any) => d3projection([d.lon, d.lat])[1]);

    const lines = this.svgLines
      .selectAll('.lineset')
      .data(this.planeLines, R.prop('hex'));

    lines
      .enter()
      .append('path')
      .attr('stroke', d => <string>colorScale(d.hex))
      .attr("class", `lineset line`);

    lines
      .attr("d", d => line(d.values));

    lines
      .exit()
      .remove();
  }


  private renderStyle = () => {
    console.log('Rendering styles');


    const dots = this.svgCircles
      .selectAll('circle')
      .data(this.planeDots, R.prop('id'));


    dots
      .transition()
      .duration(8500)
      .attr('r', (d) => {
        // const size = 0.05 * d.fraction;
        // return `${size}em`;
        return `${d.fraction * 0.4}em`;
      })

    dots.exit()
      .transition()
      .duration(2500)
      .attr("r", 0)
      .remove();
  }

}


export default D3Map01;