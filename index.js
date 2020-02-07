"use strict";
(function(){
    var data = ""
    let gen = "All"
    let leg = "All"
    let svgContainer = ""
    // dimensions for svg
    const measurements = {
        width: 700,
        height: 700,
        marginAll: 50
    }
    let types = ["Bug", "Dragon", "Electric", "Fairy", "Fighting", "Fire", "Ghost", "Grass", "Ground", "Ice", "Normal", "Poison", "Psychic", "Rock", "Water"];
    
    const colorList = [
        "#4E79A7",
        "#A0CBE8",
        "#F28E2B",
        "#FFBE&D",    
        "#59A14F",    
        "#8CD17D",  
        "#B6992D",    
        "#499894",   
        "#D4AA8E",
        "#86BCB6",
        "#E15759",
        "#FF9D9A",
        "#79706E",
        "#BAB0AC",
        "#D37295"]
        
    var color = d3.scaleOrdinal().domain(types).range(colorList);


    



    // load data and append svg to body
    svgContainer = d3.select('#dataviz').append("svg")
        .attr('width', measurements.width)
        .attr('height', measurements.height);
    d3.csv("pokemon.csv")
        .then((csvData) => data = csvData)
        .then(() => makeScatterPlot(data))
        // Define the div for the tooltip




    function makeScatterPlot(data) {
        data = data;
        
        let spDef = data.map((row) => parseInt(row["Sp. Def"]))
        let totalStats = data.map((row) =>  parseFloat(row["Total"]))
        // find range of data
        const limits = findMinMax(spDef, totalStats)
        // create a function to scale x coordinates
        let scaleX = d3.scaleLinear()
            .domain([limits.spDefMin - 15, limits.spDefMax + 20])
            .range([0 + measurements.marginAll, measurements.width - measurements.marginAll])
        // create a function to scale y coordinates
        let scaleY = d3.scaleLinear()
            .domain([limits.totalMax + 20, limits.totalMin - 10])
            .range([0 + measurements.marginAll, measurements.height - measurements.marginAll])
        
        drawAxes(scaleX, scaleY)
        
        plotData(scaleX, scaleY)
        makeLegend()
    }

    function findMinMax(spDef, totalStats) {
        return {
            spDefMin: d3.min(spDef),
            spDefMax: d3.max(spDef),
            totalMin: d3.min(totalStats),
            totalMax: d3.max(totalStats)
        }
    }

    function drawAxes(scaleX, scaleY) {
        // these are not HTML elements. They're functions!
        let xAxis = d3.axisBottom()
            .scale(scaleX)

        let yAxis = d3.axisLeft()
            .scale(scaleY)
        
        // append x and y axes to svg
        svgContainer.append('g')
            .attr('transform', 'translate(0,650)')
            .call(xAxis)

        svgContainer.append('g')
            .attr('transform', 'translate(50, 0)')
            .call(yAxis)
        
            svgContainer.append("text")          
            .attr('transform', 'translate(300,690)')
            .style("text-anchor", "middle")
            .text('Special Defense');
    

        svgContainer.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x",-350)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Total Stats");  
    }

    function plotData(scaleX, scaleY) {
        // get scaled x and y coordinates from a datum
        // a datum is just one row of our csv file
        // think of a datum as an object of form:
        // {
        //     "GRE Score": ...,
        //     "Admit": ...,
        //     ...
        // }
        const xMap = function(d) { return scaleX(+d["Sp. Def"]) }
        const yMap = function(d) { return scaleY(+d["Total"]) }   

        
        var div = d3.select("#dataviz").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);
        
        
        const circles = svgContainer.selectAll(".circle")
            .data(data)
            .enter()
            .append('circle')
                .attr('cx', xMap)
                .attr('cy', yMap)
                .attr('r', 5)
                .attr('id', function(d) { return d.Generation })
                .attr('fill', function(d) { return color(d["Type 1"])})
                .on("mouseover", function(d) {		
                    div.transition()		
                        .duration(200)		
                        .style("opacity", 1);
                    div.html(d.Name + "<br/>" + d["Type 1"] + "<br/>" + d["Type 2"])	
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 28) + "px")
                    .style("position", "absolute")
                    .style("z-index", 200)
                    .style("background-color", "HoneyDew")
                    })					
                .on("mouseout", function(d) {		
                    div.transition()		
                        .duration(200)		
                        .style("opacity", 0);	
                });
    makeDropdowns(circles, data)            
    }

    function makeDropdowns(circles, data) {
            // Generation Drop Down
            var dropDown = d3.select("#filter1").append("select")
            .attr("name", "Generation");

        // Legendary Drop Down
        var dropDown2 = d3.select("#filter2").append("select")
                .attr("name", "Legendary");
    
        // Generation Filter
        dropDown.append("option")
            .text("All");
        
        var options = dropDown.selectAll("option.state")
            .data(d3.map(data, function(d){return d.Generation;}).keys())
            .enter()
            .append("option")
            .classed("state", true);
        
        options.text(function (d) { return d; })
            .attr("value", function (d) { return d; });

        // Legendary Filter
        dropDown2.append("option")
            .text("All")
            
        var options2 = dropDown2.selectAll("option.state")
            .data(d3.map(data, function(d){return d.Legendary;}).keys())
            .enter()
            .append("option")
            .classed("state", true);
            
        options2.text(function (d) { return d; })
            .attr("value", function (d) { return d; });

        
        dropDown.on("change", function() {
            gen = this.value;
            filter(circles);
        })

        dropDown2.on("change", function() {
            leg = this.value;
            filter(circles);
        })
    }

    function filter(circles) {
            
        if (gen == "All" && leg == "All") {
            //show all data
            circles.attr("display", 'inline')

        } else if (gen == "All" && leg != "All") {
            //filter only by legend
            circles.filter(function(d) {
                return leg != d['Legendary']
            }).attr("display", 'none')

            circles.filter(function(d) {
                return leg == d['Legendary']
            }).attr("display", 'inline')

        } else if (gen != "All" && leg == "All") {
            //filter only by generation
            circles.filter(function(d) {
                return gen != d['Generation']
            }).attr("display", 'none')

            circles.filter(function(d) {
                return gen == d['Generation']
            }).attr("display", 'inline')

        } else {
            //filter by both conditions
            circles.filter(function(d) {
                return !(leg == d['Legendary'] && gen == d['Generation'])
            }).attr("display", 'none')

            circles.filter(function(d) {
                return leg == d['Legendary'] && gen == d['Generation']
            }).attr("display", 'inline')
        }
    }

    function makeLegend() {
    // draw legend
    var legend = svgContainer.selectAll(".legend")
    .data(color.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
    .attr("x", measurements.width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

    // draw legend text
    legend.append("text")
    .attr("x", measurements.width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d;})
    }



})()