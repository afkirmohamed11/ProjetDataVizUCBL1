/**
 * Energy Proportionality Visualizations with Horizontal Scroller
 * 1. The Efficiency Leap: Year vs Result (Performance/Watt)
 * 2. Energy Proportionality: Workload % (2010 vs 2024 server)
 * 3. Density vs Waste: Cores vs Idle Watts (colored by Result)
 */

(function() {
    console.log('=== BUILDING ENERGY PROPORTIONALITY VISUALIZATIONS ===');
    
    const container = document.getElementById('servers-3d-container');
    if (!container) {
        console.error('Container not found');
        return;
    }

    d3.select('#servers-3d-container').html('');

    // Get dynamic container width
    const containerElement = document.getElementById('servers-3d-container');
    const containerWidth = Math.min(containerElement.getBoundingClientRect().width - 20, 1350);
    const margin = { top: 70, right: 50, bottom: 80, left: 100 };
    const width = containerWidth - margin.left - margin.right;
    const height = 480 - margin.top - margin.bottom;
    const svgHeight = height + margin.top + margin.bottom + 20;

    // Create scroller wrapper with buttons
    const scrollerWrapper = d3.select('#servers-3d-container').append('div')
        .style('position', 'relative')
        .style('width', '100%')
        .style('height', '600px')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('justify-content', 'center');

    // Left button
    scrollerWrapper.append('button')
        .attr('id', 'scroll-left')
        .text('❮')
        .style('position', 'absolute')
        .style('left', '10px')
        .style('background', '#666')
        .style('color', 'white')
        .style('border', 'none')
        .style('border-radius', '50%')
        .style('width', '45px')
        .style('height', '45px')
        .style('font-size', '24px')
        .style('cursor', 'pointer')
        .style('z-index', '100');

    // Right button
    scrollerWrapper.append('button')
        .attr('id', 'scroll-right')
        .text('❯')
        .style('position', 'absolute')
        .style('right', '10px')
        .style('background', '#666')
        .style('color', 'white')
        .style('border', 'none')
        .style('border-radius', '50%')
        .style('width', '45px')
        .style('height', '45px')
        .style('font-size', '24px')
        .style('cursor', 'pointer')
        .style('z-index', '100');

    // SVG container
    const svgWrapper = scrollerWrapper.append('div')
        .attr('id', 'svg-wrapper')
        .style('width', '100%')
        .style('height', '100%')
        .style('overflow', 'hidden')
        .style('padding', '0 60px')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center');

    // Indicator dots
    const dotsContainer = d3.select('#servers-3d-container').append('div')
        .style('text-align', 'center')
        .style('margin-top', '15px');

    let currentViz = 0;
    const vizs = [];

    const updateDots = () => {
        dotsContainer.selectAll('span').remove();
        vizs.forEach((_, i) => {
            dotsContainer.append('span')
                .style('display', 'inline-block')
                .style('height', '12px')
                .style('width', '12px')
                .style('margin', '0 6px')
                .style('background-color', i === currentViz ? '#2ca02c' : '#ddd')
                .style('border-radius', '50%')
                .style('cursor', 'pointer')
                .on('click', () => {
                    currentViz = i;
                    updateDisplay();
                });
        });
    };

    const updateDisplay = () => {
        svgWrapper.selectAll('svg').style('display', 'none');
        if (vizs[currentViz]) {
            d3.select(vizs[currentViz]).style('display', 'block');
        }
        updateDots();
    };

    const scrollToViz = (direction) => {
        currentViz = (currentViz + direction + vizs.length) % vizs.length;
        updateDisplay();
    };

    d3.select('#scroll-left').on('click', () => scrollToViz(-1));
    d3.select('#scroll-right').on('click', () => scrollToViz(1));

    // Load CSV
    d3.csv('data/EfficiencyAnalysis - SpecPower Servers.csv')
        .then(rawData => {
            console.log('✓ CSV loaded:', rawData.length, 'records');

            const colYear = 'Hardware release year';
            const colVendor = 'Hardware Vendor\t';
            const colCores = '# Cores';
            const colResult = 'Result';
            const colIdle = 'Average watts @ active idle\t';
            const colSystem = 'System';

            const data = [];

            rawData.forEach((d) => {
                const year = parseInt(d[colYear]);
                const result = parseFloat(d[colResult]) || 0;
                const idle = parseFloat(d[colIdle]) || 0;
                const cores = parseInt(d[colCores]) || 1;
                const vendor = (d[colVendor] || 'Other').trim();
                const system = (d[colSystem] || 'Unknown').trim();

                if (isNaN(year) || year < 2008 || result <= 0 || idle <= 0) return;

                const loads = {};
                [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach(level => {
                    const colName = `Performance/power @ ${level}% of target load\t`;
                    loads[level] = parseFloat(d[colName]) || 0;
                });

                data.push({ year, result, idle, cores, vendor, system, loads });
            });

            console.log('✓ Processed:', data.length, 'systems');

            // ========== VIZ 1: THE EFFICIENCY LEAP ==========
            const svg1 = svgWrapper.append('svg')
                .attr('width', containerWidth)
                .attr('height', svgHeight)
                .attr('viewBox', [0, 0, containerWidth, svgHeight])
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .style('background', '#f8f9fa')
                .style('border', '1px solid #ddd')
                .style('border-radius', '4px')
                .style('display', 'block')
                .style('overflow', 'hidden')
                .style('margin', '0 auto');

            vizs.push(svg1.node());

            const g1 = svg1.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            svg1.append('text')
                .attr('x', containerWidth / 2)
                .attr('y', 35)
                .attr('text-anchor', 'middle')
                .style('font-size', '18px')
                .style('font-weight', 'bold')
                .text('1. The Efficiency Leap: Performance Per Watt Over Time');

            // Aggregate by year
            const efficiencyByYear = d3.rollup(data, v => d3.mean(v, d => d.result), d => d.year);
            const effData = Array.from(efficiencyByYear, ([year, efficiency]) => ({ year, efficiency }))
                .sort((a, b) => a.year - b.year);

            const xScale1 = d3.scaleLinear()
                .domain(d3.extent(effData, d => d.year))
                .range([0, width]);

            const yScale1 = d3.scaleLinear()
                .domain([0, d3.max(effData, d => d.efficiency)])
                .range([height, 0]);

            const line1 = d3.line()
                .x(d => xScale1(d.year))
                .y(d => yScale1(d.efficiency));

            g1.append('path')
                .datum(effData)
                .attr('d', line1)
                .style('stroke', '#2ca02c')
                .style('stroke-width', 4)
                .style('fill', 'none');

            g1.selectAll('.eff-dot')
                .data(effData)
                .enter()
                .append('circle')
                .attr('cx', d => xScale1(d.year))
                .attr('cy', d => yScale1(d.efficiency))
                .attr('r', 6)
                .attr('fill', '#2ca02c')
                .attr('opacity', 0.7)
                .style('cursor', 'pointer')
                .on('mouseover', function(event, d) {
                    d3.select(this).transition().duration(100).attr('r', 10).attr('opacity', 1);
                    const tooltip = d3.select('body').append('div')
                        .style('position', 'absolute')
                        .style('padding', '10px')
                        .style('background', 'rgba(0,0,0,0.9)')
                        .style('color', 'white')
                        .style('border-radius', '4px')
                        .style('font-size', '12px')
                        .style('z-index', '1000')
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 10) + 'px')
                        .html(`Year: ${d.year}<br/>Avg Efficiency: ${d.efficiency.toFixed(0)} ops/W`);
                    setTimeout(() => tooltip.remove(), 2000);
                })
                .on('mouseout', function() {
                    d3.select(this).transition().duration(100).attr('r', 6).attr('opacity', 0.7);
                });

            g1.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(xScale1).tickFormat(d3.format('d')))
                .style('font-size', '12px')
                .append('text')
                .attr('x', width / 2)
                .attr('y', 55)
                .attr('text-anchor', 'middle')
                .style('font-size', '14px')
                .style('fill', 'black')
                .text('Hardware Release Year');

            g1.append('g')
                .call(d3.axisLeft(yScale1))
                .style('font-size', '12px')
                .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -height / 2)
                .attr('y', -70)
                .attr('text-anchor', 'middle')
                .style('font-size', '14px')
                .style('fill', 'black')
                .text('Performance/Watt (ops/W)');

            // ========== VIZ 2: ENERGY PROPORTIONALITY ==========
            const svg3 = svgWrapper.append('svg')
                .attr('width', containerWidth)
                .attr('height', svgHeight)
                .attr('viewBox', [0, 0, containerWidth, svgHeight])
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .style('background', '#f8f9fa')
                .style('border', '1px solid #ddd')
                .style('border-radius', '4px')
                .style('display', 'none')
                .style('overflow', 'hidden')
                .style('margin', '0 auto');

            vizs.push(svg3.node());

            const g3 = svg3.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            svg3.append('text')
                .attr('x', containerWidth / 2)
                .attr('y', 35)
                .attr('text-anchor', 'middle')
                .style('font-size', '18px')
                .style('font-weight', 'bold')
                .text('2. Energy Proportionality: Old Server (2010) vs Modern Server (2024)');

            // Find representative servers from 2010 and 2024
            const server2010 = data.find(d => d.year === 2010);
            const server2024 = data.find(d => d.year === 2024);

            const propData = [];
            if (server2010) {
                [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach(level => {
                    propData.push({ load: level, efficiency2010: server2010.loads[level], efficiency2024: null });
                });
            }
            if (server2024) {
                [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach((level, i) => {
                    if (!propData[i]) propData[i] = { load: level };
                    propData[i].efficiency2024 = server2024.loads[level];
                });
            }

            if (propData.length > 0) {
                const xScale3 = d3.scaleLinear()
                    .domain([10, 100])
                    .range([0, width]);

                const yScale3 = d3.scaleLinear()
                    .domain([0, d3.max(propData, d => Math.max(d.efficiency2010 || 0, d.efficiency2024 || 0))])
                    .range([height, 0]);

                const line3 = d3.line()
                    .x(d => xScale3(d.load))
                    .y(d => yScale3(d.efficiency2010));

                const line3b = d3.line()
                    .x(d => xScale3(d.load))
                    .y(d => yScale3(d.efficiency2024));

                if (server2010) {
                    g3.append('path')
                        .datum(propData.filter(d => d.efficiency2010))
                        .attr('d', line3)
                        .style('stroke', '#ff7f0e')
                        .style('stroke-width', 3.5)
                        .style('fill', 'none')
                        .style('stroke-dasharray', '5,5');
                }

                if (server2024) {
                    g3.append('path')
                        .datum(propData.filter(d => d.efficiency2024))
                        .attr('d', line3b)
                        .style('stroke', '#2ca02c')
                        .style('stroke-width', 3.5)
                        .style('fill', 'none');
                }

                g3.append('g')
                    .attr('transform', `translate(0,${height})`)
                    .call(d3.axisBottom(xScale3).tickFormat(d => d + '%'))
                    .style('font-size', '12px')
                    .append('text')
                    .attr('x', width / 2)
                    .attr('y', 55)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '14px')
                    .style('fill', 'black')
                    .text('Workload Level (%)');

                g3.append('g')
                    .call(d3.axisLeft(yScale3))
                    .style('font-size', '12px')
                    .append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -height / 2)
                    .attr('y', -70)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '14px')
                    .style('fill', 'black')
                    .text('Performance/Power (ops/W)');

                // Legend
                const legend3 = svg3.append('g')
                    .attr('transform', `translate(${margin.left + width - 180}, ${margin.top + 50})`);

                legend3.append('line')
                    .attr('x1', 0).attr('x2', 20)
                    .attr('y1', 0).attr('y2', 0)
                    .style('stroke', '#ff7f0e')
                    .style('stroke-width', 3.5)
                    .style('stroke-dasharray', '5,5');

                legend3.append('text')
                    .attr('x', 30)
                    .attr('y', 5)
                    .style('font-size', '13px')
                    .text('2010 Server');

                legend3.append('line')
                    .attr('x1', 0).attr('x2', 20)
                    .attr('y1', 25).attr('y2', 25)
                    .style('stroke', '#2ca02c')
                    .style('stroke-width', 3.5);

                legend3.append('text')
                    .attr('x', 30)
                    .attr('y', 30)
                    .style('font-size', '13px')
                    .text('2024 Server');
            }

            // ========== VIZ 3: DENSITY VS WASTE ==========
            const svg4 = svgWrapper.append('svg')
                .attr('width', containerWidth)
                .attr('height', svgHeight)
                .attr('viewBox', [0, 0, containerWidth, svgHeight])
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .style('background', '#f8f9fa')
                .style('border', '1px solid #ddd')
                .style('border-radius', '4px')
                .style('display', 'none')
                .style('overflow', 'hidden')
                .style('margin', '0 auto');

            vizs.push(svg4.node());

            const g4 = svg4.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            svg4.append('text')
                .attr('x', containerWidth / 2)
                .attr('y', 35)
                .attr('text-anchor', 'middle')
                .style('font-size', '18px')
                .style('font-weight', 'bold')
                .text('3. Density vs Waste: Cores vs Idle Power (colored by Performance)');

            const xScale4 = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.cores)])
                .range([0, width]);

            const yScale4 = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.idle)])
                .range([height, 0]);

            const colorScale = d3.scaleLinear()
                .domain([d3.min(data, d => d.result), d3.max(data, d => d.result)])
                .range(['#d62728', '#2ca02c'])
                .interpolate(d3.interpolateRgb);

            const sizeScale = d3.scaleSqrt()
                .domain([0, d3.max(data, d => d.result)])
                .range([3, 15]);

            g4.selectAll('.density-bubble')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'density-bubble')
                .attr('cx', d => xScale4(d.cores))
                .attr('cy', d => yScale4(d.idle))
                .attr('r', d => sizeScale(d.result))
                .attr('fill', d => colorScale(d.result))
                .attr('opacity', 0.6)
                .attr('stroke', '#333')
                .attr('stroke-width', 1)
                .style('cursor', 'pointer')
                .on('mouseover', function(event, d) {
                    d3.select(this).transition().duration(100).attr('opacity', 1).attr('stroke-width', 2.5);
                    const tooltip = d3.select('body').append('div')
                        .style('position', 'absolute')
                        .style('padding', '8px')
                        .style('background', 'rgba(0,0,0,0.9)')
                        .style('color', 'white')
                        .style('border-radius', '4px')
                        .style('font-size', '11px')
                        .style('z-index', '1000')
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 10) + 'px')
                        .html(`Cores: ${d.cores}<br/>Idle: ${d.idle.toFixed(1)}W<br/>Performance: ${d.result.toFixed(0)}<br/>Year: ${d.year}`);
                    setTimeout(() => tooltip.remove(), 2000);
                })
                .on('mouseout', function() {
                    d3.select(this).transition().duration(100).attr('opacity', 0.6).attr('stroke-width', 1);
                });

            g4.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(xScale4))
                .style('font-size', '12px')
                .append('text')
                .attr('x', width / 2)
                .attr('y', 55)
                .attr('text-anchor', 'middle')
                .style('font-size', '14px')
                .style('fill', 'black')
                .text('Number of Cores');

            g4.append('g')
                .call(d3.axisLeft(yScale4))
                .style('font-size', '12px')
                .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -height / 2)
                .attr('y', -70)
                .attr('text-anchor', 'middle')
                .style('font-size', '14px')
                .style('fill', 'black')
                .text('Idle Power (Watts)');

            // Color legend
            const colorLegend = svg4.append('g')
                .attr('transform', `translate(${margin.left + width - 100}, ${margin.top + 40})`);

            colorLegend.append('text')
                .style('font-size', '13px')
                .style('font-weight', 'bold')
                .text('Performance');

            // Low performance (red)
            colorLegend.append('rect')
                .attr('x', 0)
                .attr('y', 20)
                .attr('width', 18)
                .attr('height', 18)
                .attr('fill', '#d62728');

            colorLegend.append('text')
                .attr('x', 25)
                .attr('y', 33)
                .style('font-size', '11px')
                .text('Low');

            // High performance (green)
            colorLegend.append('rect')
                .attr('x', 0)
                .attr('y', 50)
                .attr('width', 18)
                .attr('height', 18)
                .attr('fill', '#2ca02c');

            colorLegend.append('text')
                .attr('x', 25)
                .attr('y', 63)
                .style('font-size', '11px')
                .text('High');

            // Initialize visualizations
            updateDots();
            updateDisplay();

            console.log('✓ VISUALIZATIONS COMPLETE');
        })
        .catch(err => {
            console.error('Error:', err);
        });
})();
