
/// <reference path="../../typings/references.d.ts" />


import * as R from 'ramda';
import * as moment from 'moment';

import data from './local.data.tmp';
import colorlist from './color.list';
import Utility from './utility';

declare var topojson: any;

/**
*/
export class D3Map01 {

  private get CurrentTime() { return this.currentTime.clone(); }
  private currentTime: moment.Moment = moment().add(-4, 'hours');
  private timeFactor: number = 12;
  private tickLengthMs = 10000;
  private windowInMinutes: number = 120;

  private static transitionTime = 8500;

  private width: number;
  private height: number;
  private svg: d3.Selection<any>;
  private svgCircles: d3.Selection<any>;
  private svgLines: d3.Selection<any>;

  private currentRawPlaneData: Array<any> = [];
  private planeDots: Array<{ lon: number, lat: number, hex: string, fraction: number }> = [];
  private planeLines: Array<{
    hex: string,
    values: Array<{ lon: number, lat: number, fraction: number }>
  }> = [];
  private rawPlaneEndDate: moment.Moment;
  private rawPlaneStartDate: moment.Moment;

  constructor(private map: mapboxgl.Map, private rootElement: HTMLElement) {
    require('../../styles/d3.map.01.less');
    this.resize();
    this.computeDateRanges();
    this.fitMapToPoints();

    this.svg = d3.select(this.rootElement).append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      .attr("transform", "translate(0,0)");

    this.svgCircles = this.svg.append('g').attr('class', 'circles');
    this.svgLines = this.svg.append('g').attr('class', 'lines');

    this.tick();

    this.map.on("viewreset", this.renderPosition);
    this.map.on("move", this.renderPosition);
    document.addEventListener('DOMContentLoaded', () => {
      this.resize();
      this.renderPosition();
    }, false);
  }

  private resize = () => {
    const mapContainer = this.map.getContainer();
    this.width = mapContainer.clientWidth - 5;
    this.height = mapContainer.clientHeight - 5;
  }

  private computeDateRanges = () => {
    const dates = R.map(R.prop('date'), this.currentRawPlaneData);
    this.rawPlaneStartDate = moment.min(dates);
    this.rawPlaneEndDate = moment.max(dates);
  }

  private tick = () => {
    // on every tick
    console.log('  -- Tick --');
    this.loadDataIfRequired();

    this.currentTime.add(this.tickLengthMs * this.timeFactor, 'milliseconds');
    if (this.currentTime.isAfter(moment())) {
      this.currentTime = moment();
      this.timeFactor = 1;
    }
    this.resetData();
    setTimeout(this.tick, this.tickLengthMs);
  }

  private loadDataIfRequired = () => {
    const startDesiredTime = this.CurrentTime.add(-this.windowInMinutes, 'minutes');
    const endDesiredTime = this.CurrentTime.add(this.windowInMinutes, 'minutes');

    if (startDesiredTime.isBefore(this.rawPlaneStartDate)) {
      this.loadData(startDesiredTime, this.rawPlaneStartDate);
    }
    if (endDesiredTime.isAfter(this.rawPlaneEndDate)) {
      this.loadData(this.rawPlaneEndDate, endDesiredTime);
    }
  }

  private loadData = (start: moment.Moment, end: moment.Moment) => {
    console.log(`Loading data for ${start.format('h:mm:ss a')} ${end.format('h:mm:ss a')}`);
    const url = `https://alpha.codex10.com/airborn/planes/${start.toISOString()}/${end.toISOString()}/184a711d-2a72-4160-afa1-b46c26277184`;
    d3.json(url, (err, data: any) => {

      console.log('  ------------- New JSON');
      this.currentRawPlaneData = R.pipe(
        R.map((datum: any) => R.merge(datum, { date: moment(datum.date) })),
        R.concat(this.currentRawPlaneData)
        // R.uniq
      )(data);

      this.computeDateRanges();

      // now that data is up to date, call for a fresh draw
      this.resetData();
    });
  }

  private resetData = () => {

    console.log(`Entry count: ${this.currentRawPlaneData.length}`);

    const startTime = this.CurrentTime.add(-this.windowInMinutes, 'minutes');
    const activeTime = this.CurrentTime.add(-this.windowInMinutes * 0.2, 'minutes');
    const endTime = this.CurrentTime;

    const upToDateHexes = R.pipe(
      R.filter((d: any) => d.date.isAfter(activeTime)),
      R.map(R.prop('hex')),
      R.uniq
    )(this.currentRawPlaneData);

    this.planeDots = R.pipe(
      R.filter((d: any) => {
        return d.date.isSameOrAfter(startTime) && d.date.isSameOrBefore(endTime) && R.contains(d.hex, upToDateHexes);
      }),
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
    )(this.currentRawPlaneData);

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

    // console.log(this.planeDots);
    // console.log(this.planeLines);
    this.renderPosition();
    this.renderStyle();
    // setTimeout(this.loadData, 10000);


  }

  private renderPosition = () => {
    console.log('Rendering positions');

    // const planeHexes = R.pipe(R.map(R.prop('hex')), R.uniq)(this.planeDots);
    // const colorScale = d3.scale.ordinal()
    //   .domain(planeHexes)
    //   .range(R.take(planeHexes.length, colorlist));

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
      .attr('fill', (d) => { return Utility.ColorFromStr(d.hex); })
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
      .attr('stroke', d => Utility.ColorFromStr(d.hex))
      .attr("stroke-opacity", 0.05)
      .attr("class", `lineset line`);

    lines
      .attr("d", d => line(d.values));

    lines
      .exit()
      .remove();

    d3.select('#clock')
      .text(this.currentTime.format('h:mm'));
  }


  private renderStyle = () => {
    console.log('Rendering styles');


    const dots = this.svgCircles
      .selectAll('circle')
      .data(this.planeDots, R.prop('id'));


    dots
      .transition()
      .duration(D3Map01.transitionTime)
      .attr('r', (d) => {
        // const size = 0.05 * d.fraction;
        // return `${size}em`;
        return `${d.fraction * 0.4}em`;
      })

    dots.exit()
      .transition()
      .duration(D3Map01.transitionTime)
      .attr("r", 0)
      .remove();


    const lines = this.svgLines
      .selectAll('.lineset')
      .data(this.planeLines, R.prop('hex'));

    lines
      .transition()
      .duration(D3Map01.transitionTime)
      .attr("stroke-opacity", 1);

  }

  private fitMapToPoints = () => {
    this.map.fitBounds([[
      -78.872109,
      38.479597
    ], [
        -77.679644,
        37.888823
      ]],
      {
        linear: false,
        // This can be any easing function: it takes a number between
        // 0 and 1 and returns another number between 0 and 1.
        easing: (t) => {
          return t;
        }
      }

    );
  }

}


export default D3Map01;