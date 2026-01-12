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

        // Simple inline legend at bottom
        const legendGroup = svg.append("g")
            .attr("transform", `translate(${width / 2 - manufacturers.length * 50}, ${height + 55})`);

        manufacturers.forEach((mfr, i) => {
            const item = legendGroup.append("g")
                .attr("transform", `translate(${i * 100}, 0)`);

            item.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 6)
                .attr("fill", colorScale(mfr));

            item.append("text")
                .attr("x", 12)
                .attr("y", 4)
                .attr("font-size", "11px")
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


// Section 4 (Afkir): Servers & Data Centers: The Engines Behind the Internet (Californie & Portugal) 


// Section 5 (Akkouh): Big Picture: Data Center Efficiency & Its Limits 


// Section 6 (Motassim): UCBL1 Data Center: A Case Study


// Section 7 (): What We Can Do: Solutions & Future Roadmap


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
                <h3 style="color: #2c3e50; margin: 0;">🎮 CPU Environmental Impact Simulator</h3>
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
            .html(`<span>⏰ Daily Usage</span><span id="hours-value">8 h/day</span>`);
        hoursGroup.append("input")
            .attr("type", "range")
            .attr("id", "sim-hours")
            .attr("min", 1).attr("max", 24).attr("value", 8)
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
            const hoursFactor = hours / 8;

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

