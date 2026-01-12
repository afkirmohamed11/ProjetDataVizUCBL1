// ============================================================
// PORTUGAL DATA CENTER VISUALIZATIONS
// Real-time monitoring data from Portugal Data Center (Aug-Dec 2021)
// ============================================================

(function() {
    'use strict';

    const margin = { top: 40, right: 30, bottom: 60, left: 70 };
    const transitionDuration = 750;

    const colors = {
        power: '#e74c3c',
        cpu: '#3498db',
        gpu: '#9b59b6',
        temp: '#f39c12',
        energy: '#2ecc71',
        secondary: '#95a5a6'
    };

    document.addEventListener('DOMContentLoaded', function() {
        loadPortugalData();
    });

    async function loadPortugalData() {
        try {
            const [dailyData, hourlyData, heatmapData, weekdayData] = await Promise.all([
                d3.csv('data/portugal/portugal_daily_summary.csv'),
                d3.csv('data/portugal/portugal_hourly_profile.csv'),
                d3.csv('data/portugal/portugal_heatmap.csv'),
                d3.csv('data/portugal/portugal_weekday_analysis.csv')
            ]);

            renderDailyPowerChart(dailyData);
            renderHourlyProfileChart(hourlyData);
            renderHeatmapChart(heatmapData);
            renderWeekdayChart(weekdayData);
        } catch (error) {
            console.error('Error loading Portugal data:', error);
        }
    }

    // ============================================================
    // Daily Power Consumption Over Time
    // ============================================================
    function renderDailyPowerChart(data) {
        const container = document.getElementById('portugal-daily-chart');
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

        // Parse data
        const parseDate = d3.timeParse('%Y-%m-%d');
        data.forEach(d => {
            d.date = parseDate(d.date);
            d.avg_power = +d.avg_power;
            d.energy_consumed = +d.energy_consumed;
        });

        // Filter out invalid dates
        data = data.filter(d => d.date);

        // X Scale
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, width]);

        // Y Scale
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.avg_power) * 1.1])
            .range([height, 0]);

        // Grid
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.3)
            .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(''));

        // Area gradient
        const gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', 'powerGradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
        gradient.append('stop').attr('offset', '0%').attr('stop-color', colors.power).attr('stop-opacity', 0.4);
        gradient.append('stop').attr('offset', '100%').attr('stop-color', colors.power).attr('stop-opacity', 0.05);

        // Area
        const area = d3.area()
            .x(d => x(d.date))
            .y0(height)
            .y1(d => y(d.avg_power))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(data)
            .attr('fill', 'url(#powerGradient)')
            .attr('d', area);

        // Line
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.avg_power))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', colors.power)
            .attr('stroke-width', 2.5)
            .attr('d', line);

        // Dots
        svg.selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.avg_power))
            .attr('r', 4)
            .attr('fill', colors.power)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                d3.select(this).attr('r', 7);
                showTooltip(event, `<strong>${d3.timeFormat('%b %d, %Y')(d.date)}</strong><br/>Avg Power: ${d.avg_power.toFixed(1)} W<br/>Energy: ${d.energy_consumed.toFixed(2)} kWh`);
            })
            .on('mouseout', function() {
                d3.select(this).attr('r', 4);
                hideTooltip();
            });

        // X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%b %d')))
            .selectAll('text')
            .style('font-size', '11px')
            .attr('transform', 'rotate(-30)')
            .style('text-anchor', 'end');

        // Y Axis
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + ' W'))
            .selectAll('text')
            .style('font-size', '12px');

        // Y Label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -55)
            .attr('x', -height / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '13px')
            .style('font-weight', 'bold')
            .text('Average Power (W)');
    }

    // ============================================================
    // Hourly Load Profile
    // ============================================================
    function renderHourlyProfileChart(data) {
        const container = document.getElementById('portugal-hourly-chart');
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

        // Parse data
        data.forEach(d => {
            d.hour = +d.hour;
            d.avg_power = +d.avg_power;
            d.avg_cpu_usage = +d.avg_cpu_usage;
            d.avg_temp = +d.avg_temp;
        });

        // X Scale
        const x = d3.scaleBand()
            .domain(data.map(d => d.hour))
            .range([0, width])
            .padding(0.2);

        // Y Scale
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.avg_power) * 1.1])
            .range([height, 0]);

        // Grid
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.3)
            .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(''));

        // Bars
        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.hour))
            .attr('width', x.bandwidth())
            .attr('y', height)
            .attr('height', 0)
            .attr('fill', d => {
                // Color based on hour (day vs night)
                if (d.hour >= 9 && d.hour <= 18) return colors.power;
                return colors.secondary;
            })
            .attr('rx', 3)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                d3.select(this).attr('opacity', 0.7);
                showTooltip(event, `<strong>Hour: ${d.hour}:00</strong><br/>Avg Power: ${d.avg_power.toFixed(1)} W<br/>CPU Usage: ${d.avg_cpu_usage.toFixed(1)}%<br/>Temp: ${d.avg_temp.toFixed(1)}°C`);
            })
            .on('mouseout', function() {
                d3.select(this).attr('opacity', 1);
                hideTooltip();
            })
            .transition()
            .duration(transitionDuration)
            .delay((d, i) => i * 30)
            .attr('y', d => y(d.avg_power))
            .attr('height', d => height - y(d.avg_power));

        // X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d => d + 'h'))
            .selectAll('text')
            .style('font-size', '10px');

        // Y Axis
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + ' W'))
            .selectAll('text')
            .style('font-size', '12px');

        // Legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 150}, -25)`);
        
        legend.append('rect').attr('width', 12).attr('height', 12).attr('fill', colors.power).attr('rx', 2);
        legend.append('text').attr('x', 18).attr('y', 10).text('Business Hours').style('font-size', '11px');
        
        legend.append('rect').attr('x', 100).attr('width', 12).attr('height', 12).attr('fill', colors.secondary).attr('rx', 2);
        legend.append('text').attr('x', 118).attr('y', 10).text('Off-Hours').style('font-size', '11px');
    }

    // ============================================================
    // Heatmap: Power by Hour and Weekday
    // ============================================================
    function renderHeatmapChart(data) {
        const container = document.getElementById('portugal-heatmap-chart');
        if (!container) return;
        container.innerHTML = '';

        const rect = container.getBoundingClientRect();
        const width = rect.width - margin.left - margin.right;
        const height = 280 - margin.top - margin.bottom;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Parse data
        data.forEach(d => {
            d.weekday = +d.weekday;
            d.hour = +d.hour;
            d.avg_power = +d.avg_power;
        });

        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const hours = d3.range(0, 24);

        // X Scale (hours)
        const x = d3.scaleBand()
            .domain(hours)
            .range([0, width])
            .padding(0.05);

        // Y Scale (weekdays)
        const y = d3.scaleBand()
            .domain(d3.range(0, 7))
            .range([0, height])
            .padding(0.05);

        // Color Scale
        const colorScale = d3.scaleSequential()
            .domain([d3.min(data, d => d.avg_power), d3.max(data, d => d.avg_power)])
            .interpolator(d3.interpolateYlOrRd);

        // Draw cells
        svg.selectAll('.cell')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('x', d => x(d.hour))
            .attr('y', d => y(d.weekday))
            .attr('width', x.bandwidth())
            .attr('height', y.bandwidth())
            .attr('fill', d => colorScale(d.avg_power))
            .attr('rx', 2)
            .style('cursor', 'pointer')
            .style('opacity', 0)
            .on('mouseover', function(event, d) {
                d3.select(this).style('stroke', '#333').style('stroke-width', 2);
                showTooltip(event, `<strong>${weekdays[d.weekday]} @ ${d.hour}:00</strong><br/>Avg Power: ${d.avg_power.toFixed(1)} W`);
            })
            .on('mouseout', function() {
                d3.select(this).style('stroke', 'none');
                hideTooltip();
            })
            .transition()
            .duration(transitionDuration)
            .delay((d, i) => i * 5)
            .style('opacity', 1);

        // X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d => d + 'h'))
            .selectAll('text')
            .style('font-size', '9px');

        // Y Axis
        svg.append('g')
            .call(d3.axisLeft(y).tickFormat(d => weekdays[d]))
            .selectAll('text')
            .style('font-size', '11px');

        // Color Legend
        const legendWidth = 200;
        const legendHeight = 12;
        const legendX = width - legendWidth;

        const legendScale = d3.scaleLinear()
            .domain(colorScale.domain())
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5)
            .tickFormat(d => d.toFixed(0) + 'W');

        const legend = svg.append('g')
            .attr('transform', `translate(${legendX}, -30)`);

        const legendGradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', 'heatmapGradient');

        legendGradient.selectAll('stop')
            .data(d3.range(0, 1.1, 0.1))
            .enter()
            .append('stop')
            .attr('offset', d => d * 100 + '%')
            .attr('stop-color', d => colorScale(legendScale.invert(d * legendWidth)));

        legend.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#heatmapGradient)');

        legend.append('g')
            .attr('transform', `translate(0,${legendHeight})`)
            .call(legendAxis)
            .selectAll('text')
            .style('font-size', '9px');
    }

    // ============================================================
    // Weekday Comparison Chart
    // ============================================================
    function renderWeekdayChart(data) {
        const container = document.getElementById('portugal-weekday-chart');
        if (!container) return;
        container.innerHTML = '';

        const rect = container.getBoundingClientRect();
        const width = rect.width - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        // Parse data
        data.forEach(d => {
            d.weekday = +d.weekday;
            d.avg_power = +d.avg_power;
            d.avg_cpu_usage = +d.avg_cpu_usage;
            d.avg_cpu_power = +d.avg_cpu_power;
        });

        // X Scale
        const x = d3.scaleBand()
            .domain(d3.range(0, 7))
            .range([0, width])
            .padding(0.3);

        // Y Scale
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.avg_power) * 1.15])
            .range([height, 0]);

        // Grid
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.3)
            .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(''));

        // Bars
        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.weekday))
            .attr('width', x.bandwidth())
            .attr('y', height)
            .attr('height', 0)
            .attr('fill', d => d.weekday >= 5 ? colors.secondary : colors.cpu)
            .attr('rx', 4)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                d3.select(this).attr('opacity', 0.7);
                showTooltip(event, `<strong>${weekdays[d.weekday]}</strong><br/>Avg Power: ${d.avg_power.toFixed(1)} W<br/>CPU Usage: ${d.avg_cpu_usage.toFixed(1)}%`);
            })
            .on('mouseout', function() {
                d3.select(this).attr('opacity', 1);
                hideTooltip();
            })
            .transition()
            .duration(transitionDuration)
            .delay((d, i) => i * 100)
            .attr('y', d => y(d.avg_power))
            .attr('height', d => height - y(d.avg_power));

        // Value labels
        svg.selectAll('.label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.weekday) + x.bandwidth() / 2)
            .attr('y', d => y(d.avg_power) - 8)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', d => d.weekday >= 5 ? colors.secondary : colors.cpu)
            .style('opacity', 0)
            .text(d => d.avg_power.toFixed(0) + 'W')
            .transition()
            .duration(transitionDuration)
            .delay((d, i) => i * 100 + 400)
            .style('opacity', 1);

        // X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d => weekdays[d]))
            .selectAll('text')
            .style('font-size', '12px')
            .style('font-weight', 'bold');

        // Y Axis
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + ' W'))
            .selectAll('text')
            .style('font-size', '12px');

        // Legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 150}, -25)`);
        
        legend.append('rect').attr('width', 12).attr('height', 12).attr('fill', colors.cpu).attr('rx', 2);
        legend.append('text').attr('x', 18).attr('y', 10).text('Weekday').style('font-size', '11px');
        
        legend.append('rect').attr('x', 80).attr('width', 12).attr('height', 12).attr('fill', colors.secondary).attr('rx', 2);
        legend.append('text').attr('x', 98).attr('y', 10).text('Weekend').style('font-size', '11px');
    }

    // ============================================================
    // Tooltip Functions
    // ============================================================
    function showTooltip(event, content) {
        let tooltip = d3.select('#portugal-tooltip');
        if (tooltip.empty()) {
            tooltip = d3.select('body').append('div')
                .attr('id', 'portugal-tooltip')
                .style('position', 'absolute')
                .style('background', 'rgba(0,0,0,0.85)')
                .style('color', 'white')
                .style('padding', '10px 14px')
                .style('border-radius', '6px')
                .style('font-size', '13px')
                .style('pointer-events', 'none')
                .style('z-index', '1000')
                .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)');
        }

        tooltip
            .html(content)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .style('opacity', 1);
    }

    function hideTooltip() {
        d3.select('#portugal-tooltip').style('opacity', 0);
    }

})();
