$(document).ready(function() {
    console.log("Hello world.")
});
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear().range([0, width]);

var y = d3.scale.linear().range([height, 0]);

var color = d3.scale.ordinal()
    .domain([1, 2, 3])
    .range(["rgb(53,135,212)", "rgb(77, 175, 74)", "rgb(228, 26, 28)"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var theData = {};
var currYear = 1985;

d3.csv("js/baseballstats.csv", function(error, data) {
  console.log(data);

  data = data.filter(function(d){
  	return + d.Year >= 1985;
  })

  data.forEach(function(d) {
    d.wins =+ d.W;
    d.attendance =+ d.Attendance;
    d.payroll =+ d.Payroll;

    if (!theData[d.Year]) {
    	theData[d.Year] = [];
    }
    theData[d.Year].push(d);
  });

  x.domain(d3.extent(data, function(d) { return d.wins; })).nice();
  y.domain(d3.extent(data, function(d) { return d.attendance; })).nice();

setNav();
drawChart();

});

function setNav(){
  $("#slider").on("change", function() {
      var val = $("#slider").val();
      console.log(val);
      currYear = val;
      d3.select('#slidertext').text(currYear);
      updateChart();
  });
	$(".btn").on("click", function(){
		var val = $(this).attr("val");
		currYear = val;
		updateChart();
	});
}

function drawChart(){
	
	  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Wins (# per Year)");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Season Attendance (# of fans)")

    //legend y position
  var LYP = 160, 
    LXP = 800;
    
  svg.append("text").attr("class", "label").attr("x", LXP - 5).attr("y", LYP).text("Division").style("font-weight", "bold");

  //color legend
  svg.append("circle").attr("cx", LXP).attr("cy", LYP + 20).attr("r", 12).style("fill", "rgb(53, 135, 212)").attr("stroke", "#000");
  svg.append("text").attr("class", "label").attr("x", LXP + 15).attr("y", LYP + 25).style("text-anchor", "start").text(function(d) {
    return "AL/NL West";
  });
  svg.append("circle").attr("cx", LXP).attr("cy", LYP + 50).attr("r", 12).style("fill", "rgb(77, 175, 74)").attr("stroke", "#000");
  svg.append("text").attr("class", "label").attr("x", LXP + 15).attr("y", LYP + 55).style("text-anchor", "start").text(function(d) {
    return "AL/NL Central";
  });
  svg.append("circle").attr("cx", LXP).attr("cy", LYP + 80).attr("r", 12).style("fill", "rgb(228, 26, 28)").attr("stroke", "#000");
  svg.append("text").attr("class", "label").attr("x", LXP + 15).attr("y", LYP + 85).style("text-anchor", "start").text(function(d) {
    return "AL/NL East";
  });
  svg.append("text").attr("class", "label").attr("x", LXP - 5).attr("y", LYP + 110).text("Payroll").style("font-weight", "bold");

  //size legend
  svg.append("circle").attr("cx", LXP).attr("cy", LYP + 30 + 110).attr("r", 25).style("fill", "#bbb").attr("stroke", "#000");
  svg.append("text").attr("class", "label").attr("x", LXP + 30).attr("y", LYP + 140).style("text-anchor", "start").text("$100 mill+");
  svg.append("circle").attr("cx", LXP).attr("cy", LYP + 60 + 110).attr("r", 20).style("fill", "#bbb").attr("stroke", "#000");
  svg.append("text").attr("class", "label").attr("x", LXP + 30).attr("y", LYP + 170).style("text-anchor", "start").text("$50 mill+");
  svg.append("circle").attr("cx", LXP).attr("cy", LYP + 80 + 110).attr("r", 15).style("fill", "#bbb").attr("stroke", "#000");
  svg.append("text").attr("class", "label").attr("x", LXP + 30).attr("y", LYP + 190).style("text-anchor", "start").text("$25 mill+");
  svg.append("circle").attr("cx", LXP).attr("cy", LYP + 93 + 110).attr("r", 10).style("fill", "#bbb").attr("stroke", "#000");
  svg.append("text").attr("class", "label").attr("x", LXP + 30).attr("y", LYP + 210).style("text-anchor", "start").text("$10 mill+");
  
  updateChart();  
}

function updateChart() {
	var data = theData[currYear]
	var teams = svg.selectAll(".dot")
      .data(data, function(d) {
      	return d.Tm;
      })
  teams.enter().append("circle")
    	.attr("class", "dot")
    	.attr("r", function(d) { return (4 + (d.payroll * .0000003)); })
    	.attr("cx", function(d) { return x(d.wins); })
    	.attr("cy", function(d) { return y(d.attendance); })
      .attr('title', function(d) { return d.Tm; })
    	.style("fill", function(d) {
          if (d.Lg == "NL East" || d.Lg == "AL East") {
            return "rgb(228, 26, 28)";
          } else if (d.Lg == "NL Central" || d.Lg == "AL Central") {
            return "rgb(77, 175, 74)";
          } else {
            return "rgb(53, 135, 212)";
          }
        });

    $("circle").tooltip({
      'container': 'body',
      'placement': 'bottom'
    });

    teams.exit()
    	.remove();

    teams.transition()
    	.duration(1500)
        .attr("r", function(d) { return (4 + (d.payroll * .0000003)); })    	  
        .attr("cx", function(d) { return x(d.wins); })
    		.attr("cy", function(d) { return y(d.attendance); })
        .attr('title', function(d) { return d.Tm; })
        .style("fill", function(d) {
          if (d.Lg == "NL East" || d.Lg == "AL East") {
            return "rgb(228, 26, 28)";
          } else if (d.Lg == "NL Central" || d.Lg == "AL Central") {
            return "rgb(77, 175, 74)";
          } else {
            return "rgb(53, 135, 212)";
          }
        });
  }