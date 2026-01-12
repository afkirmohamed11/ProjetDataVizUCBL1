// this file contains code from the D3.js library

// Section 1 (Motassim): Why It Matters: Data in Our Daily Lives


// Section 2 (Ben Touhami): Inside Your Device: How Much Energy Does It Use?


// Section 3 (): When Data Leaves Your Device: Network & Cloud


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
    // Load all data files
    Promise.all([
        d3.csv('data/uptime- global average/uptime_pue_historical_2007_2025.csv'),
        d3.csv('data/iae/iea_tech_company_energy2021.csv'),
        d3.csv('data/climatiq/cloud_provider_pue.csv'),
        d3.csv('data/yearly Carbon free energy for Google Cloud regions/2024.csv'),
        d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    ]).then(function(datasets) {
        var pueHistory = datasets[0];
        var techEnergy = datasets[1];
        var providerPue = datasets[2];
        var gcpCfe = datasets[3];
        var worldData = datasets[4];

        // Create visualizations
        createPueTimelineChart(pueHistory);
        createDonutChart(techEnergy);
        createProviderGauges(providerPue);
        createWorldMap(gcpCfe, worldData);
        createScatterPlot(gcpCfe);

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

    // Dimensions
    var margin = {top: 40, right: 40, bottom: 60, left: 70};
    var width = container.offsetWidth - margin.left - margin.right;
    var height = 380 - margin.top - margin.bottom;

    // Create SVG
    var svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
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
        .attr('stroke-width', 4)
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
        .attr('stroke-width', 3)
        .style('cursor', 'pointer')
        .transition()
        .delay(function(d, i) { return 2000 + i * 100; })
        .duration(300)
        .attr('r', 8);

    // Add interactivity after animation
    setTimeout(function() {
        svg.selectAll('circle')
            .on('mouseover', function(event, d) {
                d3.select(this).transition().duration(150).attr('r', 12);
                tooltip.style('opacity', 1)
                    .html('<div style="font-size:16px;font-weight:bold;margin-bottom:5px">' + d.Year + '</div>' +
                          '<div>PUE: <span style="color:#3498db;font-weight:bold">' + d.Average_PUE.toFixed(2) + '</span></div>')
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY - 40) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this).transition().duration(150).attr('r', 8);
                tooltip.style('opacity', 0);
            });
    }, 3500);

    // Annotations for key milestones
    var annotations = [
        {year: 2007, pue: 2.5, label: 'Baseline', align: 'start'},
        {year: 2014, pue: 1.65, label: 'Major improvements', align: 'middle'},
        {year: 2025, pue: 1.54, label: 'Current', align: 'end'}
    ];

    annotations.forEach(function(a) {
        var xPos = x(a.year);
        var yPos = y(a.pue);
        
        svg.append('line')
            .attr('x1', xPos).attr('y1', yPos + 15)
            .attr('x2', xPos).attr('y2', yPos + 35)
            .attr('stroke', '#e74c3c')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '4,2')
            .style('opacity', 0)
            .transition().delay(3000).duration(500).style('opacity', 1);

        svg.append('text')
            .attr('x', xPos)
            .attr('y', yPos + 50)
            .attr('text-anchor', a.align)
            .style('font-size', '11px')
            .style('fill', '#e74c3c')
            .style('font-weight', 'bold')
            .style('opacity', 0)
            .text(a.label)
            .transition().delay(3000).duration(500).style('opacity', 1);
    });

    // X Axis
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(8))
        .selectAll('text')
        .style('font-size', '12px');

    // Y Axis
    svg.append('g')
        .call(d3.axisLeft(y).ticks(6))
        .selectAll('text')
        .style('font-size', '12px');

    // Axis labels
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -50)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('fill', '#555')
        .style('font-weight', 'bold')
        .text('Average PUE');

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 45)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('fill', '#555')
        .style('font-weight', 'bold')
        .text('Year');

    // Improvement badge
    var firstPue = data[0].Average_PUE;
    var lastPue = data[data.length - 1].Average_PUE;
    var improvement = ((firstPue - lastPue) / firstPue * 100).toFixed(0);

    svg.append('rect')
        .attr('x', width - 100)
        .attr('y', -30)
        .attr('width', 100)
        .attr('height', 30)
        .attr('fill', '#27ae60')
        .attr('rx', 15);

    svg.append('text')
        .attr('x', width - 50)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .text('↓ ' + improvement + '% improved');

    // Tooltip
    var tooltip = d3.select('body').append('div')
        .attr('class', 'section5-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(255,255,255,0.95)')
        .style('border', '2px solid #3498db')
        .style('color', '#333')
        .style('padding', '12px 16px')
        .style('border-radius', '8px')
        .style('font-size', '13px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('box-shadow', '0 4px 15px rgba(0,0,0,0.15)');
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

    // Dimensions
    var width = container.offsetWidth;
    var height = 280;
    var radius = Math.min(width, height) / 2 - 20;

    var svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
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
        .attr('y', -15)
        .style('font-size', '14px')
        .style('fill', '#666')
        .text('Total');

    var centerValue = svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 12)
        .style('font-size', '22px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text(total.toFixed(1) + ' TWh');

    var centerPercent = svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 35)
        .style('font-size', '11px')
        .style('fill', '#888')
        .text('Big Tech Energy');

    // Legend below
    var legend = d3.select(container).append('div')
        .style('display', 'flex')
        .style('flex-wrap', 'wrap')
        .style('justify-content', 'center')
        .style('gap', '8px')
        .style('margin-top', '10px');

    data.forEach(function(d) {
        legend.append('div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('font-size', '11px')
            .html('<span style="width:12px;height:12px;background:' + colors[d.Company] + ';border-radius:3px;margin-right:5px;display:inline-block"></span>' + d.Company);
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

    // Create gauge for each provider - FIXED: Use flex-wrap and proper sizing
    var gaugeContainer = d3.select(container)
        .append('div')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('flex-wrap', 'wrap')
        .style('gap', '5px')
        .style('padding', '10px 0');

    data.forEach(function(d) {
        var gauge = gaugeContainer.append('div')
            .style('text-align', 'center')
            .style('flex', '1 1 90px')
            .style('min-width', '90px')
            .style('max-width', '120px');

        var size = 55;
        var svg = gauge.append('svg')
            .attr('width', size * 2 + 10)
            .attr('height', size + 25)
            .style('display', 'block')
            .style('margin', '0 auto');

        var g = svg.append('g')
            .attr('transform', 'translate(' + (size + 5) + ',' + size + ')');

        // Background arc
        var bgArc = d3.arc()
            .innerRadius(size - 12)
            .outerRadius(size - 3)
            .startAngle(-Math.PI / 2)
            .endAngle(Math.PI / 2);

        g.append('path')
            .attr('d', bgArc)
            .attr('fill', '#e0e0e0');

        // Value arc (PUE 1.0 to 1.5 mapped to the arc)
        var scale = d3.scaleLinear()
            .domain([1.0, 1.5])
            .range([-Math.PI / 2, Math.PI / 2])
            .clamp(true);

        var valueArc = d3.arc()
            .innerRadius(size - 12)
            .outerRadius(size - 3)
            .startAngle(-Math.PI / 2)
            .endAngle(scale(d.pue));

        g.append('path')
            .attr('d', valueArc)
            .attr('fill', colors[d.provider]);

        // PUE value
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', -8)
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .style('fill', colors[d.provider])
            .text(d.pue.toFixed(2));

        // Provider name
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 8)
            .style('font-size', '11px')
            .style('fill', '#666')
            .text(d.provider);
    });

    // Best badge
    var best = data.reduce(function(a, b) { return a.pue < b.pue ? a : b; });
    d3.select(container).append('div')
        .style('text-align', 'center')
        .style('margin-top', '8px')
        .html('<span style="background:#27ae60;color:white;padding:5px 14px;border-radius:15px;font-size:12px;font-weight:500">🏆 ' + best.provider + ' most efficient</span>');
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

    // Dimensions - more compact for narrower container
    var margin = {top: 20, right: 20, bottom: 50, left: 55};
    var width = container.offsetWidth - margin.left - margin.right;
    var height = 320 - margin.top - margin.bottom;

    var svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
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
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain([0, 700])
        .range([height, 0]);

    // Grid
    svg.append('g')
        .attr('opacity', 0.08)
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));

    // Green zone highlight
    svg.append('rect')
        .attr('x', x(60)).attr('y', 0)
        .attr('width', x(40)).attr('height', y(200))
        .attr('fill', '#27ae60')
        .attr('opacity', 0.1);

    svg.append('text')
        .attr('x', x(80)).attr('y', y(650))
        .attr('text-anchor', 'middle')
        .style('font-size', '9px')
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
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return d + '%'; }))
        .selectAll('text').style('font-size', '10px');

    svg.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .selectAll('text').style('font-size', '10px');

    // Axis labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 38)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#555')
        .text('Carbon-Free Energy (%)');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -42)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#555')
        .text('Carbon Intensity (gCO₂/kWh)');

    // Compact legend at bottom
    var legendContainer = d3.select(container).append('div')
        .style('display', 'flex')
        .style('flex-wrap', 'wrap')
        .style('justify-content', 'center')
        .style('gap', '8px')
        .style('margin-top', '10px');

    var continents = ['Europe', 'North America', 'Asia', 'Australia', 'South America'];
    continents.forEach(function(c) {
        var count = data.filter(function(d) { return d.continent === c; }).length;
        if (count === 0) return;
        
        legendContainer.append('div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('font-size', '10px')
            .html('<span style="width:10px;height:10px;background:' + continentColors[c] + ';border-radius:50%;margin-right:4px;display:inline-block"></span>' + c);
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
// Chart 5: World Map - GCP Regions by CFE %
// Container: #viz-pue-map
// ============================================================
function createWorldMap(gcpData, worldData) {
    var container = document.getElementById('viz-pue-map');
    if (!container) return;
    container.innerHTML = '';

    // Parse CFE data
    gcpData.forEach(function(d) {
        d.cfe = +d['Google CFE'] * 100;
        d.carbon = +d['Grid carbon intensity (gCO2eq / kWh)'];
        d.location = d.Location;
        d.region = d['Google Cloud Region'];
    });

    // Location coordinates (approximate lat/lon for Google Cloud regions)
    var locationCoords = {
        'Changhua County, Taiwan': [120.5, 24.0],
        'Tokyo, Japan': [139.7, 35.7],
        'Osaka, Japan': [135.5, 34.7],
        'Seoul, South Korea': [127.0, 37.5],
        'Hong Kong': [114.2, 22.3],
        'Mumbai, India': [72.9, 19.1],
        'Delhi, India': [77.2, 28.6],
        'Singapore': [103.8, 1.4],
        'Jakarta, Indonesia': [106.8, -6.2],
        'Sydney, Australia': [151.2, -33.9],
        'Melbourne, Australia': [145.0, -37.8],
        'Warsaw, Poland': [21.0, 52.2],
        'Finland': [25.0, 61.5],
        'Belgium': [4.4, 50.8],
        'London, UK': [-0.1, 51.5],
        'Frankfurt, Germany': [8.7, 50.1],
        'Netherlands': [4.9, 52.4],
        'Zürich, Switzerland': [8.5, 47.4],
        'Milan, Italy': [9.2, 45.5],
        'Paris, France': [2.3, 48.9],
        'Madrid, Spain': [- 3.7, 40.4],
        'Turin, Italy': [7.7, 45.1],
        'Berlin, Germany': [13.4, 52.5],
        'Dammam, Saudi Arabia': [50.1, 26.4],
        'Doha, Qatar': [51.5, 25.3],
        'Tel Aviv, Israel': [34.8, 32.1],
        'Montréal, Canada': [-73.6, 45.5],
        'Toronto, Canada': [-79.4, 43.7],
        'São Paulo, Brazil': [-46.6, -23.5],
        'Santiago, Chile': [-70.6, -33.4],
        'Council Bluffs, Iowa, USA': [-95.9, 41.2],
        'Moncks Corner, South Carolina, USA': [-80.0, 33.2],
        'Ashburn, Virginia, USA': [-77.5, 39.0],
        'The Dalles, Oregon, USA': [-121.2, 45.6],
        'Los Angeles, California, USA': [-118.2, 34.1],
        'Salt Lake City, Utah, USA': [-111.9, 40.8],
        'Las Vegas, Nevada, USA': [-115.1, 36.2],
        'Phoenix, Arizona': [-112.1, 33.4],
        'Columbus, Ohio, USA': [-83.0, 39.96],
        'Dallas, Texas, USA': [-96.8, 32.8],
        'Johannesburg, South Africa': [28.0, -26.2],
        'Stockholm, Sweden': [18.1, 59.3],
        'Mexico': [-99.1, 19.4]
    };

    // Dimensions
    var width = container.offsetWidth;
    var height = 350;

    var svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Projection
    var projection = d3.geoNaturalEarth1()
        .scale(width / 5.5)
        .translate([width / 2, height / 2 + 20]);

    var path = d3.geoPath().projection(projection);

    // Color scale for CFE
    var colorScale = d3.scaleLinear()
        .domain([0, 50, 100])
        .range(['#e74c3c', '#f39c12', '#27ae60']);

    // Draw world map
    var countries = topojson.feature(worldData, worldData.objects.countries);
    
    svg.append('g')
        .selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', '#e8e8e8')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 0.5);

    // Add data center points
    svg.selectAll('.datacenter')
        .data(gcpData)
        .enter()
        .append('circle')
        .attr('class', 'datacenter')
        .attr('cx', function(d) {
            var coords = locationCoords[d.location];
            return coords ? projection(coords)[0] : null;
        })
        .attr('cy', function(d) {
            var coords = locationCoords[d.location];
            return coords ? projection(coords)[1] : null;
        })
        .attr('r', 0)
        .attr('fill', function(d) { return colorScale(d.cfe); })
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.9)
        .style('cursor', 'pointer')
        .style('display', function(d) {
            var coords = locationCoords[d.location];
            return coords ? 'block' : 'none';
        })
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition().duration(150)
                .attr('r', 12)
                .attr('stroke-width', 2);
            
            tooltip.style('opacity', 1)
                .html('<div style="font-weight:bold;font-size:13px;margin-bottom:5px">' + d.location + '</div>' +
                      '<div style="font-size:11px;color:#666;margin-bottom:8px">' + d.region + '</div>' +
                      '<div style="display:flex;justify-content:space-between;gap:15px">' +
                      '<div><span style="color:#888">CFE:</span> <strong style="color:' + colorScale(d.cfe) + '">' + d.cfe.toFixed(0) + '%</strong></div>' +
                      '<div><span style="color:#888">Carbon:</span> <strong>' + d.carbon.toFixed(0) + '</strong></div>' +
                      '</div>')
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 70) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .transition().duration(150)
                .attr('r', 7)
                .attr('stroke-width', 1.5);
            tooltip.style('opacity', 0);
        })
        .transition()
        .delay(function(d, i) { return 500 + i * 40; })
        .duration(400)
        .attr('r', 7);

    // Legend
    var legendWidth = 150;
    var legendHeight = 12;
    var legendX = width - legendWidth - 20;
    var legendY = height - 40;

    // Gradient for legend
    var defs = svg.append('defs');
    var linearGradient = defs.append('linearGradient')
        .attr('id', 'cfe-gradient');

    linearGradient.append('stop').attr('offset', '0%').attr('stop-color', '#e74c3c');
    linearGradient.append('stop').attr('offset', '50%').attr('stop-color', '#f39c12');
    linearGradient.append('stop').attr('offset', '100%').attr('stop-color', '#27ae60');

    svg.append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', 'url(#cfe-gradient)')
        .attr('rx', 3);

    svg.append('text')
        .attr('x', legendX)
        .attr('y', legendY - 5)
        .style('font-size', '10px')
        .style('fill', '#666')
        .text('Carbon-Free Energy %');

    svg.append('text')
        .attr('x', legendX)
        .attr('y', legendY + legendHeight + 12)
        .style('font-size', '9px')
        .style('fill', '#999')
        .text('0%');

    svg.append('text')
        .attr('x', legendX + legendWidth / 2)
        .attr('y', legendY + legendHeight + 12)
        .attr('text-anchor', 'middle')
        .style('font-size', '9px')
        .style('fill', '#999')
        .text('50%');

    svg.append('text')
        .attr('x', legendX + legendWidth)
        .attr('y', legendY + legendHeight + 12)
        .attr('text-anchor', 'end')
        .style('font-size', '9px')
        .style('fill', '#999')
        .text('100%');

    // Stats summary
    var avgCfe = d3.mean(gcpData, function(d) { return d.cfe; });
    var greenRegions = gcpData.filter(function(d) { return d.cfe >= 80; }).length;
    
    svg.append('text')
        .attr('x', 15)
        .attr('y', height - 25)
        .style('font-size', '11px')
        .style('fill', '#555')
        .html('📍 ' + gcpData.length + ' regions');

    svg.append('text')
        .attr('x', 15)
        .attr('y', height - 10)
        .style('font-size', '11px')
        .style('fill', '#27ae60')
        .text('🌱 ' + greenRegions + ' with 80%+ CFE');

    // Tooltip
    var tooltip = d3.select('body').append('div')
        .style('position', 'absolute')
        .style('background', 'rgba(255,255,255,0.98)')
        .style('border', '1px solid #ddd')
        .style('padding', '12px 16px')
        .style('border-radius', '10px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('box-shadow', '0 4px 20px rgba(0,0,0,0.2)')
        .style('z-index', '9999');
}


// Section 6 (Motassim): UCBL1 Data Center: A Case Study


// Section 7 (): What We Can Do: Solutions & Future Roadmap
