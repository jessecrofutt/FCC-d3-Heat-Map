var d3 = require('d3');
import _ from 'lodash';
import './style/style.sass';

let url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';
let tooltip = d3.select("body")
    .append("div")
    .attr("class" , "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("no data");

d3.json(url, (jsonData) => {

    let data = jsonData;
    let baseTemp = data.baseTemperature;
    let monthlyVariance = data.monthlyVariance.slice();

    let maxTemp = d3.max(monthlyVariance, function(d) { return d.variance; });
    let minTemp = d3.min(monthlyVariance, function(d) { return d.variance; });

    let keyArray = [];
    for (let i = Math.floor(minTemp); i < Math.ceil(maxTemp + 1); i++){
        keyArray.push(i);
    };

    console.log("keyArray: " + keyArray);
    console.log("maxTemp: " + maxTemp);
    console.log("minTemp: " + minTemp );
    console.log("data" + data);
    console.log("baseTemp" + baseTemp);
    console.log("monthlyVariance[1]" + monthlyVariance[1].month);

      // set the dimensions of the canvas
    let margin = {top: 80, right: 40, bottom: 50, left: 70},
      width = 860 - margin.left - margin.right,
      height = 480 - margin.top - margin.bottom;

      // set the ranges
    let x = d3.scaleLinear().range([0, width]);
    let x2 = d3.scaleLinear().range([0, 10 * keyArray.length]);
    let y = d3.scaleLinear().range([height, 0]);

    let formatMonth = d3.timeFormat("%B");
    let monthFormatter = function(monthNumber) {
        let date = new Date(1111, monthNumber-1, 1);
        return formatMonth(date);
    };

      // define the x axis
    let xAxis = d3.axisBottom()
        .scale(x)
        .tickSize(4)
        .tickFormat(d3.format("d"));

    let xAxis2 = d3.axisBottom()
        .scale(x2)
        .tickSize(0);

        // define the y axis
    let yAxis = d3.axisLeft()
        .scale(y)
        .tickSize(0)
        .tickFormat(monthFormatter);

        // add the SVG element
    let svg = d3.select("body").append("svg")
        .attr("id", "svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // scale the range of the data
    x.domain([d3.min(monthlyVariance, function(d) { return d.year; }), d3.max(monthlyVariance, function(d) { return d.year; })]);
    x2.domain(d3.extent(keyArray));
    y.domain([d3.max(monthlyVariance, function(d) { return d.month; }), d3.min(monthlyVariance, function(d) { return d.month; })]);

      //title
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top/1.3))
        .attr("text-anchor", "middle")
        .style("font-size", "1.0em")
        .style("text-decoration", "none")
        .text("Monthly Global Land-Surface Temperature");

        //subtitle
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top/1.7))
        .attr("text-anchor", "middle")
        .style("font-size", ".7em")
        .style("text-decoration", "none")
        .html("1753-2015");

    let axisTitles = "0.9em";
        //yAxis title
    svg.append("text")
        .attr("x", -100)
        .attr("y", -40)
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .style("font-size", axisTitles)
        .style("text-decoration", "none")
        .html("Month");

        //xAxis title
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", height + 30)
        .attr("text-anchor", "middle")
        .style("font-size", axisTitles)
        .style("text-decoration", "none")
        .html("Year");



        // add x axis
    svg.append("g")
        .attr("class", "xAxis")
        .style("font-size","0.5em")
        .call(xAxis)
        .attr("transform", "translate(0," + (height + 2) + ")")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "1em")
        .attr("dy", "0.5em");

        // add y axis
    svg.append("g")
        .attr("class", "yAxis")
        .style("font-size","0.5em")
        .call(yAxis)
        .attr("transform", "translate(0,-20)")
        .append("text");

    let node = svg.selectAll(".bar")
        .data(monthlyVariance)
        .enter()
      .append("g")
        .attr("class", "node");

    node.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {return x(d.year)})
        .attr("width", Math.ceil(width/monthlyVariance.length/12)+0.5)
        .attr("y", function (d) {return  (y(d.month)-30)})
        .attr("height",  height/12 + 2)
        .style("fill", function(d) {
            let red = 0;
            let blue = 0;
            let green = 200;
            let opacity = 1;
            if (d.variance >= 0 ){
                red = Math.ceil(d.variance * 255/(maxTemp + 0.01));
                green -= red;
            } else {
                blue = Math.ceil(d.variance * 255/(minTemp + 0.01));
                green -= blue;
            }

            return "rgb("+(255-blue)+", "+green+","+(255-red)+")";
        })
        .on("mouseover", function(d){
            d3.select(this)
                .attr("class", "barSelected")
            tooltip.style("visibility", "visible")
                .style("font-size", "0.6em")
                .style("top", (d3.event.pageY + 10) + "px")
                .style("left", (d3.event.pageX) + "px")
                .html(""+monthFormatter(d.month)+" "+d.year + "<br/>" +
                    "Average Temp: "+(+(baseTemp + d.variance).toFixed(2)) + "&degC<br/>"+
                    "Variance: "+(+(d.variance).toFixed(2)) + "&degC<br/>");
        })
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        .on("mouseout", function(){
            d3.select(this);
            tooltip.style("visibility", "hidden");
        })

    svg.selectAll("key")
        .data(keyArray)
        .enter().append("rect")
        .attr("class", "key")
        .attr("x", function(d) {return (d*11)+180})
        .attr("width", 11)
        .attr("y", height + 19)
        .attr("height",  10)
        .style("fill", function(d) {
            let red = 0;
            let blue = 0;
            let green = 200;
            let opacity = 1;
            if (d >= 0 ){
                red = Math.ceil(d * 255/(maxTemp + 0.01));
                green -= red;
            } else {
                blue = Math.ceil(d * 255/(minTemp + 0.01));
                green -= blue;
            }
            return "rgb("+(255-blue)+", "+green+","+(255-red)+")";
        })

    //key description
    let keyOffsetX = 50;
    let keyLineSpacing = 8;
    svg.append("text")
        .attr("x", keyOffsetX)
        .attr("y", height + 24)
        .attr("text-anchor", "middle")
        .style("font-size", "0.5em")
        .style("text-decoration", "none")
        .html("Temperature variance")
        .append("tspan")
            .attr("x", keyOffsetX)
            .attr("dy", keyLineSpacing)
            .html("from base temp of "+baseTemp+"")
            .append("tspan")
                .attr("x", keyOffsetX)
                .attr("dy", keyLineSpacing)
                .html("degrees Celcius.");

        //key axis
    svg.append("g")
        .attr("class", "xAxis")
        .style("font-size","0.5em")
        .call(xAxis2)
        .attr("transform", "translate(107," + (height + 29)  + ")")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dy", ".8em")
        .attr("dx", ".5em");



});