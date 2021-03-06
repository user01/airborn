/// <reference path="../../typings/references.d.ts" />

import * as R from 'ramda';
import * as moment from 'moment';
declare var topojson: any;

import colorlist from './color.list';
import {Utility, MapPlan} from './utility';

export class D3PlaneMap {

  private get CurrentTime() { return this.currentTime.clone(); }
  // private earliestTime: moment.Moment = moment().add(-12, 'hours'); //TODO: Switch this to 24 hours
  private earliestTime: moment.Moment = moment().add(-24, 'hours'); //TODO: Switch this to 24 hours
  private currentTime = this.earliestTime.clone();

  private plan: MapPlan = {
    index: '',
    timeFactor: 45,
    loop: false,
    controller: ''
  };
  // private timeFactor: number = 45;
  private tickLengthMs = 300;
  private cmdLengthMs = 5000;
  private windowInMinutes: number = 120;

  private static transitionTime = 300;

  private width: number;
  private height: number;
  private svg: d3.Selection<any>;
  private svgCircles: d3.Selection<any>;
  private svgLines: d3.Selection<any>;
  private svgPlanes: d3.Selection<any>;

  private currentRawPlaneData: Array<any> = [];
  private planeDots: Array<{ lon: number, lat: number, hex: string, fraction: number }> = [];
  private planePlanes: Array<{ lon: number, lat: number, hex: string }> = [];
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
      .attr("transform", "translate(0,0)");

    this.svgCircles = this.svg.append('g').attr('class', 'circles');
    this.svgLines = this.svg.append('g').attr('class', 'lines');
    this.svgPlanes = this.svg.append('g').attr('class', 'planes');

    this.tick();
    this.tickCmd();

    this.map.on("viewreset", this.renderPosition);
    this.map.on("move", this.renderPosition);
    window.addEventListener('resize', () => {
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

  /** Ticks are the chance to make logical updates */
  private tick = () => {
    console.log(`  -- Tick --  ${this.tickLengthMs * this.plan.timeFactor} ms`);
    this.loadDataIfRequired();

    this.currentTime.add(this.tickLengthMs * this.plan.timeFactor, 'milliseconds');
    if (this.currentTime.isAfter(moment())) {
      console.log('Past current time');
      if (this.plan.loop) {
        this.currentTime = this.earliestTime.clone();
      } else {
        this.currentTime = moment();
        this.plan.timeFactor = 1;
      }
    }
    this.resetData();
    setTimeout(this.tick, this.tickLengthMs);
  }

  private tickCmd = () => {
    d3.json("https://beta.codex10.com/airborn/mapstate", (err, plan: MapPlan) => {
      if (err) {
        console.warn('Unable to get map state', err);
        return;
      }
      if (R.equals(plan, this.plan)) {
        return;
      }
      console.log('Heard new plan!', plan)

      d3.select('#feedback')
        .text(D3PlaneMap.feedbackMessage(this.plan, plan))
        .transition()
        .duration(500)
        .style('opacity', 1)
        .duration(8000)
        .transition()
        .duration(6000)
        .style('opacity', 0);

      this.plan = plan;
    });
    setTimeout(this.tickCmd, this.cmdLengthMs);
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
    // console.log(`Loading data for ${start.format('h:mm:ss a')} ${end.format('h:mm:ss a')}`);
    const url = `https://beta.codex10.com/airborn/planes/${start.toISOString()}/${end.toISOString()}/184a711d-2a72-4160-afa1-b46c26277184`;
    // console.log(url);
    d3.json(url, (err, data: any) => {
      if (err) {
        console.error('Pull error', err);
        return;
      }

      // console.log('  ------------- New JSON');
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

    // console.log(`Entry count: ${this.currentRawPlaneData.length}`);

    const startTime = this.CurrentTime.add(-this.windowInMinutes, 'minutes');
    const activeTime = this.CurrentTime.add(-this.windowInMinutes * 0.2, 'minutes');
    const endTime = this.CurrentTime;

    const timeScale = d3.scale.linear()
      .domain([0, this.windowInMinutes * 0.5, this.windowInMinutes * 2])
      .range([0, 0.08, 0.8]).clamp(true);
    const totalMinutes = endTime.diff(activeTime, 'minutes');
    // console.log(`Total minutes ${totalMinutes}`);
    // console.log(`0 ${timeScale(0)} / 0.2 ${timeScale(this.windowInMinutes * 0.2)} / 1.2 ${timeScale(this.windowInMinutes * 1.2)} / 2.2 ${timeScale(this.windowInMinutes * 2.2)} `);

    // console.log('domain', [this.windowInMinutes * 2 * 60 * 1000, 0])

    const upToDateHexes = R.pipe(
      R.filter((d: any) => d.date.isAfter(activeTime)),
      R.map(R.prop('hex')),
      R.uniq
    )(this.currentRawPlaneData);

    const planeDatas = R.pipe(
      R.filter((d: any) => {
        return d.date.isSameOrAfter(startTime) && d.date.isSameOrBefore(endTime) && R.contains(d.hex, upToDateHexes);
      }),
      R.groupBy(R.prop('hex')),
      R.values,
      R.map((entrySet: Array<any>) => {

        const dataSet = R.pipe(
          R.map((datum: any) => {
            const minutes = datum.date.diff(activeTime, 'minutes');
            const fraction = minutes < 0 ? 0 : minutes / totalMinutes;
            return {
              id: datum._id,
              lon: datum.lon,
              lat: datum.lat,
              hex: datum.hex,
              track: datum.track,
              fraction,
              date: datum.date.valueOf()
            };
          }),
          R.sortBy(R.prop('date')),
          R.reverse
        )(entrySet);
        return {
          dots: R.tail(dataSet),
          plane: R.head(dataSet)
        };
      })
    )(this.currentRawPlaneData);

    this.planeDots = R.pipe(
      R.map(R.prop('dots')),
      R.flatten
    )(planeDatas);
    this.planePlanes = R.pipe(
      R.map(R.prop('plane'))
    )(planeDatas);

    this.planeLines = <any>R.pipe(
      R.groupBy(R.prop('hex')),
      R.mapObjIndexed((values: Array<any>, hex, obj) => {
        return {
          hex,
          values: R.sortBy(R.prop('date'), values)
        };
      }),
      R.values
      // R.take(1)
    )(this.planeDots);

    // console.log(R.map(R.prop('fraction'), this.planeDots));
    // console.log(R.map(R.prop('fraction2'), this.planeDots));
    // console.log(this.planeLines);
    this.renderPosition();
    this.renderStyle();
    // setTimeout(this.loadData, 10000);


  }

  private renderPosition = () => {
    // console.log('Rendering positions');

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
      .selectAll('circle.dot')
      .data(this.planeDots, R.prop('id'));

    dots
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('r', 0);

    dots
      .attr('fill', (d) => { return Utility.ColorFromStr(d.hex); })
      .attr('cx', (d) => d3projection([d.lon, d.lat])[0])
      .attr('cy', (d) => d3projection([d.lon, d.lat])[1])
      .style('cursor', 'pointer');

    dots.exit()
      .attr('class', 'exit')
      .transition()
      .duration(D3PlaneMap.transitionTime)
      .attr('r', 0)
      .remove();


    const line = d3.svg.line()
      .interpolate("linear")
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
      .attr("stroke-width", '0.5px')
      .attr("class", `lineset line`);

    lines
      .attr("stroke-width", '0.2em')
      .attr("d", d => line(d.values));

    lines
      .exit()
      .transition()
      .duration(D3PlaneMap.transitionTime)
      .attr("stroke-opacity", 0)
      .remove();


    // console.log(this.planePlanes);

    const planes = this.svgPlanes
      .selectAll('text.plane')
      .data(this.planePlanes, R.prop('id'));

    planes
      .enter()
      .append('text')
      .attr('class', 'plane')
      .attr('font-size', '2em')
      .style({
        'text-shadow': `
                      -0.03em -0.03em 0 white,
                      0.03em -0.03em 0 white,
                      -0.03em 0.03em 0 white,
                      0.03em 0.03em 0 white
                      ` })
      .attr('font-family', 'FontAwesome')
      .text('\uf072')
      .attr('x', (d) => d3projection([d.lon, d.lat])[0])
      .attr('y', (d) => d3projection([d.lon, d.lat])[1])
      .attr('transform', (d, i) => `rotate(${d.track - 45},${d3projection([d.lon, d.lat])[0]},${d3projection([d.lon, d.lat])[1]})`)
      .attr('fill', (d) => { return Utility.ColorFromStr(d.hex); })
      .attr('text-anchor', 'middle');

    planes
      .transition()
      .duration(D3PlaneMap.transitionTime)
      .attr('transform', (d, i) => `rotate(${d.track - 45},${d3projection([d.lon, d.lat])[0]},${d3projection([d.lon, d.lat])[1]})`)
      .attr('x', (d) => d3projection([d.lon, d.lat])[0])
      .attr('y', (d) => d3projection([d.lon, d.lat])[1]);


    planes.exit()
      .attr('class', 'exit')
      .transition()
      .duration(D3PlaneMap.transitionTime)
      .attr('opacity', 0)
      .remove();

    d3.select('#clock')
      .text(this.renderClockText());
  }


  private renderStyle = () => {
    // console.log('Rendering styles');


    const dots = this.svgCircles
      .selectAll('circle.dot')
      .data(this.planeDots, R.prop('id'));


    dots
      .transition()
      .duration(D3PlaneMap.transitionTime)
      .attr('r', (d) => {
        // const size = 0.05 * d.fraction;
        // return `${size}em`;
        return `${d.fraction * 0.4}em`;
      })

    dots.exit()
      .transition()
      .duration(D3PlaneMap.transitionTime)
      .attr("r", 0)
      .remove();


    const lines = this.svgLines
      .selectAll('.lineset')
      .data(this.planeLines, R.prop('hex'));

    lines
      .transition()
      .duration(D3PlaneMap.transitionTime)
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

  private renderClockText = () => {
    const now = moment();
    if (Math.abs(now.diff(this.currentTime, 'seconds')) < 60) {
      return 'Live';
    }
    if (now.dayOfYear() == this.currentTime.dayOfYear()) {
      //today
      return this.currentTime.format('h:mma');
    }
    if (now.dayOfYear() - 1 == this.currentTime.dayOfYear()) {
      // yesterday
      return `Yesterday ${this.currentTime.format('h:mma')}`;
    }
    if (now.dayOfYear() - 7 <= this.currentTime.dayOfYear()) {
      // within a week
      return this.currentTime.format('dddd h:mma');
    }
    return this.currentTime.format('MMMM D h:mma');
  }

  private static feedbackMessage = (
    currentPlan: MapPlan,
    newPlan: MapPlan) => {
    const name = R.pipe(
      R.trim,
      D3PlaneMap.capitalizeFirstLetter
    )(newPlan.controller);
    if (name == 'Erik' || name == '') { return ''; }
    if (currentPlan.timeFactor < newPlan.timeFactor) {
      return `${name} sped up time to ${Math.floor(newPlan.timeFactor)}x`;
    }
    if (currentPlan.timeFactor > newPlan.timeFactor) {
      return `${name} slowed time to ${Math.floor(newPlan.timeFactor)}x`;
    }
    if (currentPlan.loop != newPlan.loop) {
      if (newPlan.loop) {
        return `${name} looped time`;
      } else {
        return `${name} unlooped time`;
      }
    }
    return '';
  }

  private static capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

}


export default D3PlaneMap;