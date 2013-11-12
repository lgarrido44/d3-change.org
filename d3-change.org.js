var height = window.innerHeight - 10;
var width  = height + 100;

var zoom = d3.behavior.zoom()
    .on("zoom", zoom);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");
    // .call(zoom)
    // .append("g");

var projection = d3.geo.albers()
    .center([1, 46.5])
    .rotate([-2, 0])
    .parallels([30, 50])
    .scale(3900 *(height/700))
    .translate([width/2, height/2]);

var path = d3.geo.path()
    .projection(projection);

var color = d3.scale.threshold()
    .domain([0, 2, 5, 10, 15, 20, 25])
    .range(["#ffffff", "#f7fbff", "#c6dbef", "#6baed6", "#2171B5", "#08519C", "#08306B"]);

// Color scale legend
var x = d3.scale.linear()
    .domain([0, 25])
    .range([0, 200]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(13)
    .tickValues(color.domain());

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(40,40)");

g.selectAll("rect").data(color.range().map(function(d, i) {
    return {
        x0: i ? x(color.domain()[i - 1]) : x.range()[0],
        x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
        z: d
    };
}))
    .enter().append("rect")
    .attr("height", 10)
    .attr("x", function(d) { return d.x0; })
    .attr("width", function(d) { return d.x1 - d.x0; })
    .style("fill", function(d) { return d.z; });

g.call(xAxis).append("text")
    .attr("class", "caption")
    .attr("y", -6)
    .text("Nombre de signatures pour 10 000 habitants");

// Parsing data from tsv and json geo file
var tooltip = d3.select("body")
    .append("div").attr("class", "tooltip")
    .style("z-index", "10")
    .style("visibility", "hidden");

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
        .style("fill", function(d) {
            return color(rateDpt.get(d.properties.CODE_DEPT));
        })
        .on("mouseover", function(d) {
            var code_dpt = d.properties.CODE_DEPT;
            var rate_dpt = rateDpt.get(d.properties.CODE_DEPT);
            tooltip .html(d.properties.NOM_DEPT + "<br>" + rate_dpt + "&#8241");
            return tooltip
                .style("background", color(rate_dpt))
                .style("visibility", "visible");
        })
	.on("mousemove", function() {
            return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
        })
	.on("mouseout", function() {
            return tooltip.style("visibility", "hidden");
        })
        .attr("d", path);
}

function zoom() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}
