/**
 * California Data Centers Environmental Impact Visualization
 * Uses D3.js to create interactive multi-dimensional charts
 * Data source: table1.csv - California data center impact metrics (2019-2028)
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        containerId: 'california-impact-chart',
        dataPath: 'data/californie/table1.csv',
        margin: { top: 60, right: 120, bottom: 80, left: 80 },
        colors: {
            carbon: '#dc3545',      // Red
            electricity: '#ffc107', // Yellow/Warning
            water: '#17a2b8',       // Cyan/Info
            health: '#28a745'       // Green
        },
        transitionDuration: 750
    };

    // Metric configurations
    const metrics = {
        carbon: {
            key: 'Carbon Emissions (million short tons)',
            label: 'Carbon Emissions',
            unit: 'M short tons',
            color: config.colors.carbon
        },
        electricity: {
            key: 'Electricity Consumption (TWh)',
            label: 'Electricity Consumption',
            unit: 'TWh',
            color: config.colors.electricity
        },
        water: {
            key: 'Water Consumption (billion liters)',
            label: 'Water Consumption',
            unit: 'B liters',
            color: config.colors.water
        },
        health: {
            key: 'Health Costs (million $)',
            label: 'Health Costs',
            unit: 'M $',
            color: config.colors.health
        }
    };

    // State
    let state = {
        data: null,
        activeMetrics: ['carbon'],
        chartType: 'grouped',
        svg: null,
        width: 0,
        height: 0
    };

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        loadData();
        setupEventListeners();
    });

    // Load and parse CSV data (semicolon-delimited)
    function loadData() {
        d3.text(config.dataPath).then(text => {
            // Parse semicolon-delimited CSV
            const rows = text.trim().split('\n');
            const headers = rows[0].split(';');
            
            const data = [];
            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(';');
                const year = values[0] ? values[0].trim() : '';
                
                // Skip empty rows or the last row with asterisks
                if (!year || year === '**' || year.startsWith('**')) continue;
                
                data.push({
                    year: year,
                    carbon: parseFloat(values[1]) || 0,
                    electricity: parseFloat(values[2]) || 0,
                    water: parseFloat(values[3]) || 0,
                    health: parseFloat(values[4]) || 0
                });
            }
            
            state.data = data;
            console.log('California data loaded:', state.data);
            renderChart();
        }).catch(error => {
            console.error('Error loading California data:', error);
            document.getElementById(config.containerId).innerHTML = 
                '<p class="text-danger text-center">Error loading data. Please refresh the page.</p>';
        });
    }

    // Setup event listeners for controls
    function setupEventListeners() {
        // Metric toggles
        document.querySelectorAll('#california-metric-toggles button').forEach(btn => {
            btn.addEventListener('click', function() {
                const metric = this.dataset.metric;
                
                if (this.classList.contains('active')) {
                    // Don't allow deselecting all metrics
                    if (state.activeMetrics.length > 1) {
                        state.activeMetrics = state.activeMetrics.filter(m => m !== metric);
                        this.classList.remove('active', 'btn-primary');
                        this.classList.add('btn-outline-primary');
                    }
                } else {
                    state.activeMetrics.push(metric);
                    this.classList.remove('btn-outline-primary');
                    this.classList.add('active', 'btn-primary');
                }
                
                renderChart();
            });
        });

        // Resize handler
        window.addEventListener('resize', debounce(() => {
            if (state.data) renderChart();
        }, 250));
    }

    // Main render function
    function renderChart() {
        const container = document.getElementById(config.containerId);
        container.innerHTML = '';

        const rect = container.getBoundingClientRect();
        state.width = rect.width - config.margin.left - config.margin.right;
        state.height = 450 - config.margin.top - config.margin.bottom;

        renderGroupedBarChart(container);
    }

    // Grouped Bar Chart
    function renderGroupedBarChart(container) {
        const svg = d3.select(container)
            .append('svg')
            .attr('width', state.width + config.margin.left + config.margin.right)
            .attr('height', state.height + config.margin.top + config.margin.bottom)
            .append('g')
            .attr('transform', `translate(${config.margin.left},${config.margin.top})`);

        // X Scale - Years
        const x0 = d3.scaleBand()
            .domain(state.data.map(d => d.year))
            .rangeRound([0, state.width])
            .paddingInner(0.2);

        const x1 = d3.scaleBand()
            .domain(state.activeMetrics)
            .rangeRound([0, x0.bandwidth()])
            .padding(0.05);

        // Y Scales - One per active metric (normalized to percentage of max)
        const yScales = {};
        state.activeMetrics.forEach(metric => {
            const maxVal = d3.max(state.data, d => d[metric]);
            yScales[metric] = d3.scaleLinear()
                .domain([0, maxVal * 1.1])
                .range([state.height, 0]);
        });

        // Use the first metric's scale for the axis
        const primaryMetric = state.activeMetrics[0];
        const y = yScales[primaryMetric];

        // Add gradient definitions
        const defs = svg.append('defs');
        state.activeMetrics.forEach(metric => {
            const gradient = defs.append('linearGradient')
                .attr('id', `gradient-${metric}`)
                .attr('x1', '0%').attr('y1', '100%')
                .attr('x2', '0%').attr('y2', '0%');
            
            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', metrics[metric].color)
                .attr('stop-opacity', 0.6);
            
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', metrics[metric].color)
                .attr('stop-opacity', 1);
        });

        // X Axis
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${state.height})`)
            .call(d3.axisBottom(x0))
            .selectAll('text')
            .style('font-size', '14px')
            .style('font-weight', d => d.includes('2028') ? 'bold' : 'normal')
            .style('fill', d => d.includes('2028') ? '#6c757d' : '#333');

        // Y Axis (left)
        svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y).ticks(6))
            .selectAll('text')
            .style('font-size', '14px');

        // Y Axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -65)
            .attr('x', -state.height / 2)
            .attr('fill', metrics[primaryMetric].color)
            .attr('text-anchor', 'middle')
            .style('font-size', '15px')
            .style('font-weight', 'bold')
            .text(metrics[primaryMetric].label + ' (' + metrics[primaryMetric].unit + ')');

        // Add gridlines
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.3)
            .call(d3.axisLeft(y).ticks(6).tickSize(-state.width).tickFormat(''));

        // Create bar groups
        const yearGroups = svg.selectAll('.year-group')
            .data(state.data)
            .enter()
            .append('g')
            .attr('class', 'year-group')
            .attr('transform', d => `translate(${x0(d.year)},0)`);

        // Create bars for each metric
        state.activeMetrics.forEach((metric, i) => {
            const yScale = yScales[metric];
            
            yearGroups.append('rect')
                .attr('class', `bar bar-${metric}`)
                .attr('x', x1(metric))
                .attr('width', x1.bandwidth())
                .attr('y', state.height)
                .attr('height', 0)
                .attr('fill', `url(#gradient-${metric})`)
                .attr('rx', 3)
                .attr('ry', 3)
                .style('cursor', 'pointer')
                .on('mouseover', function(event, d) {
                    showTooltip(event, d, metric);
                    d3.select(this).style('opacity', 0.8);
                })
                .on('mouseout', function() {
                    hideTooltip();
                    d3.select(this).style('opacity', 1);
                })
                .transition()
                .duration(config.transitionDuration)
                .delay((d, j) => j * 50 + i * 100)
                .attr('y', d => yScale(d[metric]))
                .attr('height', d => state.height - yScale(d[metric]));

            // Add value labels on top of bars
            yearGroups.append('text')
                .attr('class', 'bar-label')
                .attr('x', x1(metric) + x1.bandwidth() / 2)
                .attr('y', d => yScale(d[metric]) - 8)
                .attr('text-anchor', 'middle')
                .attr('fill', metrics[metric].color)
                .style('font-size', '13px')
                .style('font-weight', 'bold')
                .style('opacity', 0)
                .text(d => d[metric].toFixed(1))
                .transition()
                .duration(config.transitionDuration)
                .delay((d, j) => j * 50 + i * 100 + 300)
                .style('opacity', 1);
        });

        // Add legend
        addLegend(svg, state.activeMetrics);

        // Add projection annotation
        addProjectionAnnotation(svg, x0);
    }

    // Add legend to chart (positioned at top-left)
    function addLegend(svg, activeMetrics) {
        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(0, -40)`);

        activeMetrics.forEach((metric, i) => {
            const legendItem = legend.append('g')
                .attr('transform', `translate(${i * 200}, 0)`);

            legendItem.append('rect')
                .attr('width', 20)
                .attr('height', 20)
                .attr('fill', metrics[metric].color)
                .attr('rx', 3);

            legendItem.append('text')
                .attr('x', 26)
                .attr('y', 16)
                .attr('fill', '#333')
                .style('font-size', '15px')
                .style('font-weight', '500')
                .text(metrics[metric].label);
        });
    }

    // Add projection annotation
    function addProjectionAnnotation(svg, xScale) {
        // Find position for 2028 projections
        const proj2028Low = state.data.find(d => d.year.includes('low'));
        if (!proj2028Low) return;

        const xPos = xScale(proj2028Low.year);
        
        // Add vertical dashed line
        svg.append('line')
            .attr('x1', xPos - 30)
            .attr('y1', 0)
            .attr('x2', xPos - 30)
            .attr('y2', state.height)
            .style('stroke', '#6c757d')
            .style('stroke-dasharray', '5,5')
            .style('stroke-width', 2);

        // Add annotation text
        svg.append('text')
            .attr('x', xPos - 25)
            .attr('y', -15)
            .attr('fill', '#6c757d')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text('← Projections →');
    }

    // Tooltip functions
    function showTooltip(event, data, metric) {
        let tooltip = d3.select('#california-tooltip');
        
        if (tooltip.empty()) {
            tooltip = d3.select('body').append('div')
                .attr('id', 'california-tooltip')
                .style('position', 'absolute')
                .style('background', 'rgba(0,0,0,0.85)')
                .style('color', '#fff')
                .style('padding', '14px 18px')
                .style('border-radius', '8px')
                .style('font-size', '15px')
                .style('pointer-events', 'none')
                .style('z-index', '1000')
                .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)');
        }

        const html = `
            <div style="font-weight: bold; margin-bottom: 8px; color: ${metrics[metric].color}">
                ${data.year}
            </div>
            <div style="margin-bottom: 4px;">
                <span style="color: ${metrics[metric].color}">●</span> 
                ${metrics[metric].label}: <strong>${data[metric].toFixed(2)} ${metrics[metric].unit}</strong>
            </div>
            ${metric !== 'carbon' ? `<div style="opacity: 0.8; font-size: 13px;">Carbon: ${data.carbon.toFixed(2)} M tons</div>` : ''}
            ${metric !== 'electricity' ? `<div style="opacity: 0.8; font-size: 13px;">Electricity: ${data.electricity.toFixed(2)} TWh</div>` : ''}
            ${metric !== 'water' ? `<div style="opacity: 0.8; font-size: 13px;">Water: ${data.water.toFixed(2)} B liters</div>` : ''}
            ${metric !== 'health' ? `<div style="opacity: 0.8; font-size: 13px;">Health: $${data.health.toFixed(2)} M</div>` : ''}
        `;

        tooltip.html(html)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .style('opacity', 1);
    }

    function hideTooltip() {
        d3.select('#california-tooltip').style('opacity', 0);
    }

    // Utility: Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

})();

// ============================================================
// ADDITIONAL CALIFORNIA VISUALIZATIONS
// ============================================================

(function() {
    'use strict';

    const margin = { top: 50, right: 30, bottom: 60, left: 70 };
    const transitionDuration = 750;

    // Color palette
    const colors = {
        california: '#3498db',
        us: '#e74c3c',
        primary: '#2c3e50',
        secondary: '#95a5a6',
        scope1: '#e67e22',
        scope2: '#9b59b6',
        onsite: '#1abc9c',
        offsite: '#3498db',
        pue: '#e74c3c',
        wue: '#17a2b8'
    };

    // Initialize all charts when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        loadAllCaliforniaData();
    });

    // Load all California data files
    function loadAllCaliforniaData() {
        Promise.all([
            d3.text('data/californie/table2.csv'),
            d3.text('data/californie/table3.csv'),
            d3.text('data/californie/table4.csv'),
            d3.text('data/californie/table5.csv'),
            d3.text('data/californie/table6.csv'),
            d3.text('data/californie/table7.csv')
        ]).then(([table2, table3, table4, table5, table6, table7]) => {
            const data2 = parseCSV(table2);
            const data3 = parseCSV(table3);
            const data4 = parseCSV(table4);
            const data5 = parseCSV(table5);
            const data6 = parseCSV(table6);
            const data7 = parseCSV(table7);

            renderCAvsUSChart(data2);
            renderEmissionFactorsChart(data3);
            renderEfficiencyMetricsChart(data5);
            renderWaterBreakdownChart(data6);
            renderHealthCostsChart(data7);
            renderCAShareChart(data4);
        }).catch(error => {
            console.error('Error loading California data:', error);
        });
    }

    // Parse semicolon or comma delimited CSV
    function parseCSV(text) {
        const lines = text.trim().split('\n');
        const delimiter = lines[0].includes(';') ? ';' : ',';
        const headers = lines[0].split(delimiter).map(h => h.trim());
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(delimiter);
            if (values[0] && !values[0].includes('**')) {
                const row = {};
                headers.forEach((h, idx) => {
                    let val = values[idx] ? values[idx].trim() : '';
                    row[h] = isNaN(parseFloat(val)) ? val : parseFloat(val);
                });
                data.push(row);
            }
        }
        return data;
    }

    // ============================================================
    // Chart 1: California vs US Data Center Electricity
    // ============================================================
    function renderCAvsUSChart(data) {
        const container = document.getElementById('california-vs-us-chart');
        if (!container) return;
        container.innerHTML = '';

        const rect = container.getBoundingClientRect();
        const width = rect.width - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Filter data for years
        const cleanData = data.filter(d => d.Year);

        // X Scale
        const x = d3.scaleBand()
            .domain(cleanData.map(d => String(d.Year).replace('.0', '')))
            .range([0, width])
            .padding(0.3);

        // Y Scale (for US - larger values)
        const yUS = d3.scaleLinear()
            .domain([0, d3.max(cleanData, d => d['U.S. Data Center Electricity (TWh)']) * 1.1])
            .range([height, 0]);

        // Y Scale (for CA - smaller values)
        const yCA = d3.scaleLinear()
            .domain([0, d3.max(cleanData, d => d['CA Data Center Electricity (TWh)']) * 1.1])
            .range([height, 0]);

        // X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('font-size', '13px');

        // Y Axis Left (CA)
        svg.append('g')
            .call(d3.axisLeft(yCA).ticks(6))
            .selectAll('text')
            .style('font-size', '12px');

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -55)
            .attr('x', -height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.california)
            .style('font-size', '13px')
            .style('font-weight', 'bold')
            .text('California (TWh)');

        // Y Axis Right (US)
        svg.append('g')
            .attr('transform', `translate(${width},0)`)
            .call(d3.axisRight(yUS).ticks(6))
            .selectAll('text')
            .style('font-size', '12px');

        svg.append('text')
            .attr('transform', 'rotate(90)')
            .attr('y', -width - 45)
            .attr('x', height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.us)
            .style('font-size', '13px')
            .style('font-weight', 'bold')
            .text('US Total (TWh)');

        // Bars for California
        svg.selectAll('.bar-ca')
            .data(cleanData)
            .enter()
            .append('rect')
            .attr('class', 'bar-ca')
            .attr('x', d => x(String(d.Year).replace('.0', '')))
            .attr('width', x.bandwidth() / 2 - 2)
            .attr('y', height)
            .attr('height', 0)
            .attr('fill', colors.california)
            .attr('rx', 3)
            .transition()
            .duration(transitionDuration)
            .attr('y', d => yCA(d['CA Data Center Electricity (TWh)']))
            .attr('height', d => height - yCA(d['CA Data Center Electricity (TWh)']));

        // Bars for US
        svg.selectAll('.bar-us')
            .data(cleanData)
            .enter()
            .append('rect')
            .attr('class', 'bar-us')
            .attr('x', d => x(String(d.Year).replace('.0', '')) + x.bandwidth() / 2 + 2)
            .attr('width', x.bandwidth() / 2 - 2)
            .attr('y', height)
            .attr('height', 0)
            .attr('fill', colors.us)
            .attr('rx', 3)
            .transition()
            .duration(transitionDuration)
            .attr('y', d => yUS(d['U.S. Data Center Electricity (TWh)']))
            .attr('height', d => height - yUS(d['U.S. Data Center Electricity (TWh)']));

        // Legend
        const legend = svg.append('g')
            .attr('transform', `translate(0, -30)`);

        legend.append('rect').attr('width', 16).attr('height', 16).attr('fill', colors.california).attr('rx', 3);
        legend.append('text').attr('x', 22).attr('y', 13).text('California').style('font-size', '13px');

        legend.append('rect').attr('x', 120).attr('width', 16).attr('height', 16).attr('fill', colors.us).attr('rx', 3);
        legend.append('text').attr('x', 142).attr('y', 13).text('US Total').style('font-size', '13px');
    }

    // ============================================================
    // Chart 2: Emission Factors Comparison
    // ============================================================
    function renderEmissionFactorsChart(data) {
        const container = document.getElementById('emission-factors-chart');
        if (!container) return;
        container.innerHTML = '';

        const rect = container.getBoundingClientRect();
        const width = rect.width - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const cleanData = data.filter(d => d.Year);

        // X Scale
        const x = d3.scalePoint()
            .domain(cleanData.map(d => String(d.Year).replace('.0', '')))
            .range([0, width])
            .padding(0.5);

        // Y Scale
        const y = d3.scaleLinear()
            .domain([0, d3.max(cleanData, d => Math.max(d['CA Emissions Factor (lbs/MWh)'] || 0, d['U.S. Emission Factor (lbs/MWh)'] || 0)) * 1.1])
            .range([height, 0]);

        // Grid
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.3)
            .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(''));

        // X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('font-size', '13px');

        // Y Axis
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5))
            .selectAll('text')
            .style('font-size', '12px');

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -55)
            .attr('x', -height / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '13px')
            .style('font-weight', 'bold')
            .text('Emission Factor (lbs/MWh)');

        // Line generators
        const lineCA = d3.line()
            .x(d => x(String(d.Year).replace('.0', '')))
            .y(d => y(d['CA Emissions Factor (lbs/MWh)'] || 0))
            .curve(d3.curveMonotoneX);

        const lineUS = d3.line()
            .x(d => x(String(d.Year).replace('.0', '')))
            .y(d => y(d['U.S. Emission Factor (lbs/MWh)'] || 0))
            .curve(d3.curveMonotoneX);

        // CA Line
        svg.append('path')
            .datum(cleanData)
            .attr('fill', 'none')
            .attr('stroke', colors.california)
            .attr('stroke-width', 3)
            .attr('d', lineCA);

        // US Line
        svg.append('path')
            .datum(cleanData)
            .attr('fill', 'none')
            .attr('stroke', colors.us)
            .attr('stroke-width', 3)
            .attr('d', lineUS);

        // CA Dots
        svg.selectAll('.dot-ca')
            .data(cleanData)
            .enter()
            .append('circle')
            .attr('cx', d => x(String(d.Year).replace('.0', '')))
            .attr('cy', d => y(d['CA Emissions Factor (lbs/MWh)'] || 0))
            .attr('r', 6)
            .attr('fill', colors.california)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        // US Dots
        svg.selectAll('.dot-us')
            .data(cleanData)
            .enter()
            .append('circle')
            .attr('cx', d => x(String(d.Year).replace('.0', '')))
            .attr('cy', d => y(d['U.S. Emission Factor (lbs/MWh)'] || 0))
            .attr('r', 6)
            .attr('fill', colors.us)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        // Legend
        const legend = svg.append('g').attr('transform', `translate(0, -30)`);
        legend.append('rect').attr('width', 16).attr('height', 16).attr('fill', colors.california).attr('rx', 3);
        legend.append('text').attr('x', 22).attr('y', 13).text('California').style('font-size', '13px');
        legend.append('rect').attr('x', 120).attr('width', 16).attr('height', 16).attr('fill', colors.us).attr('rx', 3);
        legend.append('text').attr('x', 142).attr('y', 13).text('US Average').style('font-size', '13px');
    }

    // ============================================================
    // Chart 3: Efficiency Metrics (PUE & WUE)
    // ============================================================
    function renderEfficiencyMetricsChart(data) {
        const container = document.getElementById('efficiency-metrics-chart');
        if (!container) return;
        container.innerHTML = '';

        const rect = container.getBoundingClientRect();
        const width = rect.width - margin.left - margin.right - 40;
        const height = 350 - margin.top - margin.bottom;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right + 40)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const cleanData = data.filter(d => d.Year);

        // X Scale
        const x = d3.scalePoint()
            .domain(cleanData.map(d => String(d.Year).replace('.0', '')))
            .range([0, width])
            .padding(0.5);

        // Y Scale for PUE (left)
        const yPUE = d3.scaleLinear()
            .domain([1.3, 1.6])
            .range([height, 0]);

        // Y Scale for WUE (right)
        const yWUE = d3.scaleLinear()
            .domain([0.3, 0.4])
            .range([height, 0]);

        // Grid
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.3)
            .call(d3.axisLeft(yPUE).ticks(5).tickSize(-width).tickFormat(''));

        // X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('font-size', '13px');

        // Y Axis Left (PUE)
        svg.append('g')
            .call(d3.axisLeft(yPUE).ticks(5))
            .selectAll('text')
            .style('font-size', '12px');

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.pue)
            .style('font-size', '13px')
            .style('font-weight', 'bold')
            .text('PUE');

        // Y Axis Right (WUE)
        svg.append('g')
            .attr('transform', `translate(${width},0)`)
            .call(d3.axisRight(yWUE).ticks(5))
            .selectAll('text')
            .style('font-size', '12px');

        svg.append('text')
            .attr('transform', 'rotate(90)')
            .attr('y', -width - 40)
            .attr('x', height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.wue)
            .style('font-size', '13px')
            .style('font-weight', 'bold')
            .text('WUE (L/kWh)');

        // PUE Line
        const linePUE = d3.line()
            .x(d => x(String(d.Year).replace('.0', '')))
            .y(d => yPUE(d['PUE'] || 0))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(cleanData)
            .attr('fill', 'none')
            .attr('stroke', colors.pue)
            .attr('stroke-width', 3)
            .attr('d', linePUE);

        // WUE Line
        const lineWUE = d3.line()
            .x(d => x(String(d.Year).replace('.0', '')))
            .y(d => yWUE(d['WUE (L/kWh)'] || 0))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(cleanData)
            .attr('fill', 'none')
            .attr('stroke', colors.wue)
            .attr('stroke-width', 3)
            .attr('d', lineWUE);

        // PUE Dots with values
        svg.selectAll('.dot-pue')
            .data(cleanData)
            .enter()
            .append('circle')
            .attr('cx', d => x(String(d.Year).replace('.0', '')))
            .attr('cy', d => yPUE(d['PUE'] || 0))
            .attr('r', 6)
            .attr('fill', colors.pue)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        svg.selectAll('.label-pue')
            .data(cleanData)
            .enter()
            .append('text')
            .attr('x', d => x(String(d.Year).replace('.0', '')))
            .attr('y', d => yPUE(d['PUE'] || 0) - 12)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.pue)
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(d => d['PUE'] ? d['PUE'].toFixed(2) : '');

        // WUE Dots
        svg.selectAll('.dot-wue')
            .data(cleanData)
            .enter()
            .append('circle')
            .attr('cx', d => x(String(d.Year).replace('.0', '')))
            .attr('cy', d => yWUE(d['WUE (L/kWh)'] || 0))
            .attr('r', 6)
            .attr('fill', colors.wue)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        // Legend
        const legend = svg.append('g').attr('transform', `translate(0, -30)`);
        legend.append('rect').attr('width', 16).attr('height', 16).attr('fill', colors.pue).attr('rx', 3);
        legend.append('text').attr('x', 22).attr('y', 13).text('PUE (lower = better)').style('font-size', '13px');
        legend.append('rect').attr('x', 180).attr('width', 16).attr('height', 16).attr('fill', colors.wue).attr('rx', 3);
        legend.append('text').attr('x', 202).attr('y', 13).text('WUE (L/kWh)').style('font-size', '13px');
    }

    // ============================================================
    // Chart 4: Water Consumption Breakdown (Stacked Area)
    // ============================================================
    function renderWaterBreakdownChart(data) {
        const container = document.getElementById('water-breakdown-chart');
        if (!container) return;
        container.innerHTML = '';

        const rect = container.getBoundingClientRect();
        const width = rect.width - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Clean and prepare data
        const cleanData = data.filter(d => d.Year && typeof d['On-Site Water Consumption (billion liters)'] === 'number');

        // X Scale
        const x = d3.scalePoint()
            .domain(cleanData.map(d => String(d.Year).replace('.0', '')))
            .range([0, width])
            .padding(0.5);

        // Y Scale
        const y = d3.scaleLinear()
            .domain([0, d3.max(cleanData, d => d['Total Water Consumption (billion liters)'] || 0) * 1.1])
            .range([height, 0]);

        // Grid
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.3)
            .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(''));

        // X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('font-size', '13px');

        // Y Axis
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5))
            .selectAll('text')
            .style('font-size', '12px');

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -55)
            .attr('x', -height / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '13px')
            .style('font-weight', 'bold')
            .text('Water (Billion Liters)');

        // Area for Off-Site (larger, background)
        const areaOffsite = d3.area()
            .x(d => x(String(d.Year).replace('.0', '')))
            .y0(height)
            .y1(d => y(d['Total Water Consumption (billion liters)'] || 0))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(cleanData)
            .attr('fill', colors.offsite)
            .attr('fill-opacity', 0.6)
            .attr('d', areaOffsite);

        // Area for On-Site (smaller, foreground)
        const areaOnsite = d3.area()
            .x(d => x(String(d.Year).replace('.0', '')))
            .y0(height)
            .y1(d => y(d['On-Site Water Consumption (billion liters)'] || 0))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(cleanData)
            .attr('fill', colors.onsite)
            .attr('fill-opacity', 0.8)
            .attr('d', areaOnsite);

        // Legend
        const legend = svg.append('g').attr('transform', `translate(0, -30)`);
        legend.append('rect').attr('width', 16).attr('height', 16).attr('fill', colors.onsite).attr('rx', 3);
        legend.append('text').attr('x', 22).attr('y', 13).text('On-Site').style('font-size', '13px');
        legend.append('rect').attr('x', 100).attr('width', 16).attr('height', 16).attr('fill', colors.offsite).attr('rx', 3);
        legend.append('text').attr('x', 122).attr('y', 13).text('Off-Site (Electricity)').style('font-size', '13px');
    }

    // ============================================================
    // Chart 5: Health Costs - Scope 1 vs Scope 2
    // ============================================================
    function renderHealthCostsChart(data) {
        const container = document.getElementById('health-costs-chart');
        if (!container) return;
        container.innerHTML = '';

        const rect = container.getBoundingClientRect();
        const width = rect.width - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Clean data - filter out rows with date strings
        const cleanData = data.filter(d => d.Year && typeof d['Scope-1 Health Cost (million $)'] === 'number');

        // X Scale
        const x = d3.scaleBand()
            .domain(cleanData.map(d => String(d.Year).replace('.0', '')))
            .range([0, width])
            .padding(0.3);

        // Y Scale
        const y = d3.scaleLinear()
            .domain([0, d3.max(cleanData, d => d['Total Health Cost (million $)'] || 0) * 1.1])
            .range([height, 0]);

        // Grid
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.3)
            .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(''));

        // X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('font-size', '13px');

        // Y Axis
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5))
            .selectAll('text')
            .style('font-size', '12px');

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -55)
            .attr('x', -height / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '13px')
            .style('font-weight', 'bold')
            .text('Health Costs (Million $)');

        // Stacked bars
        cleanData.forEach((d, i) => {
            const yearX = x(String(d.Year).replace('.0', ''));
            const scope1 = d['Scope-1 Health Cost (million $)'] || 0;
            const scope2 = d['Scope-2 Health Cost (million $)'] || 0;

            // Scope 2 (bottom)
            svg.append('rect')
                .attr('x', yearX)
                .attr('width', x.bandwidth())
                .attr('y', height)
                .attr('height', 0)
                .attr('fill', colors.scope2)
                .attr('rx', 3)
                .transition()
                .duration(transitionDuration)
                .delay(i * 100)
                .attr('y', y(scope2))
                .attr('height', height - y(scope2));

            // Scope 1 (top, stacked)
            svg.append('rect')
                .attr('x', yearX)
                .attr('width', x.bandwidth())
                .attr('y', height)
                .attr('height', 0)
                .attr('fill', colors.scope1)
                .attr('rx', 3)
                .transition()
                .duration(transitionDuration)
                .delay(i * 100 + 200)
                .attr('y', y(scope1 + scope2))
                .attr('height', y(scope2) - y(scope1 + scope2));
        });

        // Legend
        const legend = svg.append('g').attr('transform', `translate(0, -30)`);
        legend.append('rect').attr('width', 16).attr('height', 16).attr('fill', colors.scope1).attr('rx', 3);
        legend.append('text').attr('x', 22).attr('y', 13).text('Scope 1 (Direct)').style('font-size', '13px');
        legend.append('rect').attr('x', 150).attr('width', 16).attr('height', 16).attr('fill', colors.scope2).attr('rx', 3);
        legend.append('text').attr('x', 172).attr('y', 13).text('Scope 2 (Indirect)').style('font-size', '13px');
    }

    // ============================================================
    // Chart 6: California's Share of State Electricity & Emissions
    // ============================================================
    function renderCAShareChart(data) {
        const container = document.getElementById('ca-share-chart');
        if (!container) return;
        container.innerHTML = '';

        const rect = container.getBoundingClientRect();
        const width = rect.width - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const cleanData = data.filter(d => d.Year);

        // X Scale
        const x = d3.scalePoint()
            .domain(cleanData.map(d => String(d.Year).replace('.0', '')))
            .range([0, width])
            .padding(0.5);

        // Y Scale for percentage
        const y = d3.scaleLinear()
            .domain([0, 6])
            .range([height, 0]);

        // Grid
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.3)
            .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(''));

        // X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('font-size', '13px');

        // Y Axis
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
            .selectAll('text')
            .style('font-size', '12px');

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -height / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '13px')
            .style('font-weight', 'bold')
            .text('DC Share of CA Total (%)');

        // Line for DC share of emissions
        const lineShare = d3.line()
            .x(d => x(String(d.Year).replace('.0', '')))
            .y(d => y(d['DC Emission of CA Total (%)'] || 0))
            .curve(d3.curveMonotoneX);

        // Area under line
        const areaShare = d3.area()
            .x(d => x(String(d.Year).replace('.0', '')))
            .y0(height)
            .y1(d => y(d['DC Emission of CA Total (%)'] || 0))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(cleanData)
            .attr('fill', '#e74c3c')
            .attr('fill-opacity', 0.2)
            .attr('d', areaShare);

        svg.append('path')
            .datum(cleanData)
            .attr('fill', 'none')
            .attr('stroke', '#e74c3c')
            .attr('stroke-width', 3)
            .attr('d', lineShare);

        // Dots with values
        svg.selectAll('.dot-share')
            .data(cleanData)
            .enter()
            .append('circle')
            .attr('cx', d => x(String(d.Year).replace('.0', '')))
            .attr('cy', d => y(d['DC Emission of CA Total (%)'] || 0))
            .attr('r', 7)
            .attr('fill', '#e74c3c')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        svg.selectAll('.label-share')
            .data(cleanData)
            .enter()
            .append('text')
            .attr('x', d => x(String(d.Year).replace('.0', '')))
            .attr('y', d => y(d['DC Emission of CA Total (%)'] || 0) - 15)
            .attr('text-anchor', 'middle')
            .attr('fill', '#e74c3c')
            .style('font-size', '13px')
            .style('font-weight', 'bold')
            .text(d => d['DC Emission of CA Total (%)'] ? d['DC Emission of CA Total (%)'].toFixed(1) + '%' : '');

        // Legend
        const legend = svg.append('g').attr('transform', `translate(0, -30)`);
        legend.append('rect').attr('width', 16).attr('height', 16).attr('fill', '#e74c3c').attr('rx', 3);
        legend.append('text').attr('x', 22).attr('y', 13).text('Data Center Share of CA Emissions').style('font-size', '13px');
    }

})();
