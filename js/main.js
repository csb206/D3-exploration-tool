$(function() {
  // Read in prepped_data file
  d3.csv("js/mlborgstats.csv", function(error, data) {

    // current year to start time control on.
    // 2d array that encapuslates team stats for each year
    var currentYr = 1980;
    var dataArr = {};
    var xScale, yScale;

    // filters down the data for stats occurring at or after 1980
    data = data.filter(function(d) {
      return + d.Year >= 1980;
    })

    // Account for wins, attendance, payroll and division of each team for each year
    data.forEach(function(d) {
      d.wins =+ d.W;
      d.attendance =+ d.Attendance;
      d.payroll =+ d.Payroll;
      d.lg =+ '' + d.Lg;

      // check to see if given year has array, create an array for that year
      if (!dataArr[d.Year]) {
        dataArr[d.Year] = [];
      }
      // push in the stats for each team of a given year
      dataArr[d.Year].push(d);
    });

   // Margin: how much space to put in the SVG for axes/title
    var margin = {
      top: 40, 
      right: 30, 
      bottom: 50, 
      left: 40
    };

    // Height/width of the drawing area for data symbols
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    // Defined a linear x and y Scale for the chart
    var xScale = d3.scale.linear().range([0, width]).domain(d3.extent(data, function(d) { return d.wins; })).nice();
    var yScale = d3.scale.linear().range([height, 0]).domain(d3.extent(data, function(d) { return d.attendance; })).nice();

    // Select SVG to work with, setting width and height (the chart <div> is defined in the index.html file)
    var svg = d3.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set the color to green, blue, or red for color legend. 
    var color = d3.scale.ordinal()
        .domain([1, 2, 3])
        .range(["rgb(53,135,212)", "rgb(77, 175, 74)", "rgb(228, 26, 28)"]);

    // Define x axis using d3.svg.axis(), assigning the scale as the xScale
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    // Define y axis using d3.svg.axis(), assigning the scale as the xScale
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");
    
    // draw chart
    drawChart();

    // Assign a change event to input elements
    // then filter and update the data organized by division
    var data = dataArr[currentYr];
    var orgs = svg.selectAll(".dot").data(data, function(d) {
          $("input").on("change", function() {
            var division = $(this).val(); 
            console.log(division);
            console.log(d.Lg);
            console.log(division != d.Lg);
            if (d.Lg.includes(division)) {
              orgs.exit().remove();
            } 
          });     
    }) 
    
    // Assign a change event to slider element
    // filters the data year by year on chart and updates chart
    $("#slider").on("change", function() {
      var val = $("#slider").val();
      currentYr = val;
      d3.select('#slidertext').text(currentYr);
      updateChart();
    }); 

    // draws the chart by placing the x axis, y axis, division and payroll legend on svg
    function drawChart() {
      // Append a xaxis label to your SVG, specifying the 'transform' attribute to position it 
      // updates label for the x axis
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
      // Append a yaxis label to your SVG, specifying the 'transform' attribute to position it 
      // updates label for the y axis
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

      // legends y position
      var LYP = 160;
      // legends x position 
      var LXP = 800;
        
      svg.append("text").attr("class", "label").attr("x", LXP - 5).attr("y", LYP).text("Division").style("font-weight", "bold");

      //color legend: organizes team by division (AL/NL West, Central or East)
      svg.append("circle").attr("cx", LXP).attr("cy", LYP + 20).attr("r", 12).style("fill", "rgb(53, 135, 212)").attr("stroke", "#000");
      svg.append("text").attr("class", "label").attr("x", LXP + 15).attr("y", LYP + 25).style("text-anchor", "start").text("AL/NL West");
      svg.append("circle").attr("cx", LXP).attr("cy", LYP + 50).attr("r", 12).style("fill", "rgb(77, 175, 74)").attr("stroke", "#000");
      svg.append("text").attr("class", "label").attr("x", LXP + 15).attr("y", LYP + 55).style("text-anchor", "start").text("AL/NL Central");
      svg.append("circle").attr("cx", LXP).attr("cy", LYP + 80).attr("r", 12).style("fill", "rgb(228, 26, 28)").attr("stroke", "#000");
      svg.append("text").attr("class", "label").attr("x", LXP + 15).attr("y", LYP + 85).style("text-anchor", "start").text("AL/NL East");
      svg.append("text").attr("class", "label").attr("x", LXP - 5).attr("y", LYP + 110).text("Payroll").style("font-weight", "bold");

      //size legend : organizes team by payroll amount. (100 mill+, 50 mill+, 25 mill+, 10 mill+)
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

    // updates the chart 
    function updateChart() {
      // the data for the current year of the slider change
    	var data = dataArr[currentYr];
      
      // selects all dots of the circle and binds the data
    	var orgs = svg.selectAll(".dot").data(data);
      
      // get all the dots (circles) entering the chart and assign their initial positions
      // automatically changes the radius based on the payroll for the team that year
      // each team is colored depending on their division in the MLB
      orgs.enter().append("circle")
      	.attr("class", "dot")
      	.attr("r", function(d) { return (4 + (d.payroll * .0000004)); })
      	.attr("cx", function(d) { return xScale(d.wins); })
      	.attr("cy", function(d) { return yScale(d.attendance); })
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

      // remove elements that are no longer in the data
      orgs.exit().remove();

      // Transition properties of the update selection for each MLB organization
      orgs.transition()
      	.duration(1500)
          .attr("r", function(d) { return (4 + (d.payroll * .0000003)); })    	  
          .attr("cx", function(d) { return xScale(d.wins); })
      		.attr("cy", function(d) { return yScale(d.attendance); })
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
      
      // select all circles and apply a tooltip
      $("circle").tooltip({
        'container': 'body',
        'placement': 'bottom'
      });
   });
});    