// this file contains code from the D3.js library

// Section 1 (Motassim): Why It Matters: Data in Our Daily Lives


// Section 2 (Ben Touhami): Inside Your Device: How Much Energy Does It Use?

// Visualization 1: GWP (CO2 Emissions) Analysis - Interactive Scatter Plot
function createGWPAnalysis(containerId) {
    const margin = { top: 80, right: 30, bottom: 100, left: 70 };
    const width = 550 - margin.left - margin.right;
    const height = 520 - margin.top - margin.bottom;

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.json("data/terminals/cpu_data_enriched.json").then(data => {
        // Get unique manufacturers
        const manufacturers = [...new Set(data.map(d => d.manufacturer))];
        const colorScale = d3.scaleOrdinal()
            .domain(manufacturers)
            .range(d3.schemeSet2);

        // Create scales
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.tdp) * 1.05])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.gwp_total) * 1.05])
            .range([height, 0]);

        const sizeScale = d3.scaleSqrt()
            .domain([d3.min(data, d => d.cores), d3.max(data, d => d.cores)])
            .range([5, 15]);

        // Add grid
        svg.append("g")
            .attr("class", "grid")
            .attr("opacity", 0.1)
            .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));

        svg.append("g")
            .attr("class", "grid")
            .attr("opacity", 0.1)
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(""));

        // Add axes
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("x", width / 2)
            .attr("y", 50)
            .attr("fill", "#2c3e50")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .style("text-anchor", "middle")
            .text("TDP - Thermal Design Power (Watts)");

        svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat(d => `${d} kg`))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -60)
            .attr("fill", "#2c3e50")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .style("text-anchor", "middle")
            .text("Total CO₂ Emissions (kg CO₂eq)");

        // Title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text("🌍 CO₂ Emissions vs Power (TDP)");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -30)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#7f8c8d")
            .text("Hover for details • Size = cores");

        // Create tooltip
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "linear-gradient(135deg, #667eea 0%, #764ba2 100%)")
            .style("color", "white")
            .style("padding", "15px 20px")
            .style("border-radius", "12px")
            .style("font-size", "13px")
            .style("box-shadow", "0 10px 30px rgba(0,0,0,0.3)")
            .style("pointer-events", "none")
            .style("z-index", "1000")
            .style("max-width", "300px");

        // Add circles
        const circles = svg.selectAll(".bubble")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "bubble")
            .attr("cx", d => xScale(d.tdp))
            .attr("cy", d => yScale(d.gwp_total))
            .attr("r", d => sizeScale(d.cores))
            .attr("fill", d => colorScale(d.manufacturer))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("opacity", 0.75)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", sizeScale(d.cores) * 1.5)
                    .attr("opacity", 1)
                    .attr("stroke-width", 3);

                tooltip.html(`
                    <div style="border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 10px; margin-bottom: 10px;">
                        <strong style="font-size: 16px;">${d.name}</strong>
                    </div>
                    <div style="display: grid; gap: 8px;">
                        <div><strong>🏭 Manufacturer:</strong> ${d.manufacturer}</div>
                        <div><strong>⚡ TDP:</strong> ${d.tdp}W</div>
                        <div><strong>🔢 Cores:</strong> ${d.cores}</div>
                        <div><strong>⏱️ Frequency:</strong> ${d.frequency} GHz</div>
                        <div><strong>📏 Die Size:</strong> ${d.total_die_size} mm²</div>
                    </div>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid rgba(255,255,255,0.3);">
                        <div style="font-size: 15px; margin-bottom: 8px;"><strong>🌍 Climate Impact (GWP):</strong></div>
                        <div style="background: rgba(255,255,255,0.2); padding: 8px; border-radius: 6px; margin-bottom: 5px;">
                            <strong>Total:</strong> ${d.gwp_total.toFixed(1)} kg CO₂eq
                        </div>
                        <div style="font-size: 12px; padding-left: 10px;">
                            • Manufacturing: ${d.gwp_embedded.toFixed(1)} kg<br/>
                            • 4-year usage: ${d.gwp_use.toFixed(1)} kg
                        </div>
                    </div>
                `)
                    .style("visibility", "visible");
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 15) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", d => sizeScale(d.cores))
                    .attr("opacity", 0.75)
                    .attr("stroke-width", 2);
                tooltip.style("visibility", "hidden");
            });

        // Simple inline legend at bottom (below X-axis title)
        const legendGroup = svg.append("g")
            .attr("transform", `translate(${width / 2 - manufacturers.length * 40}, ${height + 75})`);

        manufacturers.forEach((mfr, i) => {
            const item = legendGroup.append("g")
                .attr("transform", `translate(${i * 80}, 0)`);

            item.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 5)
                .attr("fill", colorScale(mfr));

            item.append("text")
                .attr("x", 10)
                .attr("y", 4)
                .attr("font-size", "10px")
                .attr("fill", "#2c3e50")
                .text(mfr);
        });

    }).catch(error => console.error("Error:", error));
}

// Visualization 2: PE (Primary Energy) Analysis - Simple Horizontal Bar Chart
function createPEAnalysis(containerId) {
    const margin = { top: 70, right: 30, bottom: 80, left: 70 };
    const width = 550 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const container = d3.select(`#${containerId}`);

    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Conversion factor: 1 MJ = 0.2778 kWh
    const MJ_TO_KWH = 0.2778;

    d3.json("data/terminals/cpu_data_enriched.json").then(data => {
        // Calculate MEAN PE for each manufacturer separately (converted to kWh)
        const manufacturers = [...new Set(data.map(d => d.manufacturer))];
        const mfrData = manufacturers.map(mfr => {
            const cpus = data.filter(d => d.manufacturer === mfr);
            return {
                name: mfr,
                pe_total: d3.mean(cpus, d => d.pe_total) * MJ_TO_KWH,
                pe_embedded: d3.mean(cpus, d => d.pe_embedded) * MJ_TO_KWH,
                pe_use: d3.mean(cpus, d => d.pe_use) * MJ_TO_KWH,
                count: cpus.length
            };
        }).sort((a, b) => b.pe_total - a.pe_total);

        // Color scale per manufacturer
        const colorScale = d3.scaleOrdinal()
            .domain(mfrData.map(d => d.name))
            .range(["#3498db", "#e74c3c", "#27ae60", "#9b59b6", "#f39c12"]);

        const xScale = d3.scaleBand()
            .domain(mfrData.map(d => d.name))
            .range([0, width])
            .padding(0.3);

        const barWidth = xScale.bandwidth() / 2 - 5;

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(mfrData, d => Math.max(d.pe_embedded, d.pe_use)) * 1.2])
            .range([height, 0]);

        // Title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -45)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text("⚡ Average Energy Consumption by Manufacturer");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -25)
            .attr("text-anchor", "middle")
            .attr("font-size", "13px")
            .attr("fill", "#7f8c8d")
            .text("Mean Energy per CPU (kWh) • Manufacturing vs Usage Phase");

        // Grid lines
        svg.append("g")
            .attr("opacity", 0.1)
            .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));

        // Y axis
        svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat(d => `${d.toFixed(0)} kWh`))
            .selectAll("text")
            .attr("font-size", "11px");

        // X axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("font-size", "13px")
            .attr("font-weight", "bold");

        // Create tooltip
        const tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#2c3e50")
            .style("color", "white")
            .style("padding", "12px 16px")
            .style("border-radius", "8px")
            .style("font-size", "13px")
            .style("box-shadow", "0 4px 15px rgba(0,0,0,0.2)")
            .style("pointer-events", "none")
            .style("z-index", "1000");

        // Manufacturing bars (left)
        svg.selectAll(".bar-mfg")
            .data(mfrData)
            .enter()
            .append("rect")
            .attr("class", "bar-mfg")
            .attr("x", d => xScale(d.name))
            .attr("y", height)
            .attr("width", barWidth)
            .attr("height", 0)
            .attr("fill", "#3498db")
            .attr("rx", 4)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("opacity", 0.8);
                tooltip.html(`
                    <strong style="font-size: 15px;">${d.name}</strong><br/><br/>
                    🏭 <strong>Manufacturing:</strong> ${d.pe_embedded.toFixed(1)} kWh<br/>
                    🔌 Usage: ${d.pe_use.toFixed(1)} kWh<br/><br/>
                    <strong>Total: ${d.pe_total.toFixed(1)} kWh</strong>
                `).style("visibility", "visible");
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).attr("opacity", 1);
                tooltip.style("visibility", "hidden");
            })
            .transition()
            .duration(800)
            .attr("y", d => yScale(d.pe_embedded))
            .attr("height", d => height - yScale(d.pe_embedded));

        // Usage bars (right)
        svg.selectAll(".bar-use")
            .data(mfrData)
            .enter()
            .append("rect")
            .attr("class", "bar-use")
            .attr("x", d => xScale(d.name) + barWidth + 10)
            .attr("y", height)
            .attr("width", barWidth)
            .attr("height", 0)
            .attr("fill", "#e74c3c")
            .attr("rx", 4)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("opacity", 0.8);
                tooltip.html(`
                    <strong style="font-size: 15px;">${d.name}</strong><br/><br/>
                    🏭 Manufacturing: ${d.pe_embedded.toFixed(1)} kWh<br/>
                    🔌 <strong>Usage:</strong> ${d.pe_use.toFixed(1)} kWh<br/><br/>
                    <strong>Total: ${d.pe_total.toFixed(1)} kWh</strong>
                `).style("visibility", "visible");
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).attr("opacity", 1);
                tooltip.style("visibility", "hidden");
            })
            .transition()
            .duration(800)
            .delay(300)
            .attr("y", d => yScale(d.pe_use))
            .attr("height", d => height - yScale(d.pe_use));

        // Value labels on Manufacturing bars
        svg.selectAll(".label-mfg")
            .data(mfrData)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.name) + barWidth / 2)
            .attr("y", d => yScale(d.pe_embedded) - 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "#3498db")
            .text(d => `${d.pe_embedded.toFixed(0)}`);

        // Value labels on Usage bars
        svg.selectAll(".label-use")
            .data(mfrData)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.name) + barWidth + 10 + barWidth / 2)
            .attr("y", d => yScale(d.pe_use) - 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "#e74c3c")
            .text(d => `${d.pe_use.toFixed(0)}`);

        // Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width / 2 - 120}, ${height + 60})`);

        legend.append("rect").attr("width", 18).attr("height", 18).attr("fill", "#3498db").attr("rx", 3);
        legend.append("text").attr("x", 25).attr("y", 14).attr("font-size", "12px").text("Manufacturing (kWh)");
        
        legend.append("rect").attr("x", 170).attr("width", 18).attr("height", 18).attr("fill", "#e74c3c").attr("rx", 3);
        legend.append("text").attr("x", 195).attr("y", 14).attr("font-size", "12px").text("Usage (kWh)")

    }).catch(error => console.error("Error:", error));
}

// Visualization 3: ADP (Resource Depletion) Analysis - Donut Chart
function createADPAnalysis(containerId) {
    const width = 900;
    const height = 500;
    const radius = Math.min(width, height) / 2 - 80;

    const container = d3.select(`#${containerId}`);

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    d3.json("data/terminals/cpu_data_enriched.json").then(data => {
        // Calculate MEAN ADP for each manufacturer separately
        const manufacturers = [...new Set(data.map(d => d.manufacturer))];
        const mfrData = manufacturers.map(mfr => {
            const cpus = data.filter(d => d.manufacturer === mfr);
            return {
                name: mfr,
                adp_total: d3.mean(cpus, d => d.adp_total),
                adp_embedded: d3.mean(cpus, d => d.adp_embedded),
                adp_use: d3.mean(cpus, d => d.adp_use),
                count: cpus.length
            };
        }).sort((a, b) => b.adp_total - a.adp_total);

        const colorScale = d3.scaleOrdinal()
            .domain(mfrData.map(d => d.name))
            .range(["#3498db", "#e67e22", "#e74c3c"]);

        const pie = d3.pie()
            .value(d => d.adp_total)
            .sort(null);

        const arc = d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius);

        const hoverArc = d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius + 15);

        // Title
        svg.append("text")
            .attr("y", -height / 2 + 30)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text("💎 Average Resource Depletion by Manufacturer");

        svg.append("text")
            .attr("y", -height / 2 + 52)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "#7f8c8d")
            .text("Mean ADP (Abiotic Depletion Potential) per CPU • Hover for details");

        // Create tooltip
        const tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#2c3e50")
            .style("color", "white")
            .style("padding", "12px 16px")
            .style("border-radius", "8px")
            .style("font-size", "13px")
            .style("box-shadow", "0 4px 15px rgba(0,0,0,0.2)")
            .style("pointer-events", "none")
            .style("z-index", "1000");

        // Draw arcs
        const arcs = svg.selectAll(".arc")
            .data(pie(mfrData))
            .enter()
            .append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => colorScale(d.data.name))
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("d", hoverArc);

                const embPct = (d.data.adp_embedded / d.data.adp_total * 100).toFixed(1);
                const usePct = (d.data.adp_use / d.data.adp_total * 100).toFixed(1);
                tooltip.html(`
                    <strong style="font-size: 15px;">${d.data.name}</strong><br/>
                    <br/>
                    � Mean ADP: ${d.data.adp_total.toExponential(2)} kg Sb eq<br/>
                    <br/>
                    <small>🏭 Manufacturing: ${embPct}%<br/>
                    🔌 Usage: ${usePct}%</small>
                `).style("visibility", "visible");
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("d", arc);
                tooltip.style("visibility", "hidden");
            });

        // Labels on arcs - show name and percentage
        const totalADP = d3.sum(mfrData, d => d.adp_total);
        arcs.append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("font-size", "13px")
            .attr("fill", "white")
            .attr("font-weight", "bold")
            .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.5)")
            .each(function(d) {
                const pct = ((d.data.adp_total / totalADP) * 100).toFixed(1);
                d3.select(this)
                    .append("tspan")
                    .attr("x", 0)
                    .attr("dy", "-0.3em")
                    .text(d.data.name);
                d3.select(this)
                    .append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1.2em")
                    .text(`${pct}%`);
            });

        // Center text - simple label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "-5px")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text("ADP");

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "15px")
            .attr("font-size", "11px")
            .attr("fill", "#7f8c8d")
            .text("kg Sb eq");

        // Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${radius + 50}, ${-mfrData.length * 15})`);

        mfrData.forEach((d, i) => {
            const row = legend.append("g")
                .attr("transform", `translate(0, ${i * 30})`);

            row.append("rect")
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", colorScale(d.name))
                .attr("rx", 3);

            row.append("text")
                .attr("x", 25)
                .attr("y", 14)
                .attr("font-size", "12px")
                .attr("fill", "#2c3e50")
                .text(d.name);
        });

    }).catch(error => console.error("Error:", error));
}

// ===========================================
// COMBINED VISUALIZATION: Environmental Impact Scatter Plot with Filter (GWP, PE, ADP)
// ===========================================
function createCombinedImpactAnalysis(containerId) {
    const container = d3.select(`#${containerId}`);
    
    // Create filter buttons
    const filterDiv = container.append("div")
        .style("text-align", "center")
        .style("margin-bottom", "20px");

    filterDiv.append("span")
        .style("font-weight", "bold")
        .style("margin-right", "15px")
        .style("color", "#2c3e50")
        .text("Select Metric:");

    const metrics = [
        { id: "gwp", label: "🌍 CO₂ Emissions", color: "#27ae60" },
        { id: "pe", label: "⚡ Energy (kWh)", color: "#e74c3c" },
        { id: "adp", label: "💎 Resources", color: "#f39c12" }
    ];

    metrics.forEach((metric, i) => {
        filterDiv.append("button")
            .attr("class", "impact-filter-btn")
            .attr("data-metric", metric.id)
            .style("padding", "10px 20px")
            .style("margin", "0 5px")
            .style("border", i === 0 ? `2px solid ${metric.color}` : "2px solid #ddd")
            .style("background", i === 0 ? metric.color : "white")
            .style("color", i === 0 ? "white" : "#2c3e50")
            .style("border-radius", "25px")
            .style("cursor", "pointer")
            .style("font-weight", "bold")
            .style("font-size", "13px")
            .style("transition", "all 0.3s ease")
            .text(metric.label)
            .on("click", function() {
                filterDiv.selectAll(".impact-filter-btn")
                    .style("background", "white")
                    .style("color", "#2c3e50")
                    .style("border", "2px solid #ddd");
                d3.select(this)
                    .style("background", metric.color)
                    .style("color", "white")
                    .style("border", `2px solid ${metric.color}`);
                drawScatterPlot(metric.id);
            });
    });

    // Chart container
    const chartDiv = container.append("div").attr("id", "impact-chart-container");

    const margin = { top: 60, right: 150, bottom: 80, left: 80 };
    const width = 900 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const MJ_TO_KWH = 0.2778;

    function drawScatterPlot(metricType) {
        chartDiv.html("");

        const svg = chartDiv.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        d3.json("data/terminals/cpu_data_enriched.json").then(data => {
            const manufacturers = [...new Set(data.map(d => d.manufacturer))];
            const colorScale = d3.scaleOrdinal()
                .domain(manufacturers)
                .range(d3.schemeSet2);

            let yAccessor, yLabel, title;

            if (metricType === "gwp") {
                yAccessor = d => d.gwp_total;
                yLabel = "Total CO₂ Emissions (kg CO₂eq)";
                title = "🌍 CO₂ Emissions vs Power Consumption";
            } else if (metricType === "pe") {
                yAccessor = d => d.pe_total * MJ_TO_KWH;
                yLabel = "Total Energy (kWh)";
                title = "⚡ Energy Consumption vs Power";
            } else {
                yAccessor = d => d.adp_total;
                yLabel = "Resource Depletion (kg Sb eq)";
                title = "💎 Resource Depletion vs Power";
            }

            // Scales
            const xScale = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.tdp) * 1.05])
                .range([0, width]);

            const yScale = d3.scaleLinear()
                .domain([0, d3.max(data, yAccessor) * 1.05])
                .range([height, 0]);

            const sizeScale = d3.scaleSqrt()
                .domain([d3.min(data, d => d.cores), d3.max(data, d => d.cores)])
                .range([4, 12]);

            // Grid
            svg.append("g")
                .attr("opacity", 0.1)
                .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));

            svg.append("g")
                .attr("opacity", 0.1)
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(""));

            // Axes
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(xScale))
                .append("text")
                .attr("x", width / 2)
                .attr("y", 45)
                .attr("fill", "#2c3e50")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .style("text-anchor", "middle")
                .text("TDP - Thermal Design Power (Watts)");

            svg.append("g")
                .call(d3.axisLeft(yScale).tickFormat(d => {
                    if (metricType === "adp") return d.toExponential(1);
                    return d.toFixed(0);
                }))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -60)
                .attr("fill", "#2c3e50")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .style("text-anchor", "middle")
                .text(yLabel);

            // Title
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -35)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("font-weight", "bold")
                .attr("fill", "#2c3e50")
                .text(title);

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -15)
                .attr("text-anchor", "middle")
                .attr("font-size", "11px")
                .attr("fill", "#7f8c8d")
                .text("Hover for details • Size = cores");

            // Tooltip
            const tooltip = d3.select("body").append("div")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("background", "#2c3e50")
                .style("color", "white")
                .style("padding", "12px 16px")
                .style("border-radius", "8px")
                .style("font-size", "12px")
                .style("max-width", "280px")
                .style("pointer-events", "none")
                .style("z-index", "1000");

            // Scatter points
            svg.selectAll(".point")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "point")
                .attr("cx", d => xScale(d.tdp))
                .attr("cy", d => yScale(yAccessor(d)))
                .attr("r", 0)
                .attr("fill", d => colorScale(d.manufacturer))
                .attr("opacity", 0.7)
                .attr("stroke", "white")
                .attr("stroke-width", 1.5)
                .style("cursor", "pointer")
                .on("mouseover", function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", sizeScale(d.cores) * 1.5)
                        .attr("opacity", 1)
                        .attr("stroke-width", 3);

                    let valueInfo;
                    if (metricType === "gwp") {
                        valueInfo = `
                            <div><strong>🌍 CO₂ Total:</strong> ${d.gwp_total.toFixed(1)} kg</div>
                            <div style="font-size:11px;">• Manufacturing: ${d.gwp_embedded.toFixed(1)} kg</div>
                            <div style="font-size:11px;">• Usage: ${d.gwp_use.toFixed(1)} kg</div>
                        `;
                    } else if (metricType === "pe") {
                        valueInfo = `
                            <div><strong>⚡ Energy Total:</strong> ${(d.pe_total * MJ_TO_KWH).toFixed(0)} kWh</div>
                            <div style="font-size:11px;">• Manufacturing: ${(d.pe_embedded * MJ_TO_KWH).toFixed(1)} kWh</div>
                            <div style="font-size:11px;">• Usage: ${(d.pe_use * MJ_TO_KWH).toFixed(0)} kWh</div>
                        `;
                    } else {
                        valueInfo = `
                            <div><strong>💎 ADP Total:</strong> ${d.adp_total.toExponential(2)} kg Sb eq</div>
                            <div style="font-size:11px;">• Manufacturing: ${d.adp_embedded.toExponential(2)}</div>
                            <div style="font-size:11px;">• Usage: ${d.adp_use.toExponential(2)}</div>
                        `;
                    }

                    tooltip.html(`
                        <strong style="font-size:14px;">${d.name}</strong><br/>
                        <div style="margin: 8px 0; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.3);">
                            <div>🏭 ${d.manufacturer} • ⚡ ${d.tdp}W • 🔢 ${d.cores} cores</div>
                        </div>
                        ${valueInfo}
                    `).style("visibility", "visible");
                })
                .on("mousemove", function(event) {
                    tooltip.style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 15) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", d => sizeScale(d.cores))
                        .attr("opacity", 0.7)
                        .attr("stroke-width", 1.5);
                    tooltip.style("visibility", "hidden");
                })
                .transition()
                .duration(600)
                .delay((d, i) => i * 2)
                .attr("r", d => sizeScale(d.cores));

            // Legend
            const legend = svg.append("g")
                .attr("transform", `translate(${width + 20}, 20)`);

            legend.append("text")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .attr("fill", "#2c3e50")
                .text("Manufacturers");

            manufacturers.forEach((mfr, i) => {
                const row = legend.append("g")
                    .attr("transform", `translate(0, ${i * 25 + 20})`);

                row.append("circle")
                    .attr("r", 6)
                    .attr("fill", colorScale(mfr));

                row.append("text")
                    .attr("x", 12)
                    .attr("y", 4)
                    .attr("font-size", "11px")
                    .attr("fill", "#2c3e50")
                    .text(mfr);
            });

        }).catch(error => console.error("Error:", error));
    }

    // Initialize with GWP
    drawScatterPlot("gwp");
}

// ===========================================
// COMBINED VISUALIZATION: GPU vs CPU Comparison with Filter (GWP, PE)
// ===========================================
function createCombinedGPUvsCPU(containerId) {
    const container = d3.select(`#${containerId}`);
    
    // Create filter buttons
    const filterDiv = container.append("div")
        .style("text-align", "center")
        .style("margin-bottom", "20px");

    filterDiv.append("span")
        .style("font-weight", "bold")
        .style("margin-right", "15px")
        .style("color", "#2c3e50")
        .text("Compare by:");

    const metrics = [
        { id: "gwp", label: "🌍 CO₂ Emissions", color: "#27ae60" },
        { id: "pe", label: "⚡ Energy (kWh)", color: "#e74c3c" }
    ];

    metrics.forEach((metric, i) => {
        filterDiv.append("button")
            .attr("class", "gpu-cpu-filter-btn")
            .attr("data-metric", metric.id)
            .style("padding", "10px 25px")
            .style("margin", "0 8px")
            .style("border", i === 0 ? `2px solid ${metric.color}` : "2px solid #ddd")
            .style("background", i === 0 ? metric.color : "white")
            .style("color", i === 0 ? "white" : "#2c3e50")
            .style("border-radius", "25px")
            .style("cursor", "pointer")
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("transition", "all 0.3s ease")
            .text(metric.label)
            .on("click", function() {
                filterDiv.selectAll(".gpu-cpu-filter-btn")
                    .style("background", "white")
                    .style("color", "#2c3e50")
                    .style("border", "2px solid #ddd");
                d3.select(this)
                    .style("background", metric.color)
                    .style("color", "white")
                    .style("border", `2px solid ${metric.color}`);
                drawGPUvsCPUChart(metric.id);
            });
    });

    // Chart container
    const chartDiv = container.append("div").attr("id", "gpu-cpu-chart-container");

    const margin = { top: 60, right: 40, bottom: 100, left: 100 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const MJ_TO_KWH = 0.2778;

    function drawGPUvsCPUChart(metricType) {
        chartDiv.html("");

        const svg = chartDiv.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("display", "block")
            .style("margin", "0 auto")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        d3.json("data/terminals/cpu_gpu_comparison.json").then(data => {
            const cpus = data.filter(d => d.type === 'CPU');
            const gpus = data.filter(d => d.type === 'GPU');

            let avgCPU, avgGPU, unit, title;

            if (metricType === "gwp") {
                avgCPU = d3.mean(cpus, d => d.gwp_total);
                avgGPU = d3.mean(gpus, d => d.gwp_total);
                unit = "kg CO₂";
                title = "🌍 CO₂ Emissions: CPU vs GPU";
            } else {
                avgCPU = d3.mean(cpus, d => d.pe_total) * MJ_TO_KWH;
                avgGPU = d3.mean(gpus, d => d.pe_total) * MJ_TO_KWH;
                unit = "kWh";
                title = "⚡ Energy Consumption: CPU vs GPU";
            }

            const barData = [
                { type: "CPU", value: avgCPU, color: "#3498db", icon: "" },
                { type: "GPU", value: avgGPU, color: metricType === "gwp" ? "#e74c3c" : "#f39c12", icon: "" }
            ];

            // Title
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -30)
                .attr("text-anchor", "middle")
                .attr("font-size", "20px")
                .attr("font-weight", "bold")
                .attr("fill", "#2c3e50")
                .text(title);

            const xScale = d3.scaleBand()
                .domain(barData.map(d => d.type))
                .range([0, width])
                .padding(0.4);

            const yScale = d3.scaleLinear()
                .domain([0, avgGPU * 1.3])
                .range([height, 0]);

            // Grid
            svg.append("g")
                .attr("opacity", 0.1)
                .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));

            // Y axis
            svg.append("g")
                .call(d3.axisLeft(yScale).tickFormat(d => `${d.toFixed(0)} ${unit}`));

            // Bars
            svg.selectAll(".bar")
                .data(barData)
                .enter()
                .append("rect")
                .attr("x", d => xScale(d.type))
                .attr("y", height)
                .attr("width", xScale.bandwidth())
                .attr("height", 0)
                .attr("fill", d => d.color)
                .attr("rx", 10)
                .transition()
                .duration(1000)
                .attr("y", d => yScale(d.value))
                .attr("height", d => height - yScale(d.value));

            // Value labels
            svg.selectAll(".value")
                .data(barData)
                .enter()
                .append("text")
                .attr("x", d => xScale(d.type) + xScale.bandwidth() / 2)
                .attr("y", d => yScale(d.value) - 15)
                .attr("text-anchor", "middle")
                .attr("font-size", "22px")
                .attr("font-weight", "bold")
                .attr("fill", "#2c3e50")
                .text(d => `${d.value.toFixed(0)} ${unit}`);

            // X axis labels with icons
            svg.selectAll(".x-label")
                .data(barData)
                .enter()
                .append("text")
                .attr("x", d => xScale(d.type) + xScale.bandwidth() / 2)
                .attr("y", height + 40)
                .attr("text-anchor", "middle")
                .attr("font-size", "18px")
                .attr("font-weight", "bold")
                .text(d => `${d.icon} ${d.type}`);

            // Ratio indicator
            const ratio = (avgGPU / avgCPU).toFixed(1);
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + 75)
                .attr("text-anchor", "middle")
                .attr("font-size", "14px")
                .attr("fill", barData[1].color)
                .attr("font-weight", "bold")
                .text(metricType === "gwp" ? 
                    `⚠️ GPUs emit ${ratio}× more CO₂ than CPUs` : 
                    `⚡ GPUs consume ${ratio}× more energy than CPUs`);

        }).catch(error => console.error("Error:", error));
    }

    // Initialize with GWP
    drawGPUvsCPUChart("gwp");
}

// Visualization 4: GPU vs CPU - Combined Comparison Chart
function createGPUvsCPU_GWP(containerId) {
    const margin = { top: 60, right: 40, bottom: 100, left: 80 };
    const width = 550 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.json("data/terminals/cpu_gpu_comparison.json").then(data => {
        const cpus = data.filter(d => d.type === 'CPU');
        const gpus = data.filter(d => d.type === 'GPU');

        const avgCPU_GWP = d3.mean(cpus, d => d.gwp_total);
        const avgGPU_GWP = d3.mean(gpus, d => d.gwp_total);

        // Title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -35)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text("🌍 CO₂ Emissions: CPU vs GPU");

        const barData = [
            { type: "CPU", value: avgCPU_GWP, color: "#3498db", icon: "💻" },
            { type: "GPU", value: avgGPU_GWP, color: "#e74c3c", icon: "🎮" }
        ];

        const xScale = d3.scaleBand()
            .domain(barData.map(d => d.type))
            .range([0, width])
            .padding(0.4);

        const yScale = d3.scaleLinear()
            .domain([0, avgGPU_GWP * 1.2])
            .range([height, 0]);

        // Grid
        svg.append("g")
            .attr("opacity", 0.1)
            .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));

        // Y axis
        svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat(d => `${d} kg`));

        // Bars with animation
        svg.selectAll(".bar")
            .data(barData)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.type))
            .attr("y", height)
            .attr("width", xScale.bandwidth())
            .attr("height", 0)
            .attr("fill", d => d.color)
            .attr("rx", 8)
            .transition()
            .duration(1000)
            .attr("y", d => yScale(d.value))
            .attr("height", d => height - yScale(d.value));

        // Value labels
        svg.selectAll(".value")
            .data(barData)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.type) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d.value) - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text(d => `${d.value.toFixed(0)} kg`);

        // X axis labels with icons
        svg.selectAll(".x-label")
            .data(barData)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.type) + xScale.bandwidth() / 2)
            .attr("y", height + 30)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text(d => `${d.icon} ${d.type}`);

        // Ratio indicator
        const ratio = (avgGPU_GWP / avgCPU_GWP).toFixed(1);
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 70)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "#e74c3c")
            .attr("font-weight", "bold")
            .text(`⚠️ GPUs emit ${ratio}× more CO₂ than CPUs`);

    }).catch(error => console.error("Error:", error));
}

// Visualization 5: GPU vs CPU - PE Comparison
function createGPUvsCPU_PE(containerId) {
    const margin = { top: 60, right: 40, bottom: 100, left: 80 };
    const width = 550 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.json("data/terminals/cpu_gpu_comparison.json").then(data => {
        const cpus = data.filter(d => d.type === 'CPU');
        const gpus = data.filter(d => d.type === 'GPU');

        // Convert MJ to kWh (1 MJ = 0.2778 kWh)
        const MJ_TO_KWH = 0.2778;
        const avgCPU_PE = d3.mean(cpus, d => d.pe_total) * MJ_TO_KWH;
        const avgGPU_PE = d3.mean(gpus, d => d.pe_total) * MJ_TO_KWH;

        // Title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -35)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text("⚡ Energy Consumption: CPU vs GPU");

        const barData = [
            { type: "CPU", value: avgCPU_PE, color: "#3498db", icon: "💻" },
            { type: "GPU", value: avgGPU_PE, color: "#f39c12", icon: "🎮" }
        ];

        const xScale = d3.scaleBand()
            .domain(barData.map(d => d.type))
            .range([0, width])
            .padding(0.4);

        const yScale = d3.scaleLinear()
            .domain([0, avgGPU_PE * 1.2])
            .range([height, 0]);

        // Grid
        svg.append("g")
            .attr("opacity", 0.1)
            .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));

        // Y axis
        svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat(d => `${d.toFixed(0)} kWh`));

        // Bars with animation
        svg.selectAll(".bar")
            .data(barData)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.type))
            .attr("y", height)
            .attr("width", xScale.bandwidth())
            .attr("height", 0)
            .attr("fill", d => d.color)
            .attr("rx", 8)
            .transition()
            .duration(1000)
            .attr("y", d => yScale(d.value))
            .attr("height", d => height - yScale(d.value));

        // Value labels
        svg.selectAll(".value")
            .data(barData)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.type) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d.value) - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text(d => `${d.value.toFixed(0)} kWh`);

        // X axis labels with icons
        svg.selectAll(".x-label")
            .data(barData)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.type) + xScale.bandwidth() / 2)
            .attr("y", height + 30)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text(d => `${d.icon} ${d.type}`);

        // Ratio indicator
        const ratio = (avgGPU_PE / avgCPU_PE).toFixed(1);
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 70)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "#f39c12")
            .attr("font-weight", "bold")
            .text(`⚡ GPUs consume ${ratio}× more energy than CPUs`);

    }).catch(error => console.error("Error:", error));
}

// Section 3 (): When Data Leaves Your Device: Network & Cloud
// ========================================================================

// Wait for DOM to load - Section 3
document.addEventListener('DOMContentLoaded', function() {
    if (typeof d3 === 'undefined') {
        console.error('D3.js not loaded');
        return;
    }
    
    // Only run if Section 3 elements exist
    if (!document.getElementById('viz-energy-split')) {
        return;
    }

    // Initialize Section 3 visualizations
    initSection3();
});

function initSection3() {
    // Load Section 3 data files
    Promise.all([
        d3.csv('data/iae/iea_datacenter_energy_consumption.csv'),
        d3.csv('data/iae/iea_global_digital_energy_trends_2015_2022.csv')
    ]).then(function(datasets) {
        var energyConsumption = datasets[0];
        var digitalTrends = datasets[1];

        console.log('Section 3 Data loaded:', { energyConsumption, digitalTrends });

        // Create visualizations
        createEnergySplitDonut(energyConsumption);
        createGrowthComparisonChart(digitalTrends);
    }).catch(function(error) {
        console.error('Error loading Section 3 data:', error);
    });
}

// MAIN CHART: Growth vs Energy Comparison - Shows the efficiency story
function createGrowthComparisonChart(data) {
    var container = d3.select('#viz-growth-comparison');
    container.selectAll('*').remove();
    
    var margin = { top: 30, right: 30, bottom: 60, left: 45 };
    var width = 550 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;

    var svg = container.append('svg')
        .attr('viewBox', '0 0 550 300')
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Data: Growth percentages (2015 → 2022)
    var chartData = [
        { label: 'Traffic', growth: 633, category: 'demand' },
        { label: 'Workloads', growth: 344, category: 'demand' },
        { label: 'Users', growth: 77, category: 'demand' },
        { label: 'DC Energy', growth: 45, category: 'energy' },
        { label: 'Net Energy', growth: 41, category: 'energy' }
    ];

    // Scales
    var x = d3.scaleBand()
        .domain(chartData.map(function(d) { return d.label; }))
        .range([0, width])
        .padding(0.2);

    var y = d3.scaleLinear()
        .domain([0, 700])
        .range([height, 0]);

    // Color scale
    var colorScale = function(d) {
        if (d.category === 'demand') return '#dc3545';
        return '#28a745';
    };

    // Gridlines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y).tickSize(-width).tickFormat('').ticks(5))
        .selectAll('line')
        .style('stroke', '#e0e0e0')
        .style('stroke-dasharray', '2,2');

    // Divider line
    var dividerX = x('Users') + x.bandwidth() + (x('DC Energy') - x('Users') - x.bandwidth()) / 2;
    svg.append('line')
        .attr('x1', dividerX).attr('x2', dividerX)
        .attr('y1', -15).attr('y2', height + 10)
        .attr('stroke', '#ccc').attr('stroke-width', 1).attr('stroke-dasharray', '4,4');

    // Category labels
    svg.append('text')
        .attr('x', (x('Traffic') + x('Users') + x.bandwidth()) / 2)
        .attr('y', -12)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('fill', '#dc3545')
        .text('DEMAND GROWTH');

    svg.append('text')
        .attr('x', (x('DC Energy') + x('Net Energy') + x.bandwidth()) / 2)
        .attr('y', -12)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('fill', '#28a745')
        .text('ENERGY GROWTH');

    // Draw bars
    svg.selectAll('.bar')
        .data(chartData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) { return x(d.label); })
        .attr('y', height)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', colorScale)
        .attr('rx', 4)
        .transition()
        .duration(600)
        .delay(function(d, i) { return i * 100; })
        .attr('y', function(d) { return y(d.growth); })
        .attr('height', function(d) { return height - y(d.growth); });

    // Value labels
    svg.selectAll('.value-label')
        .data(chartData)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', function(d) { return x(d.label) + x.bandwidth() / 2; })
        .attr('y', function(d) { return y(d.growth) - 5; })
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .attr('fill', function(d) { return colorScale(d); })
        .attr('opacity', 0)
        .text(function(d) { return '+' + d.growth + '%'; })
        .transition()
        .duration(400)
        .delay(function(d, i) { return 600 + i * 100; })
        .attr('opacity', 1);

    // X axis
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll('text')
        .style('font-size', '10px')
        .attr('dy', '0.8em');

    svg.select('.domain').remove();

    // Y axis
    svg.append('g')
        .call(d3.axisLeft(y).tickFormat(function(d) { return d + '%'; }).ticks(5))
        .selectAll('text')
        .style('font-size', '9px');
}

// Donut Chart: Energy Split (Data Centers vs Networks vs Crypto)
function createEnergySplitDonut(data) {
    var container = d3.select('#viz-energy-split');
    container.selectAll('*').remove();
    
    var width = 340;
    var height = 280;
    var radius = Math.min(width, height) / 2 - 20;

    var svg = container.append('svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('max-width', '400px')
        .style('display', 'block')
        .style('margin', '0 auto');
    
    var g = svg.append('g')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

    // Prepare data for donut chart (using mid-range values)
    var pieData = [
        { label: 'Data Centres', value: 290, color: '#06A3DA' },
        { label: 'Networks', value: 310, color: '#F57E20' },
        { label: 'Crypto Mining', value: 110, color: '#6c757d' }
    ];

    var total = d3.sum(pieData, function(d) { return d.value; });

    var pie = d3.pie()
        .value(function(d) { return d.value; })
        .sort(null)
        .padAngle(0.02);

    var arc = d3.arc()
        .innerRadius(radius * 0.55)
        .outerRadius(radius);

    var arcHover = d3.arc()
        .innerRadius(radius * 0.55)
        .outerRadius(radius + 8);

    // Draw slices
    var slices = g.selectAll('.slice')
        .data(pie(pieData))
        .enter()
        .append('g')
        .attr('class', 'slice');

    slices.append('path')
        .attr('d', arc)
        .attr('fill', function(d) { return d.data.color; })
        .style('opacity', 0.9)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('d', arcHover)
                .style('opacity', 1);
        })
        .on('mouseout', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('d', arc)
                .style('opacity', 0.9);
        });

    // Add labels on slices
    slices.append('text')
        .attr('transform', function(d) {
            var pos = arc.centroid(d);
            return 'translate(' + pos[0] + ',' + pos[1] + ')';
        })
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(function(d) { 
            var pct = ((d.data.value / total) * 100).toFixed(0);
            return pct + '%';
        });

    // Center text
    g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.3em')
        .attr('font-size', '22px')
        .attr('font-weight', '700')
        .attr('fill', '#333')
        .text('~710');

    g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .attr('font-size', '11px')
        .attr('fill', '#666')
        .text('TWh Total');

    // Legend - positioned below chart
    var legendContainer = container.append('div')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('gap', '20px')
        .style('flex-wrap', 'wrap')
        .style('margin-top', '10px');

    pieData.forEach(function(d) {
        var item = legendContainer.append('div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('gap', '8px');

        item.append('div')
            .style('width', '14px')
            .style('height', '14px')
            .style('background-color', d.color)
            .style('border-radius', '3px');

        item.append('span')
            .style('font-size', '12px')
            .style('color', '#333')
            .style('font-weight', '500')
            .html(d.label + ' <span style="color:#666;font-weight:400">(' + d.value + ' TWh)</span>');
    });
}

// Bar Chart: Energy Growth (2015 vs 2022) - REMOVED, replaced by createGrowthComparisonChart
function createEnergyGrowthChart_DEPRECATED(data) {
    var container = d3.select('#viz-energy-growth');
    container.selectAll('*').remove();
    
    var margin = { top: 20, right: 20, bottom: 50, left: 60 };
    var width = 400 - margin.left - margin.right;
    var height = 260 - margin.top - margin.bottom;

    var svg = container.append('svg')
        .attr('viewBox', '0 0 400 260')
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Energy data (TWh)
    var chartData = [
        { label: 'Data\nCenters', value2015: 200, value2022: 290, color2022: '#06A3DA' },
        { label: 'Networks', value2015: 220, value2022: 310, color2022: '#F57E20' },
        { label: 'Crypto\nMining', value2015: 4, value2022: 110, color2022: '#6c757d' }
    ];

    var x0 = d3.scaleBand()
        .domain(chartData.map(function(d) { return d.label; }))
        .range([0, width])
        .padding(0.3);

    var x1 = d3.scaleBand()
        .domain(['2015', '2022'])
        .range([0, x0.bandwidth()])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([0, 350])
        .range([height, 0]);

    // Gridlines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat('')
            .ticks(5)
        )
        .selectAll('line')
        .style('stroke', '#e0e0e0')
        .style('stroke-dasharray', '3,3');

    // Y axis
    svg.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(function(d) { return d; }))
        .selectAll('text')
        .style('font-size', '10px');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -45)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .text('Energy (TWh)');

    svg.select('.domain').remove();

    // Draw bars
    var groups = svg.selectAll('.bar-group')
        .data(chartData)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('transform', function(d) { return 'translate(' + x0(d.label) + ',0)'; });

    // 2015 bars
    groups.append('rect')
        .attr('x', x1('2015'))
        .attr('y', function(d) { return y(d.value2015); })
        .attr('width', x1.bandwidth())
        .attr('height', function(d) { return height - y(d.value2015); })
        .attr('fill', '#adb5bd')
        .attr('rx', 3);

    // 2022 bars
    groups.append('rect')
        .attr('x', x1('2022'))
        .attr('y', function(d) { return y(d.value2022); })
        .attr('width', x1.bandwidth())
        .attr('height', function(d) { return height - y(d.value2022); })
        .attr('fill', function(d) { return d.color2022; })
        .attr('rx', 3);

    // Value labels
    groups.append('text')
        .attr('x', x1('2015') + x1.bandwidth() / 2)
        .attr('y', function(d) { return y(d.value2015) - 5; })
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('fill', '#666')
        .text(function(d) { return d.value2015; });

    groups.append('text')
        .attr('x', x1('2022') + x1.bandwidth() / 2)
        .attr('y', function(d) { return y(d.value2022) - 5; })
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-weight', '600')
        .attr('fill', function(d) { return d.color2022; })
        .text(function(d) { return d.value2022; });

    // X axis
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x0).tickSize(0))
        .selectAll('text')
        .style('font-size', '9px')
        .each(function(d) {
            var el = d3.select(this);
            var lines = d.split('\n');
            el.text('');
            lines.forEach(function(line, i) {
                el.append('tspan')
                    .attr('x', 0)
                    .attr('dy', i === 0 ? '0.6em' : '1.1em')
                    .text(line);
            });
        });

    // Growth % labels
    groups.append('text')
        .attr('x', x0.bandwidth() / 2)
        .attr('y', height + 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('fill', function(d) {
            var growth = (d.value2022 - d.value2015) / d.value2015 * 100;
            return growth > 100 ? '#dc3545' : '#28a745';
        })
        .text(function(d) { 
            var growth = ((d.value2022 - d.value2015) / d.value2015 * 100).toFixed(0);
            return '+' + growth + '%';
        });
}


// Section 4 (Afkir): Servers & Data Centers: The Engines Behind the Internet (Californie & Portugal) 


// Section 5 (Akkouh): Big Picture: Data Center Efficiency & Its Limits 
// ========================================================================

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    if (typeof d3 === 'undefined') {
        console.error('D3.js not loaded');
        return;
    }
    
    // Only run if Section 5 elements exist
    if (!document.getElementById('viz-pue-timeline')) {
        return;
    }

    // Initialize Section 5 visualizations
    initSection5();
});

function initSection5() {
    // Load all data files including ALL cloud providers
    Promise.all([
        d3.csv('data/uptime- global average/uptime_pue_historical_2007_2025.csv'),
        d3.csv('data/iae/iea_tech_company_energy2021.csv'),
        d3.csv('data/climatiq/cloud_provider_pue.csv'),
        d3.csv('data/yearly Carbon free energy for Google Cloud regions/2024.csv'),
        d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
        d3.csv('data/climatiq/aws_region_emissions.csv'),
        d3.csv('data/climatiq/azure_region_emissions.csv'),
        d3.csv('data/climatiq/gcp_region_emissions.csv')
    ]).then(function(datasets) {
        var pueHistory = datasets[0];
        var techEnergy = datasets[1];
        var providerPue = datasets[2];
        var gcpCfe = datasets[3];
        var worldData = datasets[4];
        var awsRegions = datasets[5];
        var azureRegions = datasets[6];
        var gcpRegions = datasets[7];

        // Create visualizations
        createPueTimelineChart(pueHistory);
        createComparisonChart(pueHistory, providerPue);
        createDonutChart(techEnergy);
        createProviderGauges(providerPue);
        createWorldMap(awsRegions, azureRegions, gcpRegions, worldData);
        createScatterPlot(gcpCfe);
        createEmissionsRankingChart(awsRegions, azureRegions, gcpRegions);

        // Hide the filter bar (not needed for these simpler charts)
        var filterBar = document.getElementById('pue-filters');
        if (filterBar) {
            filterBar.parentElement.style.display = 'none';
        }

    }).catch(function(error) {
        console.error('Error loading data:', error);
    });
}

// ============================================================
// Chart 1: PUE Evolution Over Time (Enhanced Line Chart)
// Container: #viz-pue-timeline
// ============================================================
function createPueTimelineChart(data) {
    var container = document.getElementById('viz-pue-timeline');
    if (!container) return;
    container.innerHTML = '';

    // Parse data
    data.forEach(function(d) {
        d.Year = +d.Year;
        d.Average_PUE = +d.Average_PUE;
    });

    // Dimensions - now full width, adjusted height
    var margin = {top: 50, right: 40, bottom: 45, left: 55};
    var width = container.offsetWidth - margin.left - margin.right;
    var height = 260 - margin.top - margin.bottom;
    var totalWidth = width + margin.left + margin.right;
    var totalHeight = height + margin.top + margin.bottom;

    // Create SVG with viewBox for responsiveness
    var svg = d3.select(container)
        .append('svg')
        .attr('viewBox', '0 0 ' + totalWidth + ' ' + totalHeight)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Gradient definition
    var defs = svg.append('defs');
    var gradient = defs.append('linearGradient')
        .attr('id', 'areaGradient')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3498db').attr('stop-opacity', 0.4);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#3498db').attr('stop-opacity', 0.05);

    // Scales
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.Year; }))
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain([1.4, 2.6])
        .range([height, 0]);

    // Grid lines
    svg.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.08)
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));

    // Area under line with gradient
    var area = d3.area()
        .x(function(d) { return x(d.Year); })
        .y0(height)
        .y1(function(d) { return y(d.Average_PUE); })
        .curve(d3.curveMonotoneX);

    svg.append('path')
        .datum(data)
        .attr('fill', 'url(#areaGradient)')
        .attr('d', area);

    // Line generator
    var line = d3.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d.Average_PUE); })
        .curve(d3.curveMonotoneX);

    // Draw line with animation
    var path = svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#2980b9')
        .attr('stroke-width', 3)
        .attr('d', line);

    var totalLength = path.node().getTotalLength();
    path.attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);

    // Add dots with delay
    svg.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', function(d) { return x(d.Year); })
        .attr('cy', function(d) { return y(d.Average_PUE); })
        .attr('r', 0)
        .attr('fill', '#2980b9')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .transition()
        .delay(function(d, i) { return 2000 + i * 80; })
        .duration(200)
        .attr('r', 5);

    // Add interactivity after animation
    setTimeout(function() {
        svg.selectAll('circle')
            .on('mouseover', function(event, d) {
                d3.select(this).transition().duration(150).attr('r', 9);
                tooltip.style('opacity', 1)
                    .html('<div style="font-size:15px;font-weight:bold;margin-bottom:4px">' + d.Year + '</div>' +
                          '<div style="font-size:14px">PUE: <span style="color:#3498db;font-weight:bold">' + d.Average_PUE.toFixed(2) + '</span></div>')
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY - 40) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this).transition().duration(150).attr('r', 5);
                tooltip.style('opacity', 0);
            });
    }, 3500);

    // X Axis
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(6))
        .selectAll('text')
        .style('font-size', '12px')
        .style('font-weight', '500');

    // Y Axis
    svg.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .selectAll('text')
        .style('font-size', '12px')
        .style('font-weight', '500');

    // Axis labels
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('fill', '#475569')
        .text('Average PUE');

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 38)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('fill', '#475569')
        .text('Year');

    // Improvement badge - positioned inside the chart area
    var firstPue = data[0].Average_PUE;
    var lastPue = data[data.length - 1].Average_PUE;
    var improvement = ((firstPue - lastPue) / firstPue * 100).toFixed(0);

    svg.append('rect')
        .attr('x', width - 110)
        .attr('y', -40)
        .attr('width', 110)
        .attr('height', 30)
        .attr('fill', 'url(#badgeGradient)')
        .attr('rx', 15);

    // Badge gradient
    var badgeGradient = defs.append('linearGradient')
        .attr('id', 'badgeGradient')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '100%').attr('y2', '0%');
    badgeGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981');
    badgeGradient.append('stop').attr('offset', '100%').attr('stop-color', '#059669');

    svg.append('text')
        .attr('x', width - 55)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('↓ ' + improvement + '% improved');

    // Tooltip
    var tooltip = d3.select('body').append('div')
        .attr('class', 'section5-tooltip')
        .style('position', 'absolute')
        .style('background', 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)')
        .style('border', '2px solid #3498db')
        .style('color', '#1e293b')
        .style('padding', '12px 16px')
        .style('border-radius', '12px')
        .style('font-size', '13px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('box-shadow', '0 8px 32px rgba(0,0,0,0.18)')
        .style('backdrop-filter', 'blur(8px)')
        .style('z-index', '9999');
}

// ============================================================
// Chart 1.5: Global vs Cloud Providers PUE Comparison
// Container: #viz-pue-comparison
// ============================================================
function createComparisonChart(pueHistory, providerPue) {
    var container = document.getElementById('viz-pue-comparison');
    if (!container) return;
    container.innerHTML = '';

    // Get latest global average from history (2025)
    var latestGlobal = pueHistory[pueHistory.length - 1];
    var globalPue = +latestGlobal.Average_PUE;

    // Prepare comparison data
    var comparisonData = [
        { name: 'Global Avg', pue: globalPue, color: '#e74c3c', icon: '🌍' }
    ];

    // Add cloud providers
    var providerColors = {
        'AWS': '#FF9900',
        'GCP': '#27ae60',
        'Azure': '#00A4EF'
    };

    providerPue.forEach(function(d) {
        if (d.provider !== 'Azure (Latest Designs)') {
            comparisonData.push({
                name: d.provider,
                pue: +d.pue,
                color: providerColors[d.provider],
                icon: d.provider === 'AWS' ? '☁️' : d.provider === 'GCP' ? '🟢' : '🔷'
            });
        }
    });

    // Sort by PUE (worst to best)
    comparisonData.sort(function(a, b) { return b.pue - a.pue; });

    // Dimensions
    var margin = {top: 20, right: 15, bottom: 35, left: 15};
    var width = container.offsetWidth - margin.left - margin.right;
    var height = 250 - margin.top - margin.bottom;
    var totalWidth = width + margin.left + margin.right;
    var totalHeight = height + margin.top + margin.bottom;

    var svg = d3.select(container)
        .append('svg')
        .attr('viewBox', '0 0 ' + totalWidth + ' ' + totalHeight)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Scales
    var x = d3.scaleBand()
        .domain(comparisonData.map(function(d) { return d.name; }))
        .range([0, width])
        .padding(0.35);

    var y = d3.scaleLinear()
        .domain([1.0, 1.7])
        .range([height, 0]);

    // Reference line at PUE 1.0 (perfect)
    svg.append('line')
        .attr('x1', 0).attr('x2', width)
        .attr('y1', y(1.0)).attr('y2', y(1.0))
        .attr('stroke', '#27ae60')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.5);

    svg.append('text')
        .attr('x', width)
        .attr('y', y(1.0) - 5)
        .attr('text-anchor', 'end')
        .style('font-size', '9px')
        .style('fill', '#27ae60')
        .text('Perfect (1.0)');

    // Draw bars
    svg.selectAll('.bar')
        .data(comparisonData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) { return x(d.name); })
        .attr('y', height)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', function(d) { return d.color; })
        .attr('rx', 4)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this).attr('opacity', 0.8);
            tooltip.style('opacity', 1)
                .html('<strong>' + d.name + '</strong><br>PUE: ' + d.pue.toFixed(3))
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 30) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this).attr('opacity', 1);
            tooltip.style('opacity', 0);
        })
        .transition()
        .duration(800)
        .delay(function(d, i) { return i * 150; })
        .attr('y', function(d) { return y(d.pue); })
        .attr('height', function(d) { return height - y(d.pue); });

    // Value labels on bars
    svg.selectAll('.value-label')
        .data(comparisonData)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', function(d) { return x(d.name) + x.bandwidth() / 2; })
        .attr('y', function(d) { return y(d.pue) - 8; })
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('fill', function(d) { return d.color; })
        .style('opacity', 0)
        .text(function(d) { return d.pue.toFixed(2); })
        .transition()
        .delay(1200)
        .duration(300)
        .style('opacity', 1);

    // X Axis labels with icons
    svg.selectAll('.x-label')
        .data(comparisonData)
        .enter()
        .append('text')
        .attr('class', 'x-label')
        .attr('x', function(d) { return x(d.name) + x.bandwidth() / 2; })
        .attr('y', height + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .style('fill', '#475569')
        .text(function(d) { return d.name; });

    // Efficiency comparison text
    var bestProvider = comparisonData[comparisonData.length - 1];
    var savings = ((globalPue - bestProvider.pue) / globalPue * 100).toFixed(0);

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 32)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('fill', '#10b981')
        .style('font-weight', 'bold')
        .text('☁️ Cloud providers ' + savings + '% more efficient');

    // Tooltip
    var tooltip = d3.select('body').append('div')
        .style('position', 'absolute')
        .style('background', 'linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%)')
        .style('color', 'white')
        .style('padding', '10px 14px')
        .style('border-radius', '10px')
        .style('font-size', '13px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('box-shadow', '0 6px 24px rgba(0,0,0,0.25)')
        .style('z-index', '9999');
}

// ============================================================
// Chart 2: Donut Chart - Tech Company Energy & Renewable %
// Container: #viz-pue-stats
// ============================================================
function createDonutChart(data) {
    var container = document.getElementById('viz-pue-stats');
    if (!container) return;
    container.innerHTML = '';

    // Parse data
    data.forEach(function(d) {
        d.Energy_Consumption_TWh = +d.Energy_Consumption_TWh;
        d.Renewable_Percentage = +d.Renewable_Percentage;
    });

    var total = d3.sum(data, function(d) { return d.Energy_Consumption_TWh; });

    // Dimensions - adjusted for col-4 layout
    var width = container.offsetWidth;
    var height = 220;
    var radius = Math.min(width, height) / 2 - 15;

    var svg = d3.select(container)
        .append('svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto')
        .append('g')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

    // Company colors
    var colors = {
        'Amazon': '#FF9900',
        'Google': '#4285F4',
        'Microsoft': '#00A4EF',
        'Meta': '#0668E1',
        'Apple': '#555555'
    };

    // Pie generator
    var pie = d3.pie()
        .value(function(d) { return d.Energy_Consumption_TWh; })
        .sort(null)
        .padAngle(0.03);

    // Arc generators
    var arc = d3.arc()
        .innerRadius(radius * 0.55)
        .outerRadius(radius);

    var arcHover = d3.arc()
        .innerRadius(radius * 0.55)
        .outerRadius(radius + 10);

    // Draw slices
    var slices = svg.selectAll('.slice')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'slice');

    slices.append('path')
        .attr('d', arc)
        .attr('fill', function(d) { return colors[d.data.Company] || '#999'; })
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition().duration(200)
                .attr('d', arcHover);
            
            centerText.text(d.data.Company);
            centerValue.text(d.data.Energy_Consumption_TWh + ' TWh');
            centerPercent.text(d.data.Renewable_Percentage + '% renewable');
        })
        .on('mouseout', function() {
            d3.select(this)
                .transition().duration(200)
                .attr('d', arc);
            
            centerText.text('Total');
            centerValue.text(total.toFixed(1) + ' TWh');
            centerPercent.text('Big Tech Energy');
        });

    // Center text
    var centerText = svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', -14)
        .style('font-size', '13px')
        .style('font-weight', '600')
        .style('fill', '#64748b')
        .text('Total');

    var centerValue = svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 10)
        .style('font-size', '22px')
        .style('font-weight', 'bold')
        .style('fill', '#1e293b')
        .text(total.toFixed(1) + ' TWh');

    var centerPercent = svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 28)
        .style('font-size', '11px')
        .style('fill', '#94a3b8')
        .text('Big Tech Energy');

    // Legend below
    var legend = d3.select(container).append('div')
        .style('display', 'flex')
        .style('flex-wrap', 'wrap')
        .style('justify-content', 'center')
        .style('gap', '10px')
        .style('margin-top', '12px');

    data.forEach(function(d) {
        legend.append('div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('font-size', '12px')
            .style('font-weight', '500')
            .style('color', '#475569')
            .html('<span style="width:14px;height:14px;background:' + colors[d.Company] + ';border-radius:4px;margin-right:6px;display:inline-block;box-shadow:0 2px 4px rgba(0,0,0,0.1)"></span>' + d.Company);
    });
}

// ============================================================
// Chart 3: Provider PUE Gauges (Fixed Layout)
// Container: #viz-pue-regions
// ============================================================
function createProviderGauges(data) {
    var container = document.getElementById('viz-pue-regions');
    if (!container) return;
    container.innerHTML = '';

    // Filter providers
    data = data.filter(function(d) { return d.provider !== 'Azure (Latest Designs)'; });
    data.forEach(function(d) { d.pue = +d.pue; });

    // Colors
    var colors = {
        'AWS': '#FF9900',
        'GCP': '#4285F4',
        'Azure': '#00A4EF'
    };

    // Create gauge for each provider - enhanced styling for col-4 layout
    var gaugeContainer = d3.select(container)
        .append('div')
        .style('display', 'flex')
        .style('justify-content', 'space-around')
        .style('align-items', 'center')
        .style('flex-wrap', 'wrap')
        .style('gap', '15px')
        .style('padding', '25px 15px');

    data.forEach(function(d) {
        var gauge = gaugeContainer.append('div')
            .style('text-align', 'center')
            .style('flex', '1 1 110px')
            .style('min-width', '110px')
            .style('max-width', '140px');

        var size = 65;
        var svg = gauge.append('svg')
            .attr('width', size * 2 + 20)
            .attr('height', size + 35)
            .style('display', 'block')
            .style('margin', '0 auto');

        var g = svg.append('g')
            .attr('transform', 'translate(' + (size + 10) + ',' + size + ')');

        // Background arc
        var bgArc = d3.arc()
            .innerRadius(size - 14)
            .outerRadius(size - 3)
            .startAngle(-Math.PI / 2)
            .endAngle(Math.PI / 2);

        g.append('path')
            .attr('d', bgArc)
            .attr('fill', '#e8e8e8');

        // Value arc (PUE 1.0 to 1.5 mapped to the arc)
        var scale = d3.scaleLinear()
            .domain([1.0, 1.5])
            .range([-Math.PI / 2, Math.PI / 2])
            .clamp(true);

        var valueArc = d3.arc()
            .innerRadius(size - 14)
            .outerRadius(size - 3)
            .startAngle(-Math.PI / 2)
            .endAngle(scale(d.pue));

        g.append('path')
            .attr('d', valueArc)
            .attr('fill', colors[d.provider]);

        // PUE value - larger text
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', -6)
            .style('font-size', '20px')
            .style('font-weight', 'bold')
            .style('fill', colors[d.provider])
            .text(d.pue.toFixed(2));

        // Provider name - larger
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 12)
            .style('font-size', '13px')
            .style('font-weight', '500')
            .style('fill', '#555')
            .text(d.provider);
    });

    // Best badge - enhanced
    var best = data.reduce(function(a, b) { return a.pue < b.pue ? a : b; });
    d3.select(container).append('div')
        .style('text-align', 'center')
        .style('margin-top', '12px')
        .html('<span style="background:#27ae60;color:white;padding:8px 18px;border-radius:20px;font-size:13px;font-weight:600;display:inline-block">🏆 ' + best.provider + ' most efficient</span>');
}

// ============================================================
// Chart 4: Scatter Plot - CFE % vs Carbon Intensity (Compact)
// Container: #viz-pue-sites
// ============================================================
function createScatterPlot(data) {
    var container = document.getElementById('viz-pue-sites');
    if (!container) return;
    container.innerHTML = '';

    // Parse data
    data.forEach(function(d) {
        d.cfe = +d['Google CFE'] * 100;
        d.carbon = +d['Grid carbon intensity (gCO2eq / kWh)'];
        d.region = d['Google Cloud Region'];
        // Determine continent
        if (d.region.startsWith('europe')) d.continent = 'Europe';
        else if (d.region.startsWith('us-') || d.region.startsWith('northamerica')) d.continent = 'North America';
        else if (d.region.startsWith('asia')) d.continent = 'Asia';
        else if (d.region.startsWith('australia')) d.continent = 'Australia';
        else if (d.region.startsWith('southamerica')) d.continent = 'South America';
        else if (d.region.startsWith('africa')) d.continent = 'Africa';
        else if (d.region.startsWith('me-')) d.continent = 'Middle East';
        else d.continent = 'Other';
    });

    // Dimensions - responsive with viewBox
    var margin = {top: 20, right: 20, bottom: 50, left: 55};
    var width = 500;
    var height = 320;
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;

    var svg = d3.select(container)
        .append('svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Continent colors
    var continentColors = {
        'Europe': '#27ae60',
        'North America': '#3498db',
        'Asia': '#e74c3c',
        'Australia': '#9b59b6',
        'South America': '#f39c12',
        'Africa': '#1abc9c',
        'Middle East': '#e67e22',
        'Other': '#95a5a6'
    };

    // Scales
    var x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, innerWidth]);

    var y = d3.scaleLinear()
        .domain([0, 700])
        .range([innerHeight, 0]);

    // Grid
    svg.append('g')
        .attr('opacity', 0.08)
        .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(''));

    // Green zone highlight
    svg.append('rect')
        .attr('x', x(60)).attr('y', 0)
        .attr('width', x(40)).attr('height', y(200))
        .attr('fill', '#27ae60')
        .attr('opacity', 0.1);

    svg.append('text')
        .attr('x', x(80)).attr('y', y(650))
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('fill', '#27ae60')
        .style('font-weight', 'bold')
        .text('🌱 Green Zone');

    // Draw points
    svg.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', function(d) { return x(d.cfe); })
        .attr('cy', function(d) { return y(d.carbon); })
        .attr('r', 0)
        .attr('fill', function(d) { return continentColors[d.continent]; })
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.85)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this).transition().duration(150).attr('r', 10);
            tooltip.style('opacity', 1)
                .html('<div style="font-weight:bold;margin-bottom:4px">' + d.Location + '</div>' +
                      '<div style="color:' + continentColors[d.continent] + ';font-size:11px">' + d.continent + '</div>' +
                      '<div style="margin-top:6px">CFE: <strong>' + d.cfe.toFixed(0) + '%</strong></div>' +
                      '<div>Carbon: <strong>' + d.carbon.toFixed(0) + '</strong> gCO₂/kWh</div>')
                .style('left', (event.pageX + 12) + 'px')
                .style('top', (event.pageY - 50) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this).transition().duration(150).attr('r', 6);
            tooltip.style('opacity', 0);
        })
        .transition()
        .delay(function(d, i) { return i * 20; })
        .duration(300)
        .attr('r', 6);

    // Axes
    svg.append('g')
        .attr('transform', 'translate(0,' + innerHeight + ')')
        .call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return d + '%'; }))
        .selectAll('text').style('font-size', '12px');

    svg.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .selectAll('text').style('font-size', '12px');

    // Axis labels
    svg.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 42)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('fill', '#555')
        .text('Carbon-Free Energy (%)');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -45)
        .attr('x', -innerHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('fill', '#555')
        .text('Carbon Intensity (gCO₂/kWh)');

    // Compact legend at bottom
    var legendContainer = d3.select(container).append('div')
        .style('display', 'flex')
        .style('flex-wrap', 'wrap')
        .style('justify-content', 'center')
        .style('gap', '12px')
        .style('margin-top', '12px');

    var continents = ['Europe', 'North America', 'Asia', 'Australia', 'South America'];
    continents.forEach(function(c) {
        var count = data.filter(function(d) { return d.continent === c; }).length;
        if (count === 0) return;
        
        legendContainer.append('div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('font-size', '12px')
            .html('<span style="width:12px;height:12px;background:' + continentColors[c] + ';border-radius:50%;margin-right:6px;display:inline-block"></span>' + c);
    });

    // Tooltip
    var tooltip = d3.select('body').append('div')
        .style('position', 'absolute')
        .style('background', 'rgba(255,255,255,0.98)')
        .style('border', '1px solid #ddd')
        .style('padding', '10px 14px')
        .style('border-radius', '8px')
        .style('font-size', '11px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('box-shadow', '0 4px 15px rgba(0,0,0,0.15)')
        .style('z-index', '9999');
}

// ============================================================
// Chart 5: World Map - ALL Cloud Provider Regions (AWS, Azure, GCP)
// Container: #viz-pue-map
// ============================================================
var mapGlobalData = null; // Store for filter functionality

function createWorldMap(awsData, azureData, gcpData, worldData) {
    var container = document.getElementById('viz-pue-map');
    if (!container) return;
    container.innerHTML = '';

    // Comprehensive coordinates for ALL regions
    var locationCoords = {
        // US Regions (various naming conventions)
        'N. Virginia': [-77.5, 39.0], 'Virginia': [-77.5, 39.0], 'Northern Virginia': [-77.5, 39.0],
        'Ohio': [-83.0, 40.0],
        'N. California': [-121.5, 38.5], 'California': [-119.4, 36.8],
        'Oregon': [-121.2, 45.6], 'Washington': [-122.3, 47.6],
        'Iowa': [-93.6, 41.6],
        'Illinois': [-89.6, 40.0],
        'Texas': [-97.7, 31.0],
        'Wyoming': [-107.3, 43.0],
        'Arizona': [-111.9, 34.0],
        'Georgia': [-83.5, 32.8],
        'South Carolina': [-80.9, 34.0],
        'Los Angeles': [-118.2, 34.1],
        'Salt Lake City': [-111.9, 40.8],
        'Las Vegas': [-115.1, 36.2],
        'AWS GovCloud East': [-77.5, 39.0],
        'AWS GovCloud West': [-121.2, 45.6],
        // Canada
        'Montreal': [-73.6, 45.5], 'Toronto': [-79.4, 43.7],
        'Quebec City': [-71.2, 46.8], 'Canada': [-106.3, 56.1],
        // South America
        'São Paulo': [-46.6, -23.5], 'Santiago': [-70.6, -33.4],
        'Brazil': [-47.9, -15.8], 'Chile': [-70.6, -33.4],
        // Europe
        'Ireland': [-6.3, 53.3], 'London': [-0.1, 51.5], 'UK': [-0.1, 51.5],
        'Frankfurt': [8.7, 50.1], 'Paris': [2.3, 48.9], 'France': [2.3, 48.9],
        'Germany': [10.4, 51.2],
        'Stockholm': [18.1, 59.3], 'Milan': [9.2, 45.5], 'Italy': [12.5, 41.9],
        'Netherlands': [4.9, 52.4], 'Zürich': [8.5, 47.4], 'Switzerland': [8.2, 46.8],
        'Belgium': [4.4, 50.8], 'Warsaw': [21.0, 52.2], 'Poland': [19.1, 51.9],
        'Finland': [25.0, 61.5], 'Madrid': [-3.7, 40.4], 'Spain': [-3.7, 40.4],
        'Gävle': [17.1, 60.7], 'Oslo': [10.7, 59.9], 'Norway': [8.5, 60.5],
        'Cardiff': [-3.2, 51.5], 'Sweden': [18.1, 59.3],
        // Middle East
        'Bahrain': [50.6, 26.0], 'Dubai': [55.3, 25.3], 'UAE': [54.0, 24.0],
        'Dammam': [50.1, 26.4], 'Doha': [51.5, 25.3], 'Qatar': [51.2, 25.3],
        'Tel Aviv': [34.8, 32.1], 'Israel': [35.2, 31.0],
        'Saudi Arabia': [45.0, 24.0],
        // Africa
        'Cape Town': [18.4, -33.9], 'Johannesburg': [28.0, -26.2],
        'South Africa': [25.0, -29.0],
        // Asia Pacific
        'Tokyo': [139.7, 35.7], 'Osaka': [135.5, 34.7], 'Japan': [138.3, 36.2],
        'Seoul': [127.0, 37.5], 'South Korea': [127.8, 35.9],
        'Singapore': [103.8, 1.4],
        'Hong Kong': [114.2, 22.3],
        'Mumbai': [72.9, 19.1], 'India': [78.9, 20.6],
        'Sydney': [151.2, -33.9], 'Melbourne': [145.0, -37.8],
        'Australia': [133.8, -25.3],
        'Beijing': [116.4, 39.9], 'Ningxia': [106.3, 38.5], 'China': [104.2, 35.9],
        'Taiwan': [120.5, 24.0],
        'Jakarta': [106.8, -6.2], 'Indonesia': [113.9, -0.8],
        'Pune': [73.9, 18.5], 'Delhi': [77.2, 28.6],
        'New South Wales': [151.2, -33.9], 'Victoria': [145.0, -37.8],
        // Countries as fallback
        'United States': [-95.7, 37.1],
        'United Kingdom': [-0.1, 51.5]
    };

    // Process all provider data
    var allRegions = [];
    
    // Helper function to safely parse emission values
    function parseEmission(value) {
        var parsed = parseFloat(value);
        if (isNaN(parsed) || parsed === null || parsed === undefined) {
            return null; // Mark as unavailable
        }
        return parsed * 1000; // Convert kg to g CO2/kWh
    }
    
    // AWS regions - uses emission_factor
    awsData.forEach(function(d) {
        allRegions.push({
            provider: 'AWS',
            region: d.region_name,
            country: d.country,
            emission: parseEmission(d.emission_factor),
            code: d.region_code
        });
    });

    // Azure regions - uses emission_factor
    azureData.forEach(function(d) {
        allRegions.push({
            provider: 'Azure',
            region: d.region_name,
            country: d.country,
            emission: parseEmission(d.emission_factor),
            code: d.region_code
        });
    });

    // GCP regions - uses emission_factor_raw (different column name!)
    gcpData.forEach(function(d) {
        allRegions.push({
            provider: 'GCP',
            region: d.region_name,
            country: d.country,
            emission: parseEmission(d.emission_factor_raw),
            code: d.region_code
        });
    });

    // Find coordinates for each region
    allRegions.forEach(function(d) {
        d.coords = locationCoords[d.region] || locationCoords[d.country] || null;
    });

    // Filter out regions without coordinates
    var mappedRegions = allRegions.filter(function(d) { return d.coords !== null; });

    // Store globally for filtering
    mapGlobalData = {
        regions: mappedRegions,
        worldData: worldData
    };

    // Dimensions - responsive with viewBox
    var width = 600;
    var height = 350;

    var svg = d3.select(container)
        .append('svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto');

    // Projection
    var projection = d3.geoNaturalEarth1()
        .scale(width / 4.5)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath().projection(projection);

    // Provider colors - GCP green, AWS yellow/orange, Azure blue
    var providerColors = {
        'AWS': '#FF9900',
        'Azure': '#00A4EF',
        'GCP': '#27ae60'
    };

    // Draw world map
    var countries = topojson.feature(worldData, worldData.objects.countries);
    
    svg.append('g')
        .selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', '#f0f0f0')
        .attr('stroke', '#ddd')
        .attr('stroke-width', 0.5);

    // Add data center points - colored by provider
    svg.selectAll('.datacenter')
        .data(mappedRegions)
        .enter()
        .append('circle')
        .attr('class', function(d) { return 'datacenter provider-' + d.provider; })
        .attr('cx', function(d) { return projection(d.coords)[0]; })
        .attr('cy', function(d) { return projection(d.coords)[1]; })
        .attr('r', 0)
        .attr('fill', function(d) { return providerColors[d.provider]; })
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('opacity', 0.85)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition().duration(150)
                .attr('r', 10)
                .attr('stroke-width', 2)
                .attr('opacity', 1);
            
            // Format emission value intelligently
            var emissionText;
            if (d.emission === null) {
                emissionText = '<span style="color:#999">Data unavailable</span>';
            } else if (d.emission < 1) {
                emissionText = '<strong>' + d.emission.toFixed(2) + '</strong> gCO₂/kWh <span style="color:#27ae60">(Very Clean!)</span>';
            } else if (d.emission < 50) {
                emissionText = '<strong>' + d.emission.toFixed(1) + '</strong> gCO₂/kWh <span style="color:#27ae60">(Clean)</span>';
            } else if (d.emission < 200) {
                emissionText = '<strong>' + d.emission.toFixed(0) + '</strong> gCO₂/kWh';
            } else {
                emissionText = '<strong>' + d.emission.toFixed(0) + '</strong> gCO₂/kWh <span style="color:#e74c3c">(High)</span>';
            }
            
            tooltip.style('opacity', 1)
                .html('<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">' +
                      '<span style="background:' + providerColors[d.provider] + ';color:white;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:bold">' + d.provider + '</span>' +
                      '<span style="font-weight:bold;font-size:12px">' + d.region + '</span></div>' +
                      '<div style="color:#666;font-size:10px;margin-bottom:6px">' + d.country + '</div>' +
                      '<div style="font-size:11px">Emissions: ' + emissionText + '</div>')
                .style('left', (event.pageX + 12) + 'px')
                .style('top', (event.pageY - 70) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .transition().duration(150)
                .attr('r', 6)
                .attr('stroke-width', 1)
                .attr('opacity', 0.85);
            tooltip.style('opacity', 0);
        })
        .transition()
        .delay(function(d, i) { return 200 + i * 10; })
        .duration(300)
        .attr('r', 6);

    // Tooltip
    var tooltip = d3.select('body').append('div')
        .attr('class', 'map-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(255,255,255,0.98)')
        .style('border', '1px solid #ddd')
        .style('padding', '10px 14px')
        .style('border-radius', '8px')
        .style('font-size', '11px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('box-shadow', '0 4px 15px rgba(0,0,0,0.2)')
        .style('z-index', '9999');

    // Setup external filter (in the side panel)
    setupMapFilters();
    updateMapStats(mappedRegions);
}

// Update map statistics panel (external)
function updateMapStats(regions) {
    var statsContainer = document.getElementById('viz-map-stats');
    if (!statsContainer) return;

    var awsCount = regions.filter(function(d) { return d.provider === 'AWS'; }).length;
    var azureCount = regions.filter(function(d) { return d.provider === 'Azure'; }).length;
    var gcpCount = regions.filter(function(d) { return d.provider === 'GCP'; }).length;
    var totalCount = regions.length;
    
    // Filter out null emissions for average calculation
    var validEmissions = regions.filter(function(d) { return d.emission !== null && !isNaN(d.emission); });
    var avgEmission = validEmissions.length > 0 ? d3.mean(validEmissions, function(d) { return d.emission; }) : 0;
    
    // Format average emission intelligently
    var avgEmissionStr = avgEmission < 1 ? avgEmission.toFixed(2) : avgEmission.toFixed(0);

    // Horizontal layout for stats
    statsContainer.innerHTML = 
        '<div class="stat-block">' +
            '<div class="stat-label">Regions</div>' +
            '<div class="stat-value">' + totalCount + '</div>' +
        '</div>' +
        '<div class="provider-counts">' +
            '<div class="provider-row"><span class="provider-dot" style="background:#FF9900"></span><span class="provider-name">AWS</span><span class="provider-count">' + awsCount + '</span></div>' +
            '<div class="provider-row"><span class="provider-dot" style="background:#00A4EF"></span><span class="provider-name">Azure</span><span class="provider-count">' + azureCount + '</span></div>' +
            '<div class="provider-row"><span class="provider-dot" style="background:#27ae60"></span><span class="provider-name">GCP</span><span class="provider-count">' + gcpCount + '</span></div>' +
        '</div>' +
        '<div class="stat-block">' +
            '<div class="stat-label">Avg Emissions</div>' +
            '<div class="stat-value-sm">' + avgEmissionStr + ' <span class="stat-unit">gCO₂/kWh</span></div>' +
        '</div>';
}

// Setup map filter checkboxes (external panel)
function setupMapFilters() {
    var checkboxes = document.querySelectorAll('.provider-filter');
    
    checkboxes.forEach(function(cb) {
        cb.addEventListener('change', function() {
            var provider = this.value;
            var isVisible = this.checked;
            
            // Show/hide points on map
            d3.selectAll('.provider-' + provider)
                .transition()
                .duration(300)
                .attr('opacity', isVisible ? 0.85 : 0)
                .attr('r', isVisible ? 6 : 0);
            
            // Update stats with filtered data
            if (mapGlobalData) {
                var activeProviders = Array.from(document.querySelectorAll('.provider-filter:checked'))
                    .map(function(c) { return c.value; });
                
                var filteredRegions = mapGlobalData.regions.filter(function(d) {
                    return activeProviders.includes(d.provider);
                });
                
                updateMapStats(filteredRegions);
            }
        });
    });
}

// ============================================================
// Chart 6: Top Greenest vs Highest Emission Regions
// Container: #viz-renewable-compare
// ============================================================
function createEmissionsRankingChart(awsData, azureData, gcpData) {
    var container = document.getElementById('viz-renewable-compare');
    if (!container) return;
    container.innerHTML = '';

    // Provider colors
    var providerColors = {
        'AWS': '#FF9900',
        'Azure': '#00A4EF',
        'GCP': '#27ae60'
    };

    // Combine all regions with emissions
    var allRegions = [];
    
    awsData.forEach(function(d) {
        var emission = +d.emission_factor * 1000;
        if (!isNaN(emission) && emission > 0) {
            allRegions.push({
                provider: 'AWS',
                region: d.region_name,
                country: d.country,
                emission: emission
            });
        }
    });
    
    azureData.forEach(function(d) {
        var emission = +d.emission_factor * 1000;
        if (!isNaN(emission) && emission > 0) {
            allRegions.push({
                provider: 'Azure',
                region: d.region_name,
                country: d.country,
                emission: emission
            });
        }
    });
    
    gcpData.forEach(function(d) {
        var emission = +d.emission_factor_raw * 1000;
        if (!isNaN(emission) && emission > 0) {
            allRegions.push({
                provider: 'GCP',
                region: d.region_name,
                country: d.country,
                emission: emission
            });
        }
    });

    // Sort and get top 5 greenest and top 5 highest
    allRegions.sort(function(a, b) { return a.emission - b.emission; });
    var greenest = allRegions.slice(0, 5);
    var highest = allRegions.slice(-5).reverse();

    // Dimensions
    var margin = {top: 15, right: 20, bottom: 25, left: 10};
    var totalWidth = container.offsetWidth - margin.left - margin.right;
    var height = 140 - margin.top - margin.bottom;
    var halfWidth = (totalWidth - 60) / 2; // Gap in middle
    var svgWidth = totalWidth + margin.left + margin.right;
    var svgHeight = height + margin.top + margin.bottom;

    var svg = d3.select(container)
        .append('svg')
        .attr('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Scales for greenest (left side, bars go right)
    var yGreen = d3.scaleBand()
        .domain(greenest.map(function(d) { return d.region; }))
        .range([0, height])
        .padding(0.2);

    var xGreen = d3.scaleLinear()
        .domain([0, d3.max(greenest, function(d) { return d.emission; }) * 1.2])
        .range([0, halfWidth]);

    // Scales for highest (right side, bars go left)
    var yHigh = d3.scaleBand()
        .domain(highest.map(function(d) { return d.region; }))
        .range([0, height])
        .padding(0.2);

    var xHigh = d3.scaleLinear()
        .domain([0, d3.max(highest, function(d) { return d.emission; }) * 1.2])
        .range([0, halfWidth]);

    // Left section title
    svg.append('text')
        .attr('x', halfWidth / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('fill', '#10b981')
        .text('🌱 Greenest Regions');

    // Right section title
    svg.append('text')
        .attr('x', halfWidth + 60 + halfWidth / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('fill', '#ef4444')
        .text('⚠️ Highest Emissions');

    // Draw greenest bars (left side)
    svg.selectAll('.green-bar')
        .data(greenest)
        .enter()
        .append('rect')
        .attr('class', 'green-bar')
        .attr('x', 0)
        .attr('y', function(d) { return yGreen(d.region); })
        .attr('width', 0)
        .attr('height', yGreen.bandwidth())
        .attr('fill', function(d) { return providerColors[d.provider]; })
        .attr('rx', 3)
        .attr('opacity', 0.85)
        .transition()
        .duration(600)
        .delay(function(d, i) { return i * 80; })
        .attr('width', function(d) { return xGreen(d.emission); });

    // Greenest labels - format small values properly
    svg.selectAll('.green-label')
        .data(greenest)
        .enter()
        .append('text')
        .attr('x', function(d) { return xGreen(d.emission) + 5; })
        .attr('y', function(d) { return yGreen(d.region) + yGreen.bandwidth() / 2 + 4; })
        .style('font-size', '11px')
        .style('font-weight', '500')
        .style('fill', '#1e293b')
        .text(function(d) { 
            var emissionStr = d.emission < 1 ? d.emission.toFixed(2) : d.emission.toFixed(0);
            return d.region + ' (' + emissionStr + ')'; 
        });

    // Draw highest bars (right side)
    var rightOffset = halfWidth + 60;
    
    svg.selectAll('.high-bar')
        .data(highest)
        .enter()
        .append('rect')
        .attr('class', 'high-bar')
        .attr('x', rightOffset)
        .attr('y', function(d) { return yHigh(d.region); })
        .attr('width', 0)
        .attr('height', yHigh.bandwidth())
        .attr('fill', function(d) { return providerColors[d.provider]; })
        .attr('rx', 3)
        .attr('opacity', 0.85)
        .transition()
        .duration(600)
        .delay(function(d, i) { return i * 80; })
        .attr('width', function(d) { return xHigh(d.emission); });

    // Highest labels
    svg.selectAll('.high-label')
        .data(highest)
        .enter()
        .append('text')
        .attr('x', function(d) { return rightOffset + xHigh(d.emission) + 8; })
        .attr('y', function(d) { return yHigh(d.region) + yHigh.bandwidth() / 2 + 5; })
        .style('font-size', '11px')
        .style('font-weight', '500')
        .style('fill', '#1e293b')
        .text(function(d) { return d.region + ' (' + d.emission.toFixed(0) + ')'; });

    // Center legend
    var legendY = innerHeight / 2 - 30;
    var legendX = halfWidth + 20;

    svg.append('text')
        .attr('x', legendX + 20)
        .attr('y', legendY)
        .style('font-size', '11px')
        .style('fill', '#64748b')
        .style('font-weight', 'bold')
        .text('gCO₂/kWh');

    ['AWS', 'Azure', 'GCP'].forEach(function(p, i) {
        svg.append('circle')
            .attr('cx', legendX + 8)
            .attr('cy', legendY + 18 + i * 18)
            .attr('r', 7)
            .attr('fill', providerColors[p])
            .style('filter', 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))');
        svg.append('text')
            .attr('x', legendX + 20)
            .attr('y', legendY + 22 + i * 18)
            .style('font-size', '12px')
            .style('font-weight', '600')
            .style('fill', '#475569')
            .text(p);
    });
}


// Section 6 (Motassim): UCBL1 Data Center: A Case Study


// Section 7 (Akkouh): What We Can Do: Solutions & Future Roadmap


// ===========================================
// INTERACTIVE CPU ENVIRONMENTAL IMPACT SIMULATOR (Simple Design)
// ===========================================
function createEnvironmentalSimulator(containerId) {
    const container = d3.select(`#${containerId}`);

    d3.json("data/terminals/cpu_data_enriched.json").then(data => {
        // Build the simulator UI
        const wrapper = container.append("div")
            .style("max-width", "1000px")
            .style("margin", "0 auto")
            .style("padding", "20px");

        // Title
        wrapper.append("div")
            .style("text-align", "center")
            .style("margin-bottom", "25px")
            .html(`
                <h3 style="color: #2c3e50; margin: 0;"> CPU Environmental Impact Simulator</h3>
                <p style="color: #7f8c8d; font-size: 13px; margin-top: 8px;">Select a CPU and adjust usage to see environmental impact</p>
            `);

        // Main layout - simpler 2 column
        const mainLayout = wrapper.append("div")
            .style("display", "grid")
            .style("grid-template-columns", "300px 1fr")
            .style("gap", "25px");

        // Controls Panel (simpler design)
        const controlsPanel = mainLayout.append("div")
            .style("background", "#f8f9fa")
            .style("padding", "20px")
            .style("border-radius", "12px")
            .style("border", "2px solid #e9ecef");

        controlsPanel.append("h4")
            .style("color", "#2c3e50")
            .style("margin", "0 0 15px 0")
            .style("font-size", "16px")
            .text("⚙️ Configuration");

        // CPU Dropdown
        const cpuGroup = controlsPanel.append("div").style("margin-bottom", "20px");
        cpuGroup.append("label")
            .style("display", "block")
            .style("margin-bottom", "5px")
            .style("font-size", "13px")
            .style("font-weight", "bold")
            .style("color", "#2c3e50")
            .text("💻 Select a CPU:");

        const cpuSelect = cpuGroup.append("select")
            .attr("id", "sim-cpu")
            .style("width", "100%")
            .style("padding", "10px")
            .style("border-radius", "6px")
            .style("border", "1px solid #ddd")
            .style("font-size", "12px")
            .style("cursor", "pointer");

        cpuSelect.selectAll("option")
            .data(data.sort((a, b) => a.name.localeCompare(b.name)))
            .enter()
            .append("option")
            .attr("value", (d, i) => i)
            .text(d => `${d.name} (${d.tdp}W, ${d.cores} cores)`);

        // CPU Info display
        const cpuInfo = controlsPanel.append("div")
            .attr("id", "cpu-info")
            .style("background", "#e3f2fd")
            .style("padding", "12px")
            .style("border-radius", "8px")
            .style("margin-bottom", "20px")
            .style("font-size", "12px");

        // Usage sliders
        const yearsGroup = controlsPanel.append("div").style("margin-bottom", "15px");
        yearsGroup.append("label")
            .style("display", "flex")
            .style("justify-content", "space-between")
            .style("margin-bottom", "5px")
            .style("font-size", "13px")
            .html(`<span>📅 Usage Duration</span><span id="years-value">4 years</span>`);
        yearsGroup.append("input")
            .attr("type", "range")
            .attr("id", "sim-years")
            .attr("min", 1).attr("max", 10).attr("value", 4)
            .style("width", "100%");

        const hoursGroup = controlsPanel.append("div").style("margin-bottom", "15px");
        hoursGroup.append("label")
            .style("display", "flex")
            .style("justify-content", "space-between")
            .style("margin-bottom", "5px")
            .style("font-size", "13px")
            .html(`<span>⏰ Daily Usage</span><span id="hours-value">12 h/day</span>`);
        hoursGroup.append("input")
            .attr("type", "range")
            .attr("id", "sim-hours")
            .attr("min", 1).attr("max", 24).attr("value", 12)
            .style("width", "100%");

        // Results Panel
        const resultsPanel = mainLayout.append("div");

        // Impact Cards (simpler)
        const cardsContainer = resultsPanel.append("div")
            .style("display", "grid")
            .style("grid-template-columns", "repeat(3, 1fr)")
            .style("gap", "15px")
            .style("margin-bottom", "20px");

        function createCard(parent, id, emoji, title, color) {
            const card = parent.append("div")
                .attr("id", id)
                .style("background", "white")
                .style("padding", "20px")
                .style("border-radius", "10px")
                .style("text-align", "center")
                .style("border-left", `4px solid ${color}`)
                .style("box-shadow", "0 2px 8px rgba(0,0,0,0.08)");

            card.append("div").style("font-size", "30px").text(emoji);
            card.append("div").style("font-size", "12px").style("color", "#7f8c8d").style("margin", "5px 0").text(title);
            card.append("div").attr("class", "value").style("font-size", "24px").style("font-weight", "bold").style("color", color).text("--");
            card.append("div").attr("class", "unit").style("font-size", "11px").style("color", "#95a5a6").text("");
        }

        createCard(cardsContainer, "gwp-card", "🌍", "CO₂ Emissions", "#27ae60");
        createCard(cardsContainer, "pe-card", "⚡", "Energy", "#e74c3c");
        createCard(cardsContainer, "adp-card", "💎", "Resources", "#f39c12");

        // Breakdown bars (simpler)
        const breakdownDiv = resultsPanel.append("div")
            .style("background", "white")
            .style("padding", "20px")
            .style("border-radius", "10px")
            .style("box-shadow", "0 2px 8px rgba(0,0,0,0.08)")
            .style("margin-bottom", "15px");

        breakdownDiv.append("h5")
            .style("margin", "0 0 15px 0")
            .style("color", "#2c3e50")
            .style("font-size", "14px")
            .text("📊 Manufacturing vs Usage");

        const barContainer = breakdownDiv.append("div").attr("id", "breakdown-bars");

        // Equivalents (cleaner design)
        const equivDiv = resultsPanel.append("div")
            .style("background", "linear-gradient(135deg, #27ae60, #2ecc71)")
            .style("color", "white")
            .style("padding", "15px 20px")
            .style("border-radius", "10px");

        equivDiv.append("h5").style("margin", "0 0 10px 0").style("font-size", "13px").text("🌱 Equivalent to:");
        const equivContent = equivDiv.append("div")
            .attr("id", "equiv-content")
            .style("display", "flex")
            .style("gap", "20px")
            .style("justify-content", "center")
            .style("font-size", "13px");

        // Update function
        function updateSimulation() {
            const cpuIndex = +document.getElementById("sim-cpu").value;
            const cpu = data[cpuIndex];
            const years = +document.getElementById("sim-years").value;
            const hours = +document.getElementById("sim-hours").value;

            // Update displays
            document.getElementById("years-value").textContent = years + " years";
            document.getElementById("hours-value").textContent = hours + " h/day";

            // Show CPU info
            d3.select("#cpu-info").html(`
                <strong>${cpu.name}</strong><br/>
                🏭 ${cpu.manufacturer} • ⚡ ${cpu.tdp}W • 🔢 ${cpu.cores} cores
            `);

            // Calculate adjusted values
            const yearsFactor = years / 4;
            const hoursFactor = hours / 12;  // API data baseline: 50% workload = 12h/day

            const gwp_embedded = cpu.gwp_embedded;
            const gwp_use = cpu.gwp_use * yearsFactor * hoursFactor;
            const pe_embedded = cpu.pe_embedded;
            const pe_use = cpu.pe_use * yearsFactor * hoursFactor;
            const adp_embedded = cpu.adp_embedded;
            const adp_use = cpu.adp_use * yearsFactor * hoursFactor;

            const gwp_total = gwp_embedded + gwp_use;
            const pe_total = pe_embedded + pe_use;
            const adp_total = adp_embedded + adp_use;

            // Update cards
            // Convert MJ to kWh (1 MJ = 0.2778 kWh)
            const pe_kWh = pe_total * 0.2778;
            
            d3.select("#gwp-card .value").text(gwp_total.toFixed(1));
            d3.select("#gwp-card .unit").text("kg CO₂");
            d3.select("#pe-card .value").text(pe_kWh.toFixed(0));
            d3.select("#pe-card .unit").text("kWh");
            d3.select("#adp-card .value").text(adp_total.toExponential(2));
            d3.select("#adp-card .unit").text("kg Sb eq");

            // Update breakdown bars
            const gwpPct = (gwp_embedded / gwp_total * 100).toFixed(0);
            const pePct = (pe_embedded / pe_total * 100).toFixed(0);

            d3.select("#breakdown-bars").html(`
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                        <span>🌍 CO₂</span>
                        <span>${gwpPct}% mfg / ${100-gwpPct}% use</span>
                    </div>
                    <div style="height: 20px; background: #ecf0f1; border-radius: 10px; overflow: hidden; display: flex;">
                        <div style="width: ${gwpPct}%; background: #3498db;"></div>
                        <div style="width: ${100-gwpPct}%; background: #e74c3c;"></div>
                    </div>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                        <span>⚡ Energy</span>
                        <span>${pePct}% mfg / ${100-pePct}% use</span>
                    </div>
                    <div style="height: 20px; background: #ecf0f1; border-radius: 10px; overflow: hidden; display: flex;">
                        <div style="width: ${pePct}%; background: #3498db;"></div>
                        <div style="width: ${100-pePct}%; background: #e74c3c;"></div>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; margin-top: 10px; font-size: 11px; color: #7f8c8d;">
                    <span>🟦 Manufacturing</span>
                    <span>🟥 Usage</span>
                </div>
            `);

            // Update equivalents
            const carKm = gwp_total / 0.12;
            const trees = gwp_total / 21;
            d3.select("#equiv-content").html(`
                <span>🚗 ${carKm.toFixed(0)} km by car</span>
                <span>•</span>
                <span>🌳 ${trees.toFixed(1)} trees to offset</span>
            `);
        }

        // Event listeners
        document.getElementById("sim-cpu").addEventListener("change", updateSimulation);
        document.getElementById("sim-years").addEventListener("input", updateSimulation);
        document.getElementById("sim-hours").addEventListener("input", updateSimulation);

        // Initial calculation
        updateSimulation();

    }).catch(error => console.error("Error:", error));
}

