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
                    .html('<div style="font-size:14px;font-weight:bold;margin-bottom:3px">' + d.Year + '</div>' +
                          '<div>PUE: <span style="color:#3498db;font-weight:bold">' + d.Average_PUE.toFixed(2) + '</span></div>')
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
        .style('font-size', '10px');

    // Y Axis
    svg.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .selectAll('text')
        .style('font-size', '10px');

    // Axis labels
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('fill', '#555')
        .text('Average PUE');

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 35)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('fill', '#555')
        .text('Year');

    // Improvement badge - positioned inside the chart area
    var firstPue = data[0].Average_PUE;
    var lastPue = data[data.length - 1].Average_PUE;
    var improvement = ((firstPue - lastPue) / firstPue * 100).toFixed(0);

    svg.append('rect')
        .attr('x', width - 95)
        .attr('y', -40)
        .attr('width', 95)
        .attr('height', 26)
        .attr('fill', '#27ae60')
        .attr('rx', 13);

    svg.append('text')
        .attr('x', width - 47)
        .attr('y', -22)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .text('↓ ' + improvement + '% improved');

    // Tooltip
    var tooltip = d3.select('body').append('div')
        .attr('class', 'section5-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(255,255,255,0.95)')
        .style('border', '2px solid #3498db')
        .style('color', '#333')
        .style('padding', '10px 14px')
        .style('border-radius', '8px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('box-shadow', '0 4px 15px rgba(0,0,0,0.15)');
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

    var svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
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
        .style('font-size', '10px')
        .style('fill', '#555')
        .text(function(d) { return d.name; });

    // Efficiency comparison text
    var bestProvider = comparisonData[comparisonData.length - 1];
    var savings = ((globalPue - bestProvider.pue) / globalPue * 100).toFixed(0);

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 32)
        .attr('text-anchor', 'middle')
        .style('font-size', '9px')
        .style('fill', '#27ae60')
        .style('font-weight', 'bold')
        .text('Cloud providers ' + savings + '% more efficient');

    // Tooltip
    var tooltip = d3.select('body').append('div')
        .style('position', 'absolute')
        .style('background', 'rgba(0,0,0,0.8)')
        .style('color', 'white')
        .style('padding', '8px 12px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0);
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
        .attr('y', -12)
        .style('font-size', '12px')
        .style('fill', '#666')
        .text('Total');

    var centerValue = svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 8)
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text(total.toFixed(1) + ' TWh');

    var centerPercent = svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 26)
        .style('font-size', '10px')
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

    // Create gauge for each provider - adjusted for col-4 layout
    var gaugeContainer = d3.select(container)
        .append('div')
        .style('display', 'flex')
        .style('justify-content', 'space-around')
        .style('align-items', 'center')
        .style('flex-wrap', 'wrap')
        .style('gap', '10px')
        .style('padding', '20px 10px');

    data.forEach(function(d) {
        var gauge = gaugeContainer.append('div')
            .style('text-align', 'center')
            .style('flex', '1 1 100px')
            .style('min-width', '100px')
            .style('max-width', '130px');

        var size = 60;
        var svg = gauge.append('svg')
            .attr('width', size * 2 + 15)
            .attr('height', size + 30)
            .style('display', 'block')
            .style('margin', '0 auto');

        var g = svg.append('g')
            .attr('transform', 'translate(' + (size + 7) + ',' + size + ')');

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
    var margin = {top: 15, right: 15, bottom: 45, left: 50};
    var width = container.offsetWidth - margin.left - margin.right;
    var height = 290 - margin.top - margin.bottom;

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

    // Dimensions
    var width = container.offsetWidth;
    var height = 340;

    var svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Projection
    var projection = d3.geoNaturalEarth1()
        .scale(width / 5)
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

    statsContainer.innerHTML = 
        '<div class="mb-2"><strong>Total Regions</strong><div class="h5 mb-0 text-primary">' + totalCount + '</div></div>' +
        '<div class="mb-1"><span style="color:#FF9900">AWS:</span> ' + awsCount + '</div>' +
        '<div class="mb-1"><span style="color:#00A4EF">Azure:</span> ' + azureCount + '</div>' +
        '<div class="mb-1"><span style="color:#27ae60">GCP:</span> ' + gcpCount + '</div>' +
        '<hr class="my-2">' +
        '<div><strong>Avg Emissions</strong><div class="small text-muted">' + avgEmissionStr + ' gCO₂/kWh</div></div>';
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

    var svg = d3.select(container)
        .append('svg')
        .attr('width', totalWidth + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
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
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#27ae60')
        .text('🌱 Greenest Regions');

    // Right section title
    svg.append('text')
        .attr('x', halfWidth + 60 + halfWidth / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#e74c3c')
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
        .style('font-size', '9px')
        .style('fill', '#333')
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
        .attr('x', function(d) { return rightOffset + xHigh(d.emission) + 5; })
        .attr('y', function(d) { return yHigh(d.region) + yHigh.bandwidth() / 2 + 4; })
        .style('font-size', '9px')
        .style('fill', '#333')
        .text(function(d) { return d.region + ' (' + d.emission.toFixed(0) + ')'; });

    // Center legend
    var legendY = height / 2 - 25;
    var legendX = halfWidth + 10;

    svg.append('text')
        .attr('x', legendX + 20)
        .attr('y', legendY)
        .style('font-size', '8px')
        .style('fill', '#666')
        .style('font-weight', 'bold')
        .text('gCO₂/kWh');

    ['AWS', 'Azure', 'GCP'].forEach(function(p, i) {
        svg.append('circle')
            .attr('cx', legendX + 5)
            .attr('cy', legendY + 15 + i * 14)
            .attr('r', 4)
            .attr('fill', providerColors[p]);
        svg.append('text')
            .attr('x', legendX + 12)
            .attr('y', legendY + 18 + i * 14)
            .style('font-size', '8px')
            .style('fill', '#555')
            .text(p);
    });
}


// Section 6 (Motassim): UCBL1 Data Center: A Case Study


// Section 7 (): What We Can Do: Solutions & Future Roadmap
