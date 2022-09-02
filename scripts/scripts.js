let width = 800;
let height = 400;

let svgContainer = d3
    .select("#visHolder")
    .append("svg")
    .attr("width", width + 100)
    .attr("height", height + 60);

let tooltip = d3
    .select("#visHolder")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
d3.json(url).then(dataset => {
    dataset.forEach(d => {
        let parsedTime = d.Time.split(":");
        d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]).toLocaleString();
    })
    let years = dataset.map(data => data.Year);
    let xScale = d3.scaleLinear()
        .domain([d3.min(years)-1, d3.max(years)+1]) 
        .range([0, width]);
    let xAxis = d3
        .axisBottom(xScale)
        .tickFormat(t => t);
    svgContainer.append("g")
        .call(xAxis)
        .attr("id", "x-axis")
        .attr("transform", "translate(60, 400)");
    
    let times = dataset.map(data => data.Seconds)
    let yScale = d3.scaleLinear()
        .domain([d3.min(times)-5, d3.max(times)+5])
        .range([0, height]);
    let yAxis = d3
        .axisLeft()
        .scale(yScale)
        .tickFormat(t => {
            let minutes = parseInt(t / 60);
            let seconds = t % 60;
            seconds = seconds === 0 ? "00" : seconds;
            let tick = minutes + ":" + seconds;
            return tick
        });
    svgContainer.append("g")
        .call(yAxis)
        .attr("id", "y-axis")
        .attr("transform", "translate(60)");

    d3.select("svg")
        .selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("r", 6)
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.Seconds))
        .attr("transform", "translate(60)")
        .attr("class", "dot")
        .attr("data-xvalue", d => d.Year)
        .attr("data-yvalue", d => d.Time)
        .attr("fill", d => d.Doping === "" ? "orange" : "steelblue")
        .on("mouseover", function (e, d) {
            this.style["stroke"] = "black";
            tooltip.transition().duration(0).style("opacity",.9);
            tooltip.html(d.Name + ": " + d.Nationality + "<br>" + 
                "Year: " + d.Year + ", Time: " + d.Time.substring(13))
                .style("left", xScale(d.Year) + 60 + "px")
                .style("top", yScale(d.Seconds) + 60 + "px")
                .attr("transform", "translate(60)")
                .attr("data-year", d.Year);
            if (d.Doping !== "") {
                tooltip._groups[0][0].innerHTML += "<br><br>" + d.Doping;
            }
        })
        .on("mouseout", function () {
            tooltip.transition().duration(0).style("opacity", 0);
            this.style["stroke"] = "";
        });
});