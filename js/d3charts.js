// this file contains code from the D3.js library

// Section 1 (Motassim): Why It Matters: Data in Our Daily Lives


// Section 2 (Ben Touhami): Inside Your Device: How Much Energy Does It Use?


// Section 3 (): When Data Leaves Your Device: Network & Cloud


// Section 4 (Afkir): Servers & Data Centers: The Engines Behind the Internet (Californie & Portugal) 


// Section 5 (Akkouh): Big Picture: Data Center Efficiency & Its Limits 
// ========================================================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    
    // Check if D3 is loaded
    if (typeof d3 === 'undefined') {
        console.error('D3.js not loaded');
        return;
    }

    // Check if section 5 elements exist
    if (!document.getElementById('viz-pue-timeline')) {
        console.log('Section 5 elements not found - skipping PUE visualizations');
        return;
    }

    console.log('Initializing Section 5 PUE visualizations...');

    // Colors
    var colors = {
        primary: '#5096d7',
        secondary: '#6c757d',
        success: '#198754',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#0dcaf0',
        dark: '#212529',
        regions: {
            'Global': '#5096d7',
            'Europe': '#198754',
            'Amérique du Nord': '#dc3545',
            'Asie-Pacifique': '#ffc107',
            'Amérique du Sud': '#6f42c1'
        }
    };

    // Load CSV data
    d3.csv('data/google_datacenter_pue_2011_2025.csv')
        .then(function(rawData) {
            console.log('Data loaded:', rawData.length, 'rows');
            
            // Parse data
            var data = rawData.map(function(d) {
                return {
                    year: parseInt(d['Année']) || parseInt(d.Année),
                    quarter: d['Trimestre'] || d.Trimestre,
                    site: d['Site'] || d.Site,
                    country: d['Pays'] || d.Pays,
                    region: d['Region'] || d.Region,
                    pue: parseFloat(d['PUE_trimestriel'] || d.PUE_trimestriel),
                    pue12: parseFloat(d['PUE_12_derniers_mois'] || d.PUE_12_derniers_mois) || null
                };
            });

            console.log('Parsed data sample:', data[0]);

            // Create visualizations
            createTimelineChart(data, colors);
            createStatsCards(data, colors);
            createRegionChart(data, colors);
            createSitesChart(data, colors);
        })
        .catch(function(error) {
            console.error('Error loading CSV:', error);
            document.getElementById('viz-pue-timeline').innerHTML = 
                '<div class="alert alert-danger">Erreur de chargement des données: ' + error.message + '</div>';
        });
});

// 1. Timeline Chart
function createTimelineChart(data, colors) {
    var container = document.getElementById('viz-pue-timeline');
    if (!container) return;
    container.innerHTML = '';

    // Filter global data only
    var globalData = data.filter(function(d) { 
        return d.site === 'Parc (Global)'; 
    });

    // Add date
    globalData.forEach(function(d) {
        var qMonth = {'Q1': 0, 'Q2': 3, 'Q3': 6, 'Q4': 9};
        d.date = new Date(d.year, qMonth[d.quarter] || 0, 1);
    });

    // Sort
    globalData.sort(function(a, b) { return a.date - b.date; });

    console.log('Timeline data points:', globalData.length);

    // Dimensions
    var margin = {top: 40, right: 40, bottom: 60, left: 60};
    var width = container.offsetWidth - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;

    // SVG
    var svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Scales
    var x = d3.scaleTime()
        .domain(d3.extent(globalData, function(d) { return d.date; }))
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain([1.05, 1.18])
        .range([height, 0]);

    // Area
    var area = d3.area()
        .x(function(d) { return x(d.date); })
        .y0(height)
        .y1(function(d) { return y(d.pue); })
        .curve(d3.curveMonotoneX);

    // Line
    var line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.pue); })
        .curve(d3.curveMonotoneX);

    // Draw area
    svg.append('path')
        .datum(globalData)
        .attr('fill', colors.primary)
        .attr('fill-opacity', 0.2)
        .attr('d', area);

    // Draw line
    svg.append('path')
        .datum(globalData)
        .attr('fill', 'none')
        .attr('stroke', colors.primary)
        .attr('stroke-width', 3)
        .attr('d', line);

    // Industry average line (1.6)
    svg.append('line')
        .attr('x1', 0).attr('x2', width)
        .attr('y1', y(1.6)).attr('y2', y(1.6))
        .attr('stroke', colors.danger)
        .attr('stroke-dasharray', '5,5')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.7);

    // Axes
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x).ticks(7).tickFormat(d3.timeFormat('%Y')));

    svg.append('g')
        .call(d3.axisLeft(y).ticks(6).tickFormat(function(d) { return d.toFixed(2); }));

    // Labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 45)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .text('Année');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .text('PUE');

    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text('Évolution du PUE Global Google (2011-2025)');

    // Dots
    svg.selectAll('.dot')
        .data(globalData)
        .enter()
        .append('circle')
        .attr('cx', function(d) { return x(d.date); })
        .attr('cy', function(d) { return y(d.pue); })
        .attr('r', 4)
        .attr('fill', colors.primary)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this).attr('r', 7);
            showTooltip(event, d.quarter + ' ' + d.year + '<br>PUE: ' + d.pue.toFixed(2));
        })
        .on('mouseout', function() {
            d3.select(this).attr('r', 4);
            hideTooltip();
        });

    // Legend
    var legend = svg.append('g').attr('transform', 'translate(' + (width - 180) + ', 5)');
    
    legend.append('line')
        .attr('x1', 0).attr('x2', 25)
        .attr('y1', 0).attr('y2', 0)
        .attr('stroke', colors.primary).attr('stroke-width', 3);
    legend.append('text').attr('x', 30).attr('y', 4).style('font-size', '11px').text('PUE Google');

    legend.append('line')
        .attr('x1', 0).attr('x2', 25)
        .attr('y1', 18).attr('y2', 18)
        .attr('stroke', colors.danger).attr('stroke-dasharray', '5,5');
    legend.append('text').attr('x', 30).attr('y', 22).style('font-size', '11px').text('Moyenne industrie (~1.6)');
}

// 2. Stats Cards
function createStatsCards(data, colors) {
    var container = document.getElementById('viz-pue-stats');
    if (!container) return;
    container.innerHTML = '';

    var globalData = data.filter(function(d) { return d.site === 'Parc (Global)'; });
    
    var latest = globalData[globalData.length - 1];
    var first = globalData[0];
    var avgPue = d3.mean(globalData, function(d) { return d.pue; });
    var minPue = d3.min(globalData, function(d) { return d.pue; });
    var improvement = ((first.pue - latest.pue) / first.pue * 100);

    var stats = [
        {label: 'PUE Actuel (' + latest.quarter + ' ' + latest.year + ')', value: latest.pue.toFixed(2), color: colors.primary, icon: 'fa-bolt'},
        {label: 'Meilleur PUE', value: minPue.toFixed(2), color: colors.success, icon: 'fa-trophy'},
        {label: 'PUE Moyen', value: avgPue.toFixed(2), color: colors.info, icon: 'fa-chart-line'},
        {label: 'Amélioration', value: improvement.toFixed(1) + '%', color: colors.warning, icon: 'fa-arrow-down'}
    ];

    stats.forEach(function(stat) {
        var card = document.createElement('div');
        card.className = 'd-flex align-items-center mb-3 p-3 bg-white rounded shadow-sm';
        card.innerHTML = 
            '<div class="me-3"><i class="fas ' + stat.icon + '" style="font-size:28px;color:' + stat.color + '"></i></div>' +
            '<div><div class="fw-bold" style="font-size:22px;color:' + stat.color + '">' + stat.value + '</div>' +
            '<div class="text-muted small">' + stat.label + '</div></div>';
        container.appendChild(card);
    });

    // Info box
    var info = document.createElement('div');
    info.className = 'mt-3 p-3 bg-white rounded shadow-sm small';
    info.innerHTML = '<strong><i class="fas fa-info-circle text-primary me-1"></i>Qu\'est-ce que le PUE ?</strong><br>' +
        '<span class="text-muted">Power Usage Effectiveness mesure l\'efficacité énergétique. ' +
        'Un PUE de 1.0 = efficacité parfaite. Moyenne industrie: ~1.6. Google: ~1.1</span>';
    container.appendChild(info);
}

// 3. Regional Chart
function createRegionChart(data, colors) {
    var container = document.getElementById('viz-pue-regions');
    if (!container) return;
    container.innerHTML = '';

    // Calculate regional averages (last 3 years)
    var recentData = data.filter(function(d) { return d.year >= 2023; });
    
    var regions = ['Europe', 'Amérique du Nord', 'Asie-Pacifique', 'Global'];
    var regionData = regions.map(function(region) {
        var regionRecords = recentData.filter(function(d) { return d.region === region; });
        return {
            region: region,
            pue: regionRecords.length > 0 ? d3.mean(regionRecords, function(d) { return d.pue; }) : null
        };
    }).filter(function(d) { return d.pue !== null; });

    // Sort by PUE
    regionData.sort(function(a, b) { return a.pue - b.pue; });

    // Dimensions
    var margin = {top: 10, right: 50, bottom: 25, left: 110};
    var width = container.offsetWidth - margin.left - margin.right;
    var height = 160 - margin.top - margin.bottom;

    var svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scaleLinear()
        .domain([0, d3.max(regionData, function(d) { return d.pue; }) * 1.1])
        .range([0, width]);

    var y = d3.scaleBand()
        .domain(regionData.map(function(d) { return d.region; }))
        .range([0, height])
        .padding(0.3);

    // Bars
    svg.selectAll('.bar')
        .data(regionData)
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', function(d) { return y(d.region); })
        .attr('width', function(d) { return x(d.pue); })
        .attr('height', y.bandwidth())
        .attr('fill', function(d) { return colors.regions[d.region] || colors.secondary; })
        .attr('rx', 4);

    // Values
    svg.selectAll('.value')
        .data(regionData)
        .enter()
        .append('text')
        .attr('x', function(d) { return x(d.pue) + 5; })
        .attr('y', function(d) { return y(d.region) + y.bandwidth() / 2 + 4; })
        .text(function(d) { return d.pue.toFixed(2); })
        .style('font-size', '12px')
        .style('font-weight', 'bold');

    // Y Axis
    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('font-size', '11px');
}

// 4. Sites Chart
function createSitesChart(data, colors) {
    var container = document.getElementById('viz-pue-sites');
    if (!container) return;
    container.innerHTML = '';

    // Get years with site data
    var yearsWithSites = Array.from(new Set(
        data.filter(function(d) { return d.site !== 'Parc (Global)'; })
            .map(function(d) { return d.year; })
    )).sort();

    // Populate year selector
    var selector = document.getElementById('yearSelector');
    if (selector) {
        selector.innerHTML = '';
        yearsWithSites.forEach(function(year) {
            var opt = document.createElement('option');
            opt.value = year;
            opt.textContent = year;
            selector.appendChild(opt);
        });
        selector.value = yearsWithSites[yearsWithSites.length - 1];
        
        selector.addEventListener('change', function() {
            updateSitesChart(parseInt(this.value), data, colors, container);
        });
    }

    // Initial render
    updateSitesChart(yearsWithSites[yearsWithSites.length - 1], data, colors, container);
}

function updateSitesChart(year, data, colors, container) {
    container.innerHTML = '';

    // Get sites for selected year
    var yearData = data.filter(function(d) { 
        return d.year === year && d.site !== 'Parc (Global)'; 
    });

    if (yearData.length === 0) {
        container.innerHTML = '<p class="text-muted text-center py-4">Pas de données par site pour ' + year + '</p>';
        return;
    }

    // Aggregate by site
    var sitesMap = {};
    yearData.forEach(function(d) {
        if (!sitesMap[d.site]) {
            sitesMap[d.site] = {site: d.site, region: d.region, country: d.country, values: []};
        }
        sitesMap[d.site].values.push(d.pue);
    });

    var siteData = Object.values(sitesMap).map(function(s) {
        return {
            site: s.site,
            region: s.region,
            country: s.country,
            pue: d3.mean(s.values)
        };
    }).sort(function(a, b) { return a.pue - b.pue; });

    // Dimensions
    var margin = {top: 20, right: 30, bottom: 120, left: 50};
    var width = container.offsetWidth - margin.left - margin.right;
    var height = 320 - margin.top - margin.bottom;

    var svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scaleBand()
        .domain(siteData.map(function(d) { return d.site; }))
        .range([0, width])
        .padding(0.2);

    var y = d3.scaleLinear()
        .domain([1.0, d3.max(siteData, function(d) { return d.pue; }) + 0.03])
        .range([height, 0]);

    // Bars
    svg.selectAll('.bar')
        .data(siteData)
        .enter()
        .append('rect')
        .attr('x', function(d) { return x(d.site); })
        .attr('y', function(d) { return y(d.pue); })
        .attr('width', x.bandwidth())
        .attr('height', function(d) { return height - y(d.pue); })
        .attr('fill', function(d) { return colors.regions[d.region] || colors.secondary; })
        .attr('rx', 3)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this).attr('opacity', 0.8);
            showTooltip(event, '<strong>' + d.site + '</strong><br>' + d.country + '<br>PUE: ' + d.pue.toFixed(2));
        })
        .on('mouseout', function() {
            d3.select(this).attr('opacity', 1);
            hideTooltip();
        });

    // Value labels
    svg.selectAll('.label')
        .data(siteData)
        .enter()
        .append('text')
        .attr('x', function(d) { return x(d.site) + x.bandwidth() / 2; })
        .attr('y', function(d) { return y(d.pue) - 5; })
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .text(function(d) { return d.pue.toFixed(2); });

    // X Axis
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .attr('dx', '-0.5em')
        .attr('dy', '0.5em')
        .style('font-size', '9px');

    // Y Axis
    svg.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(function(d) { return d.toFixed(2); }));

    // Average line
    var avgPue = d3.mean(siteData, function(d) { return d.pue; });
    svg.append('line')
        .attr('x1', 0).attr('x2', width)
        .attr('y1', y(avgPue)).attr('y2', y(avgPue))
        .attr('stroke', colors.danger)
        .attr('stroke-dasharray', '4,4')
        .attr('stroke-width', 2);

    svg.append('text')
        .attr('x', width - 5)
        .attr('y', y(avgPue) - 5)
        .attr('text-anchor', 'end')
        .style('font-size', '11px')
        .style('fill', colors.danger)
        .text('Moy: ' + avgPue.toFixed(2));

    // Legend
    var uniqueRegions = Array.from(new Set(siteData.map(function(d) { return d.region; })));
    var legend = svg.append('g').attr('transform', 'translate(' + (width - 130) + ', 0)');
    
    uniqueRegions.forEach(function(region, i) {
        var g = legend.append('g').attr('transform', 'translate(0,' + (i * 18) + ')');
        g.append('rect').attr('width', 12).attr('height', 12)
            .attr('fill', colors.regions[region] || colors.secondary).attr('rx', 2);
        g.append('text').attr('x', 16).attr('y', 10).style('font-size', '10px').text(region);
    });
}

// Tooltip helpers
function showTooltip(event, html) {
    var tooltip = document.getElementById('pue-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'pue-tooltip';
        tooltip.style.cssText = 'position:fixed;background:rgba(0,0,0,0.85);color:white;padding:10px 15px;border-radius:5px;font-size:12px;pointer-events:none;z-index:9999;max-width:250px;';
        document.body.appendChild(tooltip);
    }
    tooltip.innerHTML = html;
    tooltip.style.left = (event.clientX + 15) + 'px';
    tooltip.style.top = (event.clientY - 10) + 'px';
    tooltip.style.display = 'block';
}

function hideTooltip() {
    var tooltip = document.getElementById('pue-tooltip');
    if (tooltip) tooltip.style.display = 'none';
}


// Section 6 (Motassim): UCBL1 Data Center: A Case Study


// Section 7 (): What We Can Do: Solutions & Future Roadmap
