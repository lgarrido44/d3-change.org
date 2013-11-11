var height = window.innerHeight - 10;
var width = height + 100;

var zoom = d3.behavior.zoom()
    .on("zoom", zoom);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .call(zoom)
    .append("g");

var projection = d3.geo.albers()
    .center([1, 46.5])
    .rotate([-2, 0])
    .parallels([30, 50])
    .scale(3900 *(height/700))
    .translate([width/2, height/2]);

var path = d3.geo.path()
    .projection(projection);

var quantize = d3.scale.quantize()
    .domain([0, 25])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

var rateDpt = d3.map();

queue()
    .defer(d3.json, "json/departement.json")
    .defer(d3.tsv,  "data/rate.tsv", function(d) { rateDpt.set(d.code, +d.rate); })
    .await(ready);

function ready(error, departement) {
    svg.append("g")
        .attr("class", "departement")
        .selectAll("path")
        .data(departement.features)
        .enter().append("path")
        .attr("class", function(d) {
            return quantize(rateDpt.get(d.properties.CODE_DEPT));
        })
        .attr("d", path);
}

function zoom() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}
