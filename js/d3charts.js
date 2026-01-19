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
// Section 3: PUE Timeline & World Map
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    if (typeof d3 === 'undefined') return;
    if (!document.getElementById('viz-pue-timeline')) return;
    initSection3Map();
});

function initSection3Map() {
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
        var worldData = datasets[4];
        var awsRegions = datasets[5];
        var azureRegions = datasets[6];
        var gcpRegions = datasets[7];

        createPueTimelineChart(pueHistory);
        createWorldMap(awsRegions, azureRegions, gcpRegions, worldData);
    }).catch(function(error) {
        console.error('Error loading Section 5 data:', error);
    });
}

function createPueTimelineChart(data) {
    var container = document.getElementById('viz-pue-timeline');
    if (!container) return;
    container.innerHTML = '';

    data.forEach(function(d) { d.Year = +d.Year; d.Average_PUE = +d.Average_PUE; });
    // Filter from 2011 onwards (we don't have reliable data before 2011)
    data = data.filter(function(d) { return !isNaN(d.Year) && !isNaN(d.Average_PUE) && d.Year >= 2011; });
    data.sort(function(a, b) { return a.Year - b.Year; });

    var margin = {top: 20, right: 20, bottom: 40, left: 45};
    var width = container.offsetWidth - margin.left - margin.right;
    var height = 250 - margin.top - margin.bottom;

    var svg = d3.select(container).append('svg')
        .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
        .style('width', '100%').append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scaleLinear().domain(d3.extent(data, function(d) { return d.Year; })).range([0, width]);
    var y = d3.scaleLinear().domain([1.4, 2.1]).range([height, 0]);

    var line = d3.line().x(function(d) { return x(d.Year); }).y(function(d) { return y(d.Average_PUE); }).curve(d3.curveMonotoneX);
    var area = d3.area().x(function(d) { return x(d.Year); }).y0(height).y1(function(d) { return y(d.Average_PUE); }).curve(d3.curveMonotoneX);

    svg.append('path').datum(data).attr('fill', 'rgba(231, 76, 60, 0.15)').attr('d', area);
    svg.append('path').datum(data).attr('fill', 'none').attr('stroke', '#e74c3c').attr('stroke-width', 3).attr('d', line);
    svg.selectAll('.dot').data(data).enter().append('circle').attr('cx', function(d) { return x(d.Year); }).attr('cy', function(d) { return y(d.Average_PUE); }).attr('r', 4).attr('fill', '#e74c3c');

    svg.append('g').attr('transform', 'translate(0,' + height + ')').call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(6)).selectAll('text').style('font-size', '10px');
    svg.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').style('font-size', '10px');
    svg.append('text').attr('transform', 'rotate(-90)').attr('y', -35).attr('x', -height / 2).attr('text-anchor', 'middle').style('font-size', '11px').text('PUE');
}

var mapGlobalData = null;

function createWorldMap(awsData, azureData, gcpData, worldData) {
    var container = document.getElementById('viz-pue-map');
    if (!container) return;
    container.innerHTML = '';

    var locationCoords = {
        'N. Virginia': [-77.5, 39.0], 'Virginia': [-77.5, 39.0], 'Ohio': [-83.0, 40.0],
        'N. California': [-121.5, 38.5], 'Oregon': [-121.2, 45.6], 'Iowa': [-93.6, 41.6],
        'Texas': [-97.7, 31.0], 'Montreal': [-73.6, 45.5], 'Toronto': [-79.4, 43.7],
        'São Paulo': [-46.6, -23.5], 'Santiago': [-70.6, -33.4],
        'Ireland': [-6.3, 53.3], 'London': [-0.1, 51.5], 'Frankfurt': [8.7, 50.1],
        'Paris': [2.3, 48.9], 'Stockholm': [18.1, 59.3], 'Milan': [9.2, 45.5],
        'Netherlands': [4.9, 52.4], 'Zürich': [8.5, 47.4], 'Warsaw': [21.0, 52.2],
        'Finland': [25.0, 61.5], 'Madrid': [-3.7, 40.4], 'Oslo': [10.7, 59.9],
        'Bahrain': [50.6, 26.0], 'Dubai': [55.3, 25.3], 'Tel Aviv': [34.8, 32.1],
        'Cape Town': [18.4, -33.9], 'Johannesburg': [28.0, -26.2],
        'Tokyo': [139.7, 35.7], 'Osaka': [135.5, 34.7], 'Seoul': [127.0, 37.5],
        'Singapore': [103.8, 1.4], 'Hong Kong': [114.2, 22.3], 'Mumbai': [72.9, 19.1],
        'Sydney': [151.2, -33.9], 'Melbourne': [145.0, -37.8], 'Beijing': [116.4, 39.9],
        'Taiwan': [120.5, 24.0], 'Jakarta': [106.8, -6.2],
        'United States': [-95.7, 37.1], 'United Kingdom': [-0.1, 51.5],
        'Canada': [-106.3, 56.1], 'Brazil': [-47.9, -15.8], 'Germany': [10.4, 51.2],
        'France': [2.3, 48.9], 'Italy': [12.5, 41.9], 'Spain': [-3.7, 40.4],
        'Australia': [133.8, -25.3], 'India': [78.9, 20.6], 'Japan': [138.3, 36.2],
        'South Korea': [127.8, 35.9], 'China': [104.2, 35.9], 'UAE': [54.0, 24.0],
        'South Africa': [25.0, -29.0], 'Chile': [-70.6, -33.4]
    };

    function parseEmission(value) {
        var parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed * 1000;
    }

    var allRegions = [];
    awsData.forEach(function(d) { allRegions.push({ provider: 'AWS', region: d.region_name, country: d.country, emission: parseEmission(d.emission_factor) }); });
    azureData.forEach(function(d) { allRegions.push({ provider: 'Azure', region: d.region_name, country: d.country, emission: parseEmission(d.emission_factor) }); });
    gcpData.forEach(function(d) { allRegions.push({ provider: 'GCP', region: d.region_name, country: d.country, emission: parseEmission(d.emission_factor_raw) }); });

    allRegions.forEach(function(d) { d.coords = locationCoords[d.region] || locationCoords[d.country] || null; });
    var mappedRegions = allRegions.filter(function(d) { return d.coords !== null; });
    mapGlobalData = { regions: mappedRegions, worldData: worldData };

    var width = 700, height = 380, baseRadius = 6;

    var svg = d3.select(container).append('svg').attr('viewBox', '0 0 ' + width + ' ' + height).style('width', '100%').style('background', '#f8fafc');
    var g = svg.append('g');

    var projection = d3.geoMercator().scale(110).translate([width / 2, height / 1.5]);
    var path = d3.geoPath().projection(projection);
    var providerColors = { 'AWS': '#FF9900', 'Azure': '#00A4EF', 'GCP': '#34A853' };

    var countries = topojson.feature(worldData, worldData.objects.countries);
    g.selectAll('path').data(countries.features).enter().append('path').attr('d', path).attr('fill', '#e8e8e8').attr('stroke', '#bbb').attr('stroke-width', 0.5);

    g.selectAll('.datacenter').data(mappedRegions).enter().append('circle')
        .attr('class', function(d) { return 'datacenter provider-' + d.provider; })
        .attr('cx', function(d) { return projection(d.coords)[0]; })
        .attr('cy', function(d) { return projection(d.coords)[1]; })
        .attr('r', baseRadius)
        .attr('fill', function(d) { return providerColors[d.provider]; })
        .attr('stroke', '#fff').attr('stroke-width', 1).attr('opacity', 0.9).style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this).attr('r', baseRadius * 2).attr('opacity', 1);
            var emissionStr = d.emission !== null ? d.emission.toFixed(0) + ' gCO₂/kWh' : 'N/A';
            tooltip.style('opacity', 1).html('<b>' + d.provider + '</b> - ' + d.region + '<br>' + d.country + '<br>Emissions: ' + emissionStr)
                .style('left', (event.pageX + 10) + 'px').style('top', (event.pageY - 30) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this).attr('r', baseRadius).attr('opacity', 0.9);
            tooltip.style('opacity', 0);
        });

    var tooltip = d3.select('body').append('div')
        .style('position', 'absolute').style('background', '#fff').style('border', '1px solid #ccc').style('padding', '8px').style('border-radius', '4px').style('font-size', '11px').style('pointer-events', 'none').style('opacity', 0).style('box-shadow', '0 2px 6px rgba(0,0,0,0.15)').style('z-index', '9999');

    setupMapFilters();
    updateMapStats(mappedRegions);
}

function updateMapStats(regions) {
    var statsContainer = document.getElementById('viz-map-stats');
    if (!statsContainer) return;
    var awsCount = regions.filter(function(d) { return d.provider === 'AWS'; }).length;
    var azureCount = regions.filter(function(d) { return d.provider === 'Azure'; }).length;
    var gcpCount = regions.filter(function(d) { return d.provider === 'GCP'; }).length;
    statsContainer.innerHTML = '<span style="color:#FF9900">AWS: ' + awsCount + '</span> | <span style="color:#00A4EF">Azure: ' + azureCount + '</span> | <span style="color:#34A853">GCP: ' + gcpCount + '</span> | Total: ' + regions.length;
}

function setupMapFilters() {
    document.querySelectorAll('.provider-filter').forEach(function(cb) {
        cb.addEventListener('change', function() {
            var provider = this.value;
            var isVisible = this.checked;
            d3.selectAll('.provider-' + provider).attr('opacity', isVisible ? 0.9 : 0);
            if (mapGlobalData) {
                var activeProviders = Array.from(document.querySelectorAll('.provider-filter:checked')).map(function(c) { return c.value; });
                updateMapStats(mapGlobalData.regions.filter(function(d) { return activeProviders.includes(d.provider); }));
            }
        });
    });
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
