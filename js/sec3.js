/**
 * Section 3: PUE Timeline & World Map
 * Global Data Center Efficiency Visualization
 * Displays PUE historical trends and cloud provider datacenter locations
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof d3 === 'undefined') return;
        if (!document.getElementById('viz-pue-timeline')) return;
        initSection3Map();
    });

    // Global data for map filters
    var mapGlobalData = null;

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
            console.error('Error loading Section 3 data:', error);
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

})();
