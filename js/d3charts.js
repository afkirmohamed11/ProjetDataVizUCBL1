// D3.js Visualizations - Cleaned Version

// ===========================================
// Section 2: Environmental Impact Analysis
// ===========================================

// COMBINED VISUALIZATION: Environmental Impact Scatter Plot with Filter (GWP, PE, ADP)
function createCombinedImpactAnalysis(containerId) {
    const container = d3.select(`#${containerId}`);
    
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
            const colorScale = d3.scaleOrdinal().domain(manufacturers).range(d3.schemeSet2);

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

            const xScale = d3.scaleLinear().domain([0, d3.max(data, d => d.tdp) * 1.05]).range([0, width]);
            const yScale = d3.scaleLinear().domain([0, d3.max(data, yAccessor) * 1.05]).range([height, 0]);
            const sizeScale = d3.scaleSqrt().domain([d3.min(data, d => d.cores), d3.max(data, d => d.cores)]).range([4, 12]);

            svg.append("g").attr("opacity", 0.1).call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));
            svg.append("g").attr("opacity", 0.1).attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale).tickSize(-height).tickFormat(""));

            svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale))
                .append("text").attr("x", width / 2).attr("y", 45).attr("fill", "#2c3e50").attr("font-size", "12px").attr("font-weight", "bold").style("text-anchor", "middle").text("TDP - Thermal Design Power (Watts)");

            svg.append("g").call(d3.axisLeft(yScale).tickFormat(d => metricType === "adp" ? d.toExponential(1) : d.toFixed(0)))
                .append("text").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -60).attr("fill", "#2c3e50").attr("font-size", "12px").attr("font-weight", "bold").style("text-anchor", "middle").text(yLabel);

            svg.append("text").attr("x", width / 2).attr("y", -35).attr("text-anchor", "middle").attr("font-size", "16px").attr("font-weight", "bold").attr("fill", "#2c3e50").text(title);
            svg.append("text").attr("x", width / 2).attr("y", -15).attr("text-anchor", "middle").attr("font-size", "11px").attr("fill", "#7f8c8d").text("Hover for details • Size = cores");

            const tooltip = d3.select("body").append("div").style("position", "absolute").style("visibility", "hidden").style("background", "#2c3e50").style("color", "white").style("padding", "12px 16px").style("border-radius", "8px").style("font-size", "12px").style("max-width", "280px").style("pointer-events", "none").style("z-index", "1000");

            svg.selectAll(".point").data(data).enter().append("circle").attr("class", "point")
                .attr("cx", d => xScale(d.tdp)).attr("cy", d => yScale(yAccessor(d))).attr("r", 0)
                .attr("fill", d => colorScale(d.manufacturer)).attr("opacity", 0.7).attr("stroke", "white").attr("stroke-width", 1.5).style("cursor", "pointer")
                .on("mouseover", function(event, d) {
                    d3.select(this).transition().duration(200).attr("r", sizeScale(d.cores) * 1.5).attr("opacity", 1).attr("stroke-width", 3);
                    let valueInfo = metricType === "gwp" ? `<div><strong>🌍 CO₂ Total:</strong> ${d.gwp_total.toFixed(1)} kg</div><div style="font-size:11px;">• Manufacturing: ${d.gwp_embedded.toFixed(1)} kg</div><div style="font-size:11px;">• Usage: ${d.gwp_use.toFixed(1)} kg</div>` :
                        metricType === "pe" ? `<div><strong>⚡ Energy Total:</strong> ${(d.pe_total * MJ_TO_KWH).toFixed(0)} kWh</div><div style="font-size:11px;">• Manufacturing: ${(d.pe_embedded * MJ_TO_KWH).toFixed(1)} kWh</div><div style="font-size:11px;">• Usage: ${(d.pe_use * MJ_TO_KWH).toFixed(0)} kWh</div>` :
                        `<div><strong>💎 ADP Total:</strong> ${d.adp_total.toExponential(2)} kg Sb eq</div><div style="font-size:11px;">• Manufacturing: ${d.adp_embedded.toExponential(2)}</div><div style="font-size:11px;">• Usage: ${d.adp_use.toExponential(2)}</div>`;
                    tooltip.html(`<strong style="font-size:14px;">${d.name}</strong><br/><div style="margin: 8px 0; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.3);"><div>🏭 ${d.manufacturer} • ⚡ ${d.tdp}W • 🔢 ${d.cores} cores</div></div>${valueInfo}`).style("visibility", "visible");
                })
                .on("mousemove", function(event) { tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 15) + "px"); })
                .on("mouseout", function() {
                    d3.select(this).transition().duration(200).attr("r", d => sizeScale(d.cores)).attr("opacity", 0.7).attr("stroke-width", 1.5);
                    tooltip.style("visibility", "hidden");
                })
                .transition().duration(600).delay((d, i) => i * 2).attr("r", d => sizeScale(d.cores));

            const legend = svg.append("g").attr("transform", `translate(${width + 20}, 20)`);
            legend.append("text").attr("font-size", "12px").attr("font-weight", "bold").attr("fill", "#2c3e50").text("Manufacturers");
            manufacturers.forEach((mfr, i) => {
                const row = legend.append("g").attr("transform", `translate(0, ${i * 25 + 20})`);
                row.append("circle").attr("r", 6).attr("fill", colorScale(mfr));
                row.append("text").attr("x", 12).attr("y", 4).attr("font-size", "11px").attr("fill", "#2c3e50").text(mfr);
            });
        }).catch(error => console.error("Error:", error));
    }

    drawScatterPlot("gwp");
}

// COMBINED VISUALIZATION: GPU vs CPU Comparison
function createCombinedGPUvsCPU(containerId) {
    const container = d3.select(`#${containerId}`);
    
    const filterDiv = container.append("div").style("text-align", "center").style("margin-bottom", "20px");
    filterDiv.append("span").style("font-weight", "bold").style("margin-right", "15px").style("color", "#2c3e50").text("Compare by:");

    const metrics = [
        { id: "gwp", label: "🌍 CO₂ Emissions", color: "#27ae60" },
        { id: "pe", label: "⚡ Energy (kWh)", color: "#e74c3c" }
    ];

    metrics.forEach((metric, i) => {
        filterDiv.append("button")
            .attr("class", "gpu-cpu-filter-btn")
            .attr("data-metric", metric.id)
            .style("padding", "10px 25px").style("margin", "0 8px")
            .style("border", i === 0 ? `2px solid ${metric.color}` : "2px solid #ddd")
            .style("background", i === 0 ? metric.color : "white")
            .style("color", i === 0 ? "white" : "#2c3e50")
            .style("border-radius", "25px").style("cursor", "pointer").style("font-weight", "bold").style("font-size", "14px").style("transition", "all 0.3s ease")
            .text(metric.label)
            .on("click", function() {
                filterDiv.selectAll(".gpu-cpu-filter-btn").style("background", "white").style("color", "#2c3e50").style("border", "2px solid #ddd");
                d3.select(this).style("background", metric.color).style("color", "white").style("border", `2px solid ${metric.color}`);
                drawGPUvsCPUChart(metric.id);
            });
    });

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
            .style("display", "block").style("margin", "0 auto")
            .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        d3.json("data/terminals/cpu_gpu_comparison.json").then(data => {
            const cpus = data.filter(d => d.type === 'CPU');
            const gpus = data.filter(d => d.type === 'GPU');

            let avgCPU, avgGPU, unit, title;
            if (metricType === "gwp") {
                avgCPU = d3.mean(cpus, d => d.gwp_total);
                avgGPU = d3.mean(gpus, d => d.gwp_total);
                unit = "kg CO₂"; title = "🌍 CO₂ Emissions: CPU vs GPU";
            } else {
                avgCPU = d3.mean(cpus, d => d.pe_total) * MJ_TO_KWH;
                avgGPU = d3.mean(gpus, d => d.pe_total) * MJ_TO_KWH;
                unit = "kWh"; title = "⚡ Energy Consumption: CPU vs GPU";
            }

            const barData = [
                { type: "CPU", value: avgCPU, color: "#3498db", icon: "" },
                { type: "GPU", value: avgGPU, color: metricType === "gwp" ? "#e74c3c" : "#f39c12", icon: "" }
            ];

            svg.append("text").attr("x", width / 2).attr("y", -30).attr("text-anchor", "middle").attr("font-size", "20px").attr("font-weight", "bold").attr("fill", "#2c3e50").text(title);

            const xScale = d3.scaleBand().domain(barData.map(d => d.type)).range([0, width]).padding(0.4);
            const yScale = d3.scaleLinear().domain([0, avgGPU * 1.3]).range([height, 0]);

            svg.append("g").attr("opacity", 0.1).call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));
            svg.append("g").call(d3.axisLeft(yScale).tickFormat(d => `${d.toFixed(0)} ${unit}`));

            svg.selectAll(".bar").data(barData).enter().append("rect")
                .attr("x", d => xScale(d.type)).attr("y", height).attr("width", xScale.bandwidth()).attr("height", 0)
                .attr("fill", d => d.color).attr("rx", 10)
                .transition().duration(1000).attr("y", d => yScale(d.value)).attr("height", d => height - yScale(d.value));

            svg.selectAll(".value").data(barData).enter().append("text")
                .attr("x", d => xScale(d.type) + xScale.bandwidth() / 2).attr("y", d => yScale(d.value) - 15)
                .attr("text-anchor", "middle").attr("font-size", "22px").attr("font-weight", "bold").attr("fill", "#2c3e50")
                .text(d => `${d.value.toFixed(0)} ${unit}`);

            svg.selectAll(".x-label").data(barData).enter().append("text")
                .attr("x", d => xScale(d.type) + xScale.bandwidth() / 2).attr("y", height + 40)
                .attr("text-anchor", "middle").attr("font-size", "18px").attr("font-weight", "bold")
                .text(d => `${d.icon} ${d.type}`);

            const ratio = (avgGPU / avgCPU).toFixed(1);
            svg.append("text").attr("x", width / 2).attr("y", height + 75).attr("text-anchor", "middle").attr("font-size", "14px").attr("fill", barData[1].color).attr("font-weight", "bold")
                .text(metricType === "gwp" ? `⚠️ GPUs emit ${ratio}× more CO₂ than CPUs` : `⚡ GPUs consume ${ratio}× more energy than CPUs`);
        }).catch(error => console.error("Error:", error));
    }

    drawGPUvsCPUChart("gwp");
}

// ===========================================
// CPU Environmental Impact Simulator
// ===========================================

function createEnvironmentalSimulator(containerId) {
    const container = d3.select(`#${containerId}`);

    d3.json("data/terminals/cpu_data_enriched.json").then(data => {
        const wrapper = container.append("div").style("max-width", "1000px").style("margin", "0 auto").style("padding", "20px");

        wrapper.append("div").style("text-align", "center").style("margin-bottom", "25px")
            .html(`<h3 style="color: #2c3e50; margin: 0;"> CPU Environmental Impact Simulator</h3><p style="color: #7f8c8d; font-size: 13px; margin-top: 8px;">Select a CPU and adjust usage to see environmental impact</p>`);

        const mainLayout = wrapper.append("div").style("display", "grid").style("grid-template-columns", "300px 1fr").style("gap", "25px");

        const controlsPanel = mainLayout.append("div").style("background", "#f8f9fa").style("padding", "20px").style("border-radius", "12px").style("border", "2px solid #e9ecef");
        controlsPanel.append("h4").style("color", "#2c3e50").style("margin", "0 0 15px 0").style("font-size", "16px").text("⚙️ Configuration");

        const cpuGroup = controlsPanel.append("div").style("margin-bottom", "20px");
        cpuGroup.append("label").style("display", "block").style("margin-bottom", "5px").style("font-size", "13px").style("font-weight", "bold").style("color", "#2c3e50").text("💻 Select a CPU:");

        const cpuSelect = cpuGroup.append("select").attr("id", "sim-cpu").style("width", "100%").style("padding", "10px").style("border-radius", "6px").style("border", "1px solid #ddd").style("font-size", "12px").style("cursor", "pointer");
        cpuSelect.selectAll("option").data(data.sort((a, b) => a.name.localeCompare(b.name))).enter().append("option").attr("value", (d, i) => i).text(d => `${d.name} (${d.tdp}W, ${d.cores} cores)`);

        controlsPanel.append("div").attr("id", "cpu-info").style("background", "#e3f2fd").style("padding", "12px").style("border-radius", "8px").style("margin-bottom", "20px").style("font-size", "12px");

        const yearsGroup = controlsPanel.append("div").style("margin-bottom", "15px");
        yearsGroup.append("label").style("display", "flex").style("justify-content", "space-between").style("margin-bottom", "5px").style("font-size", "13px").html(`<span>📅 Usage Duration</span><span id="years-value">4 years</span>`);
        yearsGroup.append("input").attr("type", "range").attr("id", "sim-years").attr("min", 1).attr("max", 10).attr("value", 4).style("width", "100%");

        const hoursGroup = controlsPanel.append("div").style("margin-bottom", "15px");
        hoursGroup.append("label").style("display", "flex").style("justify-content", "space-between").style("margin-bottom", "5px").style("font-size", "13px").html(`<span>⏰ Daily Usage</span><span id="hours-value">12 h/day</span>`);
        hoursGroup.append("input").attr("type", "range").attr("id", "sim-hours").attr("min", 1).attr("max", 24).attr("value", 12).style("width", "100%");

        const resultsPanel = mainLayout.append("div");
        const cardsContainer = resultsPanel.append("div").style("display", "grid").style("grid-template-columns", "repeat(3, 1fr)").style("gap", "15px").style("margin-bottom", "20px");

        function createCard(parent, id, emoji, title, color) {
            const card = parent.append("div").attr("id", id).style("background", "white").style("padding", "20px").style("border-radius", "10px").style("text-align", "center").style("border-left", `4px solid ${color}`).style("box-shadow", "0 2px 8px rgba(0,0,0,0.08)");
            card.append("div").style("font-size", "30px").text(emoji);
            card.append("div").style("font-size", "12px").style("color", "#7f8c8d").style("margin", "5px 0").text(title);
            card.append("div").attr("class", "value").style("font-size", "24px").style("font-weight", "bold").style("color", color).text("--");
            card.append("div").attr("class", "unit").style("font-size", "11px").style("color", "#95a5a6").text("");
        }

        createCard(cardsContainer, "gwp-card", "🌍", "CO₂ Emissions", "#27ae60");
        createCard(cardsContainer, "pe-card", "⚡", "Energy", "#e74c3c");
        createCard(cardsContainer, "adp-card", "💎", "Resources", "#f39c12");

        const breakdownDiv = resultsPanel.append("div").style("background", "white").style("padding", "20px").style("border-radius", "10px").style("box-shadow", "0 2px 8px rgba(0,0,0,0.08)").style("margin-bottom", "15px");
        breakdownDiv.append("h5").style("margin", "0 0 15px 0").style("color", "#2c3e50").style("font-size", "14px").text("📊 Manufacturing vs Usage");
        breakdownDiv.append("div").attr("id", "breakdown-bars");

        const equivDiv = resultsPanel.append("div").style("background", "linear-gradient(135deg, #27ae60, #2ecc71)").style("color", "white").style("padding", "15px 20px").style("border-radius", "10px");
        equivDiv.append("h5").style("margin", "0 0 10px 0").style("font-size", "13px").text("🌱 Equivalent to:");
        equivDiv.append("div").attr("id", "equiv-content").style("display", "flex").style("gap", "20px").style("justify-content", "center").style("font-size", "13px");

        function updateSimulation() {
            const cpuIndex = +document.getElementById("sim-cpu").value;
            const cpu = data[cpuIndex];
            const years = +document.getElementById("sim-years").value;
            const hours = +document.getElementById("sim-hours").value;

            document.getElementById("years-value").textContent = years + " years";
            document.getElementById("hours-value").textContent = hours + " h/day";
            d3.select("#cpu-info").html(`<strong>${cpu.name}</strong><br/>🏭 ${cpu.manufacturer} • ⚡ ${cpu.tdp}W • 🔢 ${cpu.cores} cores`);

            const yearsFactor = years / 4;
            const hoursFactor = hours / 12;

            const gwp_embedded = cpu.gwp_embedded;
            const gwp_use = cpu.gwp_use * yearsFactor * hoursFactor;
            const pe_embedded = cpu.pe_embedded;
            const pe_use = cpu.pe_use * yearsFactor * hoursFactor;
            const adp_embedded = cpu.adp_embedded;
            const adp_use = cpu.adp_use * yearsFactor * hoursFactor;

            const gwp_total = gwp_embedded + gwp_use;
            const pe_total = pe_embedded + pe_use;
            const adp_total = adp_embedded + adp_use;
            const pe_kWh = pe_total * 0.2778;

            d3.select("#gwp-card .value").text(gwp_total.toFixed(1));
            d3.select("#gwp-card .unit").text("kg CO₂");
            d3.select("#pe-card .value").text(pe_kWh.toFixed(0));
            d3.select("#pe-card .unit").text("kWh");
            d3.select("#adp-card .value").text(adp_total.toExponential(2));
            d3.select("#adp-card .unit").text("kg Sb eq");

            const gwpPct = (gwp_embedded / gwp_total * 100).toFixed(0);
            const pePct = (pe_embedded / pe_total * 100).toFixed(0);

            d3.select("#breakdown-bars").html(`
                <div style="margin-bottom: 12px;"><div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;"><span>🌍 CO₂</span><span>${gwpPct}% mfg / ${100-gwpPct}% use</span></div><div style="height: 20px; background: #ecf0f1; border-radius: 10px; overflow: hidden; display: flex;"><div style="width: ${gwpPct}%; background: #3498db;"></div><div style="width: ${100-gwpPct}%; background: #e74c3c;"></div></div></div>
                <div><div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;"><span>⚡ Energy</span><span>${pePct}% mfg / ${100-pePct}% use</span></div><div style="height: 20px; background: #ecf0f1; border-radius: 10px; overflow: hidden; display: flex;"><div style="width: ${pePct}%; background: #3498db;"></div><div style="width: ${100-pePct}%; background: #e74c3c;"></div></div></div>
                <div style="display: flex; gap: 15px; margin-top: 10px; font-size: 11px; color: #7f8c8d;"><span>🟦 Manufacturing</span><span>🟥 Usage</span></div>
            `);

            const carKm = gwp_total / 0.12;
            const trees = gwp_total / 21;
            d3.select("#equiv-content").html(`<span>🚗 ${carKm.toFixed(0)} km by car</span><span>•</span><span>🌳 ${trees.toFixed(1)} trees to offset</span>`);
        }

        document.getElementById("sim-cpu").addEventListener("change", updateSimulation);
        document.getElementById("sim-years").addEventListener("input", updateSimulation);
        document.getElementById("sim-hours").addEventListener("input", updateSimulation);
        updateSimulation();
    }).catch(error => console.error("Error:", error));
}
