
document.addEventListener('DOMContentLoaded', function() {
    // Determine the path to the CSV file
    // Note: If you are running this locally (file://), you might encounter CORS errors.
    // Use a local web server (e.g., Python's http.server) to view the data.
    const cvsPath = "../data/EfficiencyAnalysis%20-%20SpecPower%20Servers.csv";

    // Load data using D3
    if (typeof d3 === 'undefined') {
        console.error("D3.js is not loaded. Please include the D3 library.");
        return;
    }

    d3.csv(cvsPath)
        .then(function(raw_data) {
            console.log("Raw CSV Data Loaded. Rows:", raw_data.length);
            if (raw_data.length > 0) {
                console.log("CSV Columns:", raw_data.columns);
            }

            // Preprocess data
            const data = raw_data.map(d => {
                // Helper to safely get value regardless of trailing spaces in CSV headers
                const getVal = (key) => {
                    if (d[key] !== undefined) return d[key];
                    // Try adding a space
                    if (d[key + " "] !== undefined) return d[key + " "];
                    // Search trimmed keys
                    const foundKey = Object.keys(d).find(k => k.trim() === key.trim());
                    return foundKey ? d[foundKey] : undefined;
                };

                const year = +getVal('Hardware release year');
                const power = +getVal('Average watts @ 100% of target load');
                const perf = +getVal('ssj_ops @ 100% of target load');
                const efficiency = +getVal('Performance/power @ 100% of target load');
                
                // For string fields, we probably want to try the same safe access
                const system = getVal('System') || "Unknown System";
                const vendor = getVal('Hardware Vendor') || "Unknown Vendor";
                
                // Filter invalid data points
                if (isNaN(year) || isNaN(power) || isNaN(perf) || isNaN(efficiency)) {
                    // console.warn("Invalid data point:", d); // Optional: Uncomment to debug specific rows
                    return null;
                }

                return { year, power, perf, efficiency, system, vendor };
            }).filter(d => d !== null);

            console.log("Processed Data Points:", data.length);

            if (data.length === 0) {
                console.warn("No valid data points found after processing. Check column names?");
                const container = document.querySelector("#viz-server-scatter");
                if (container) container.innerHTML = '<div class="alert alert-warning">Data loaded but no valid rows found. Check console for details.</div>';
                return;
            }

            // Render Visualization 1: Scatter Plot in #viz-server-scatter
            createPerformanceScatter(data, "#viz-server-scatter");

            // Render Visualization 2: Efficiency Trend in #viz-server-sankey
            // (Note: The ID suggests Sankey, but we are using it for a trend chart which fits the data better)
            createEfficiencyTrend(data, "#viz-server-sankey");

        })
        .catch(function(error) {
            console.error("Error loading CSV data:", error);
            const container = document.querySelector("#viz-server-scatter");
            if(container) {
                container.innerHTML = `
                    <div class="alert alert-danger">
                        <h4>Error loading data</h4>
                        <p>${error.message}</p>
                        <p class="small">If you are opening this file directly in your browser (file://), try running a local web server to avoid CORS restrictions.</p>
                    </div>`;
            }
        });
});

/**
 * Creates a Scatter Plot: Power vs Performance, colored by Year
 */
function createPerformanceScatter(data, selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    // Clear loading message
    container.innerHTML = '';
    
    // Set dimensions
    const margin = {top: 20, right: 30, bottom: 50, left: 60};
    const width = container.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X Axis: Average Power (Watts)
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.power)])
        .range([0, width]);
    
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Y Axis: Performance
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.perf)])
        .range([height, 0]);
        
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

    // Color scale (Year)
    const color = d3.scaleSequential()
        .domain(d3.extent(data, d => d.year))
        .interpolator(d3.interpolateViridis);

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#fff")
        .style("border", "1px solid #ddd")
        .style("padding", "10px")
        .style("border-radius", "4px")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
        .style("font-size", "12px")
        .style("pointer-events", "none");

    // Add dots
    svg.append('g')
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.power))
        .attr("cy", d => y(d.perf))
        .attr("r", 4)
        .style("fill", d => color(d.year))
        .style("opacity", 0.7)
        .style("stroke", "#333")
        .style("stroke-width", "0.5px")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 7).style("stroke", "black").style("stroke-width", "1.5px");
            tooltip.style("visibility", "visible")
                .html(`
                    <strong>${d.system}</strong><br/>
                    Vendor: ${d.vendor}<br/>
                    Year: ${d.year}<br/>
                    Power: ${d.power} W<br/>
                    Performance: ${d3.format(",")(d.perf)} ops
                `);
        })
        .on("mousemove", function(event) {
            tooltip
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 4).style("stroke", "#333").style("stroke-width", "0.5px");
            tooltip.style("visibility", "hidden");
        });

    // Labels
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .text("Power Consumption (Watts)")
        .style("font-size", "12px");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -height / 2)
        .text("Performance (ssj_ops)")
        .style("font-size", "12px");

    // Legend for Color (Year)
    // Simple gradient legend
    const legendWidth = 150;
    const legendHeight = 10;
    
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");
    
    linearGradient.selectAll("stop")
        .data(color.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: color(t) })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    const legendGroup = svg.append("g")
        .attr("transform", `translate(${width - legendWidth}, ${height - 30})`);

    legendGroup.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#linear-gradient)");

    legendGroup.append("text")
        .attr("x", 0)
        .attr("y", legendHeight + 12)
        .text(d3.min(data, d => d.year))
        .style("font-size", "10px");
    
    legendGroup.append("text")
        .attr("x", legendWidth)
        .attr("y", legendHeight + 12)
        .attr("text-anchor", "end")
        .text(d3.max(data, d => d.year))
        .style("font-size", "10px");
}

/**
 * Creates an Efficiency Trend Chart: Year vs Efficiency
 * Uses a box plot or scatter with trend line to show improvement.
 */
function createEfficiencyTrend(data, selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    container.innerHTML = '';
    
    const margin = {top: 20, right: 30, bottom: 50, left: 60};
    const width = container.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Group data by year to find averages/max
    const years = Array.from(new Set(data.map(d => d.year))).sort();
    const statsByYear = years.map(year => {
        const values = data.filter(d => d.year === year).map(d => d.efficiency);
        return {
            year: year,
            avg: d3.mean(values),
            max: d3.max(values)
        };
    });

    // X Axis: Year
    const x = d3.scaleLinear()
        .domain(d3.extent(years))
        .range([0, width]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // Display as integer year

    // Y Axis: Efficiency
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.efficiency)])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    // Area generator for max efficiency
    // We can show the "Best in class" evolution
    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.avg))
        .curve(d3.curveMonotoneX);

    // Plot average line
    svg.append("path")
        .datum(statsByYear)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Plot points for individual servers (scatterplot background)
    svg.selectAll("circle.dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.efficiency))
        .attr("r", 2)
        .style("fill", "#ccc")
        .style("opacity", 0.3);

    // Plot average points on top
    svg.selectAll("circle.avg")
        .data(statsByYear)
        .enter()
        .append("circle")
        .attr("class", "avg")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.avg))
        .attr("r", 5)
        .style("fill", "steelblue");

    // Labels
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .text("Year Release")
        .style("font-size", "12px");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -height / 2)
        .text("Efficiency (Performance/Watt)")
        .style("font-size", "12px");
        
    // Annotation
    svg.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .text("Blue line: Average Efficiency")
        .style("font-size", "12px")
        .style("fill", "steelblue")
        .style("font-weight", "bold");
        
    svg.append("text")
        .attr("x", 10)
        .attr("y", 35)
        .text("Grey dots: Individual Servers")
        .style("font-size", "12px")
        .style("fill", "#999");
}
