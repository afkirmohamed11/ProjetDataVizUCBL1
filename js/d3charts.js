// this file contains code from the D3.js library

// Section 1 (Motassim): Why It Matters: Data in Our Daily Lives


// Section 2 (Ben Touhami): Inside Your Device: How Much Energy Does It Use?

// Visualization 1: GWP (CO2 Emissions) Analysis - Interactive Scatter Plot
function createGWPAnalysis(containerId) {
    const margin = { top: 60, right: 200, bottom: 80, left: 80 };
    const width = 1200 - margin.left - margin.right;
    const height = 650 - margin.top - margin.bottom;

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
            .attr("y", -35)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text("🌍 Climate Impact: CO₂ Emissions vs Power Consumption");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -12)
            .attr("text-anchor", "middle")
            .attr("font-size", "13px")
            .attr("fill", "#7f8c8d")
            .text("Hover over points to see detailed information • Size = Number of cores");

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

        // Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width + 20}, 0)`);

        legend.append("text")
            .attr("y", -5)
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text("Manufacturers");

        manufacturers.forEach((mfr, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 25 + 15})`)
                .style("cursor", "pointer")
                .on("click", function() {
                    const isActive = d3.select(this).classed("inactive");
                    d3.select(this).classed("inactive", !isActive);
                    circles.filter(d => d.manufacturer === mfr)
                        .transition()
                        .duration(300)
                        .attr("opacity", isActive ? 0.75 : 0.1);
                });

            legendRow.append("circle")
                .attr("cx", 8)
                .attr("cy", 0)
                .attr("r", 7)
                .attr("fill", colorScale(mfr))
                .attr("stroke", "#fff")
                .attr("stroke-width", 2);

            legendRow.append("text")
                .attr("x", 22)
                .attr("y", 5)
                .attr("font-size", "12px")
                .attr("fill", "#2c3e50")
                .text(mfr);
        });

    }).catch(error => console.error("Error:", error));
}

// Visualization 2: PE (Primary Energy) Analysis - Interactive Scatter Plot
function createPEAnalysis(containerId) {
    const margin = { top: 60, right: 200, bottom: 80, left: 80 };
    const width = 1200 - margin.left - margin.right;
    const height = 650 - margin.top - margin.bottom;

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
            .range(d3.schemePaired);

        // Create scales
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.tdp) * 1.05])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.pe_total) * 1.05])
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
            .call(d3.axisLeft(yScale).tickFormat(d => `${d} MJ`))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -60)
            .attr("fill", "#2c3e50")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .style("text-anchor", "middle")
            .text("Total Primary Energy (MJ)");

        // Title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -35)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text("⚡ Energy Consumption: Primary Energy vs Power Rating");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -12)
            .attr("text-anchor", "middle")
            .attr("font-size", "13px")
            .attr("fill", "#7f8c8d")
            .text("Hover over points to see detailed information • Size = Number of cores");

        // Create tooltip
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)")
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
            .attr("cy", d => yScale(d.pe_total))
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
                        <div style="font-size: 15px; margin-bottom: 8px;"><strong>⚡ Energy Consumption (PE):</strong></div>
                        <div style="background: rgba(255,255,255,0.2); padding: 8px; border-radius: 6px; margin-bottom: 5px;">
                            <strong>Total:</strong> ${d.pe_total.toFixed(0)} MJ
                        </div>
                        <div style="font-size: 12px; padding-left: 10px;">
                            • Manufacturing: ${d.pe_embedded.toFixed(0)} MJ<br/>
                            • 4-year usage: ${d.pe_use.toFixed(0)} MJ
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

        // Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width + 20}, 0)`);

        legend.append("text")
            .attr("y", -5)
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text("Manufacturers");

        manufacturers.forEach((mfr, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 25 + 15})`)
                .style("cursor", "pointer")
                .on("click", function() {
                    const isActive = d3.select(this).classed("inactive");
                    d3.select(this).classed("inactive", !isActive);
                    circles.filter(d => d.manufacturer === mfr)
                        .transition()
                        .duration(300)
                        .attr("opacity", isActive ? 0.75 : 0.1);
                });

            legendRow.append("circle")
                .attr("cx", 8)
                .attr("cy", 0)
                .attr("r", 7)
                .attr("fill", colorScale(mfr))
                .attr("stroke", "#fff")
                .attr("stroke-width", 2);

            legendRow.append("text")
                .attr("x", 22)
                .attr("y", 5)
                .attr("font-size", "12px")
                .attr("fill", "#2c3e50")
                .text(mfr);
        });

    }).catch(error => console.error("Error:", error));
}

// Visualization 3: ADP (Resource Depletion) Analysis - Interactive Scatter Plot
function createADPAnalysis(containerId) {
    const margin = { top: 60, right: 200, bottom: 80, left: 90 };
    const width = 1200 - margin.left - margin.right;
    const height = 650 - margin.top - margin.bottom;

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
            .range(d3.schemeTableau10);

        // Create scales
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.tdp) * 1.05])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.adp_total) * 1.05])
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
            .call(d3.axisLeft(yScale).tickFormat(d => d.toExponential(2)))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -70)
            .attr("fill", "#2c3e50")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .style("text-anchor", "middle")
            .text("Resource Depletion - ADP (kg Sb eq)");

        // Title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -35)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text("💎 Resource Depletion: Rare Materials Usage vs Power");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -12)
            .attr("text-anchor", "middle")
            .attr("font-size", "13px")
            .attr("fill", "#7f8c8d")
            .text("Hover over points to see detailed information • Size = Number of cores");

        // Create tooltip
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "linear-gradient(135deg, #fa709a 0%, #fee140 100%)")
            .style("color", "#2c3e50")
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
            .attr("cy", d => yScale(d.adp_total))
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
                    <div style="border-bottom: 2px solid rgba(0,0,0,0.2); padding-bottom: 10px; margin-bottom: 10px;">
                        <strong style="font-size: 16px;">${d.name}</strong>
                    </div>
                    <div style="display: grid; gap: 8px;">
                        <div><strong>🏭 Manufacturer:</strong> ${d.manufacturer}</div>
                        <div><strong>⚡ TDP:</strong> ${d.tdp}W</div>
                        <div><strong>🔢 Cores:</strong> ${d.cores}</div>
                        <div><strong>⏱️ Frequency:</strong> ${d.frequency} GHz</div>
                        <div><strong>📏 Die Size:</strong> ${d.total_die_size} mm²</div>
                    </div>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid rgba(0,0,0,0.2);">
                        <div style="font-size: 15px; margin-bottom: 8px;"><strong>💎 Resource Depletion (ADP):</strong></div>
                        <div style="background: rgba(255,255,255,0.5); padding: 8px; border-radius: 6px; margin-bottom: 5px;">
                            <strong>Total:</strong> ${d.adp_total.toExponential(3)} kg Sb eq
                        </div>
                        <div style="font-size: 12px; padding-left: 10px;">
                            • Manufacturing: ${d.adp_embedded.toExponential(3)} kg<br/>
                            • 4-year usage: ${d.adp_use.toExponential(3)} kg
                        </div>
                        <div style="margin-top: 10px; font-size: 11px; font-style: italic; opacity: 0.8;">
                            ADP measures rare material depletion<br/>(antimony equivalent)
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

        // Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width + 20}, 0)`);

        legend.append("text")
            .attr("y", -5)
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text("Manufacturers");

        manufacturers.forEach((mfr, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 25 + 15})`)
                .style("cursor", "pointer")
                .on("click", function() {
                    const isActive = d3.select(this).classed("inactive");
                    d3.select(this).classed("inactive", !isActive);
                    circles.filter(d => d.manufacturer === mfr)
                        .transition()
                        .duration(300)
                        .attr("opacity", isActive ? 0.75 : 0.1);
                });

            legendRow.append("circle")
                .attr("cx", 8)
                .attr("cy", 0)
                .attr("r", 7)
                .attr("fill", colorScale(mfr))
                .attr("stroke", "#fff")
                .attr("stroke-width", 2);

            legendRow.append("text")
                .attr("x", 22)
                .attr("y", 5)
                .attr("font-size", "12px")
                .attr("fill", "#2c3e50")
                .text(mfr);
        });

    }).catch(error => console.error("Error:", error));
}

// Visualization 4: GPU vs CPU - GWP Comparison
function createGPUvsCPU_GWP(containerId) {
    const margin = { top: 60, right: 40, bottom: 80, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

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

        const comparisonData = [
            { type: "CPU", gwp: avgCPU_GWP, color: "#3498db" },
            { type: "GPU", gwp: avgGPU_GWP, color: "#e74c3c" }
        ];

        const xScale = d3.scaleBand()
            .domain(comparisonData.map(d => d.type))
            .range([0, width])
            .padding(0.3);

        const yScale = d3.scaleLinear()
            .domain([0, Math.max(avgCPU_GWP, avgGPU_GWP) * 1.2])
            .range([height, 0]);

        // Axes
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("font-size", "16px")
            .attr("font-weight", "bold");

        svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat(d => `${d} kg`));

        // Title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -30)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .text("CPU vs GPU: CO₂ Emissions Comparison");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "#7f8c8d")
            .text("Average emissions over 4 years");

        // Bars
        svg.selectAll(".bar")
            .data(comparisonData)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.type))
            .attr("y", d => yScale(d.gwp))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.gwp))
            .attr("fill", d => d.color);

        // Value labels
        svg.selectAll(".label")
            .data(comparisonData)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.type) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d.gwp) - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .text(d => `${d.gwp.toFixed(1)} kg`);

        // Ratio annotation
        const ratio = (avgGPU_GWP / avgCPU_GWP).toFixed(1);
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 60)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "#e74c3c")
            .text(`⚠️ GPUs emit ${ratio}x more CO₂ than CPUs`);

        // Y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -60)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .text("Average CO₂ (kg CO₂eq)");

    }).catch(error => console.error("Error:", error));
}

// Visualization 5: GPU vs CPU - PE Comparison
function createGPUvsCPU_PE(containerId) {
    const margin = { top: 60, right: 40, bottom: 80, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.json("data/terminals/cpu_gpu_comparison.json").then(data => {
        const cpus = data.filter(d => d.type === 'CPU');
        const gpus = data.filter(d => d.type === 'GPU');

        const avgCPU_PE = d3.mean(cpus, d => d.pe_total);
        const avgGPU_PE = d3.mean(gpus, d => d.pe_total);

        const comparisonData = [
            { type: "CPU", pe: avgCPU_PE, color: "#3498db" },
            { type: "GPU", pe: avgGPU_PE, color: "#f39c12" }
        ];

        const xScale = d3.scaleBand()
            .domain(comparisonData.map(d => d.type))
            .range([0, width])
            .padding(0.3);

        const yScale = d3.scaleLinear()
            .domain([0, Math.max(avgCPU_PE, avgGPU_PE) * 1.2])
            .range([height, 0]);

        // Axes
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("font-size", "16px")
            .attr("font-weight", "bold");

        svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat(d => `${d} MJ`));

        // Title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -30)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .text("CPU vs GPU: Energy Consumption Comparison");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "#7f8c8d")
            .text("Average energy used over 4 years");

        // Bars
        svg.selectAll(".bar")
            .data(comparisonData)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.type))
            .attr("y", d => yScale(d.pe))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.pe))
            .attr("fill", d => d.color);

        // Value labels
        svg.selectAll(".label")
            .data(comparisonData)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.type) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d.pe) - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .text(d => `${d.pe.toFixed(0)} MJ`);

        // Ratio annotation
        const ratio = (avgGPU_PE / avgCPU_PE).toFixed(1);
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 60)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "#f39c12")
            .text(`⚡ GPUs consume ${ratio}x more energy than CPUs`);

        // Y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -60)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .text("Average Energy (MJ)");

    }).catch(error => console.error("Error:", error));
}

// Section 3 (): When Data Leaves Your Device: Network & Cloud


// Section 4 (Afkir): Servers & Data Centers: The Engines Behind the Internet (Californie & Portugal) 


// Section 5 (Akkouh): Big Picture: Data Center Efficiency & Its Limits 


// Section 6 (Motassim): UCBL1 Data Center: A Case Study


// Section 7 (): What We Can Do: Solutions & Future Roadmap

