
/// <reference path="../../typings/references.d.ts" />


// import * as R from 'ramda';
// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import * as mapboxgl from 'mapbox-gl';
// import * as d3 from 'd3';
// import * as topojson from 'topojson';


/**
*/
export class D3Test {

  private parent;
  private renderer;
  private scene;
  private camera;
  private controls;
  private width: number;
  private height: number;

  constructor(private rootElement: HTMLElement) {
    this.init();
    this.animate();
  }

  private setSize = () => {
    this.width = this.rootElement.clientWidth - 40;
    this.height = this.rootElement.clientHeight - 40;
    console.log(`Found size of ${this.width}x${this.height}`);
  }

  private init = () => {
    require('../../styles/d3.less');
    this.setSize();

    var margin = { top: 40, right: 40, bottom: 40, left: 40 },
      width = this.width - margin.left - margin.right,
      height = this.height - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
      .range([height, 0]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10, "%");

    var svg = d3.select(this.rootElement).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv("data.tsv", type, function (error, data) {
      if (error) throw error;

      x.domain(data.map(function (d) { return d.letter; }));
      y.domain([0, d3.max(data, function (d: any) { return d.frequency; })]);

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Frequency");

      svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d: any) { return x(d.letter); })
        .attr("width", x.rangeBand())
        .attr("y", function (d: any) { return y(d.frequency); })
        .attr("height", function (d: any) { return height - y(d.frequency); });
    });

    function type(d) {
      d.frequency = +d.frequency;
      return d;
    }



  }




  private animate = () => {

  }

}


export default D3Test;