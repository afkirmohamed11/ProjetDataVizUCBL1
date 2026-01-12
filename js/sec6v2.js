        // CONFIG
        const months = ["JANVIER", "FEVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOUT", "SEPTEMBRE", "OCTOBRE"];
        const monthsShort = ["JAN", "FEV", "MAR", "AVR", "MAI", "JUN", "JUL", "AOU", "SEP", "OCT"];
        const color = d3.scaleOrdinal(d3.schemeTableau10);
        const tooltip = d3.select("#tooltip");
        const margin = {top: 25, right: 40, bottom: 45, left: 60};

        // Color palettes
        const colors = {
            primary: "#2563eb",
            secondary: "#f59e0b", 
            success: "#10b981",
            danger: "#ef4444",
            purple: "#8b5cf6",
            pink: "#ec4899",
            cyan: "#06b6d4",
            orange: "#f97316"
        };

        // Global filter state
        let filterState = {
            monthStart: 0,
            monthEnd: 9,
            topN: 10,
            heatmapMin: 0,
            categories: new Set()
        };

        // Store raw data for filtering
        let rawData = {
            facilityTrend: null,
            categoryTrends: null,
            efficiency: null,
            redundancy: null,
            nexus: null,
            topConsumers: null,
            heatmap: null
        };

        // Category colors for chips
        const categoryColors = {
            "IT": colors.primary,
            "Cooling": colors.cyan,
            "Lighting": colors.secondary,
            "Infrastructure": colors.purple,
            "Other": colors.success
        };

        // Filter functions
        function getFilteredMonths() {
            return months.slice(filterState.monthStart, filterState.monthEnd + 1);
        }

        function getFilteredMonthsShort() {
            return monthsShort.slice(filterState.monthStart, filterState.monthEnd + 1);
        }

        function applyFilters() {
            // Update filter state from UI
            filterState.monthStart = parseInt(document.getElementById('monthStart').value);
            filterState.monthEnd = parseInt(document.getElementById('monthEnd').value);
            filterState.topN = parseInt(document.getElementById('topN').value);
            filterState.heatmapMin = parseFloat(document.getElementById('heatmapMin').value) || 0;

            // Ensure monthStart <= monthEnd
            if (filterState.monthStart > filterState.monthEnd) {
                filterState.monthEnd = filterState.monthStart;
                document.getElementById('monthEnd').value = filterState.monthEnd;
            }

            // Update active filters display
            updateActiveFiltersDisplay();

            // Redraw all charts with new filters
            if (rawData.facilityTrend) drawChart1(rawData.facilityTrend);
            if (rawData.categoryTrends) drawChart2(rawData.categoryTrends);
            if (rawData.efficiency) drawChart3(rawData.efficiency);
            if (rawData.redundancy) drawChart4(rawData.redundancy);
            if (rawData.nexus) drawChart5(rawData.nexus);
            if (rawData.topConsumers) drawChart6(rawData.topConsumers);
            if (rawData.heatmap) drawChart7(rawData.heatmap);
        }

        function resetFilters() {
            filterState.monthStart = 0;
            filterState.monthEnd = 9;
            filterState.topN = 10;
            filterState.heatmapMin = 0;
            filterState.categories = new Set();

            // Reset UI elements
            document.getElementById('monthStart').value = 0;
            document.getElementById('monthEnd').value = 9;
            document.getElementById('topN').value = 10;
            document.getElementById('heatmapMin').value = 0;

            // Reset category chips
            document.querySelectorAll('.filter-chip').forEach(chip => {
                chip.classList.remove('active');
            });

            updateActiveFiltersDisplay();
            applyFilters();
        }

        function toggleCategory(category, element) {
            if (filterState.categories.has(category)) {
                filterState.categories.delete(category);
                element.classList.remove('active');
            } else {
                filterState.categories.add(category);
                element.classList.add('active');
            }
            applyFilters();
        }

        function updateActiveFiltersDisplay() {
            const container = document.getElementById('activeFilters');
            const tagsContainer = document.getElementById('activeFilterTags');
            const activeTags = [];

            if (filterState.monthStart !== 0 || filterState.monthEnd !== 9) {
                activeTags.push(`<span class="active-filter-tag">${monthsShort[filterState.monthStart]} - ${monthsShort[filterState.monthEnd]} <span class="remove" onclick="document.getElementById('monthStart').value=0;document.getElementById('monthEnd').value=9;applyFilters();">×</span></span>`);
            }
            if (filterState.topN !== 10) {
                activeTags.push(`<span class="active-filter-tag">Top ${filterState.topN} <span class="remove" onclick="document.getElementById('topN').value=10;applyFilters();">×</span></span>`);
            }
            if (filterState.heatmapMin > 0) {
                activeTags.push(`<span class="active-filter-tag">Min ${filterState.heatmapMin} kWh <span class="remove" onclick="document.getElementById('heatmapMin').value=0;applyFilters();">×</span></span>`);
            }
            filterState.categories.forEach(cat => {
                activeTags.push(`<span class="active-filter-tag">${cat} <span class="remove" onclick="toggleCategoryByName('${cat}')">×</span></span>`);
            });

            if (activeTags.length > 0) {
                container.style.display = 'flex';
                tagsContainer.innerHTML = activeTags.join('');
            } else {
                container.style.display = 'none';
            }
        }

        function toggleCategoryByName(name) {
            const chip = document.querySelector(`.filter-chip[data-category="${name}"]`);
            if (chip) toggleCategory(name, chip);
        }

        function initializeCategoryFilters(categories) {
            const container = document.getElementById('categoryFilters');
            container.innerHTML = '';
            categories.forEach(cat => {
                const chip = document.createElement('div');
                chip.className = 'filter-chip';
                chip.setAttribute('data-category', cat);
                chip.innerHTML = `<span class="chip-dot" style="background:${categoryColors[cat] || colors.success}"></span>${cat}`;
                chip.onclick = function() { toggleCategory(cat, this); };
                container.appendChild(chip);
            });
        }

        // --- CHART 1: TOTAL TREND (insight_6_facility_total_trend.csv) ---
        function drawChart1(data) {
            const filteredData = data.filter((d, i) => i >= filterState.monthStart && i <= filterState.monthEnd);
            
            const id = "#c1";
            d3.select(id).selectAll("*").remove();
            const {w, h} = getDims(id);
            const svg = d3.select(id).append("svg").attr("viewBox", `0 0 ${w+margin.left+margin.right} ${h+margin.top+margin.bottom}`)
                          .append("g").attr("transform", `translate(${margin.left},${margin.top})`);
            
            const x = d3.scalePoint().domain(filteredData.map(d => d.Month)).range([0, w]).padding(0.5);
            const y = d3.scaleLinear().domain([0, d3.max(filteredData, d => +d.Total_Consumption_kWh) * 1.1]).nice().range([h, 0]);
            
            // Grid lines
            svg.append("g").attr("class", "grid").selectAll("line").data(y.ticks(5)).enter()
               .append("line").attr("x1", 0).attr("x2", w).attr("y1", d => y(d)).attr("y2", d => y(d))
               .attr("class", "grid-line");
            
            // Gradient
            const gradient = svg.append("defs").append("linearGradient").attr("id", "areaGrad1").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
            gradient.append("stop").attr("offset", "0%").attr("stop-color", colors.primary).attr("stop-opacity", 0.4);
            gradient.append("stop").attr("offset", "100%").attr("stop-color", colors.primary).attr("stop-opacity", 0.05);
            
            // Area
            svg.append("path").datum(filteredData).attr("fill", "url(#areaGrad1)")
               .attr("d", d3.area().x(d => x(d.Month)).y0(h).y1(h).curve(d3.curveMonotoneX))
               .transition().duration(1000).ease(d3.easeCubicOut)
               .attr("d", d3.area().x(d => x(d.Month)).y0(h).y1(d => y(+d.Total_Consumption_kWh)).curve(d3.curveMonotoneX));
            
            // Line with animation
            const line1 = svg.append("path").datum(filteredData).attr("fill", "none").attr("stroke", colors.primary).attr("stroke-width", 3)
               .attr("d", d3.line().x(d => x(d.Month)).y(d => y(+d.Total_Consumption_kWh)).curve(d3.curveMonotoneX));
            const totalLength1 = line1.node().getTotalLength();
            line1.attr("stroke-dasharray", totalLength1).attr("stroke-dashoffset", totalLength1)
                 .transition().duration(1500).ease(d3.easeCubicOut).attr("stroke-dashoffset", 0);
            
            // Data points with staggered animation
            svg.selectAll(".dot").data(filteredData).enter().append("circle")
               .attr("class", "data-point").attr("cx", d => x(d.Month)).attr("cy", d => y(+d.Total_Consumption_kWh))
               .attr("r", 0).attr("fill", colors.primary).attr("stroke", "white").attr("stroke-width", 2)
               .on("mouseover", (e, d) => showTooltip(e, `<div class="tooltip-title">${d.Month}</div><div class="tooltip-value">${Math.round(+d.Total_Consumption_kWh).toLocaleString()} kWh</div><div class="tooltip-label">Total Facility Consumption</div>`))
               .on("mousemove", moveTooltip).on("mouseout", hideTooltip)
               .transition().delay((d, i) => 1000 + i * 80).duration(300).ease(d3.easeBackOut)
               .attr("r", 4);
            
            // Axes
            const filteredMonthsShort = getFilteredMonthsShort();
            svg.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).tickFormat((d,i) => filteredMonthsShort[i]));
            svg.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5).tickFormat(d => d >= 1000 ? (d/1000)+"k" : d));
            
            // Y-axis label
            svg.append("text").attr("class", "axis-label").attr("transform", "rotate(-90)").attr("y", -45).attr("x", -h/2).attr("text-anchor", "middle").text("Energy (kWh)");
            
            // Legend
            d3.select("#l1").html(`<div class="legend-item"><div class="line-dot" style="background:${colors.primary}"></div>Total Consumption</div>`);
        }
        
        d3.csv("../data/ucbl1/insight_6_facility_total_trend.csv").then(data => {
            rawData.facilityTrend = data;
            drawChart1(data);
        });

        // --- CHART 2: ENERGY SHARE (Derived from insight_2_category_trends.csv) ---
        function drawChart2(data) {
            const filteredMonths = getFilteredMonths();
            
            // Transform column-based data to totals (only for filtered months)
            let processed = data.map(d => {
                let total = 0;
                filteredMonths.forEach(m => total += (+d[m] || 0));
                return { Group: d.Functional_Group, Total: total };
            });
            
            // Filter by selected categories if any
            if (filterState.categories.size > 0) {
                processed = processed.filter(d => filterState.categories.has(d.Group));
            }
            
            const totalAll = d3.sum(processed, d => d.Total);

            const id = "#c2";
            d3.select(id).selectAll("*").remove();
            d3.select("#l2").html("");
            const container = d3.select(id).node().getBoundingClientRect();
            const w = container.width, h = container.height;
            const radius = Math.min(w, h) / 2 - 30;

            const svg = d3.select(id).append("svg").attr("viewBox", `0 0 ${w} ${h}`)
                          .append("g").attr("transform", `translate(${w/2},${h/2})`);
            
            const chartCategoryColors = d3.scaleOrdinal()
                .domain(processed.map(d => d.Group))
                .range([colors.primary, colors.secondary, colors.success, colors.danger, colors.purple, colors.pink, colors.cyan, colors.orange]);
            
            const pie = d3.pie().value(d => d.Total).sort(null);
            const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);
            const arcHover = d3.arc().innerRadius(radius * 0.55).outerRadius(radius + 8);
            const arcZero = d3.arc().innerRadius(radius * 0.55).outerRadius(radius * 0.55);

            svg.selectAll("path").data(pie(processed)).enter().append("path")
               .attr("d", arcZero).attr("fill", d => chartCategoryColors(d.data.Group)).attr("stroke", "white").attr("stroke-width", 2)
               .style("cursor", "pointer")
               .on("mouseover", function(e, d) {
                   d3.select(this).transition().duration(200).attr("d", arcHover);
                   const pct = ((d.data.Total / totalAll) * 100).toFixed(1);
                   showTooltip(e, `<div class="tooltip-title">${d.data.Group}</div><div class="tooltip-value">${Math.round(d.data.Total).toLocaleString()} kWh</div><div class="tooltip-label">${pct}% of total consumption</div>`);
               })
               .on("mousemove", moveTooltip)
               .on("mouseout", function() {
                   d3.select(this).transition().duration(200).attr("d", arc);
                   hideTooltip();
               })
               .transition().duration(800).delay((d, i) => i * 100).ease(d3.easeBackOut)
               .attrTween("d", function(d) {
                   const interpolate = d3.interpolate({startAngle: d.startAngle, endAngle: d.startAngle}, d);
                   return t => arc(interpolate(t));
               });
            
            // Center text with animation
            svg.append("text").attr("text-anchor", "middle").attr("dy", "-0.2em").attr("font-size", "12px").attr("fill", "#6b7280").attr("opacity", 0).text("Total")
               .transition().delay(800).duration(500).attr("opacity", 1);
            svg.append("text").attr("text-anchor", "middle").attr("dy", "1em").attr("font-size", "16px").attr("font-weight", "700").attr("fill", "#111827").attr("opacity", 0).text((totalAll/1000).toFixed(0) + "k kWh")
               .transition().delay(900).duration(500).attr("opacity", 1);
            
            const leg = d3.select("#l2");
            processed.forEach((d, i) => {
                const pct = ((d.Total / totalAll) * 100).toFixed(1);
                leg.append("div").attr("class", "legend-item").html(`<div class="dot" style="background:${chartCategoryColors(d.Group)}"></div>${d.Group} (${pct}%)`);
            });
        }
        
        d3.csv("../data/ucbl1/insight_2_category_trends.csv").then(data => {
            rawData.categoryTrends = data;
            // Initialize category filters from data
            const categories = data.map(d => d.Functional_Group);
            initializeCategoryFilters(categories);
            drawChart2(data);
        });

        // --- CHART 3: EFFICIENCY (insight_3_efficiency_ratio.csv) ---
        function drawChart3(data) {
            const filteredData = data.filter((d, i) => i >= filterState.monthStart && i <= filterState.monthEnd);
            
            const id = "#c3";
            d3.select(id).selectAll("*").remove();
            const {w, h} = getDims(id);
            const svg = d3.select(id).append("svg").attr("viewBox", `0 0 ${w+margin.left+margin.right} ${h+margin.top+margin.bottom}`)
                          .append("g").attr("transform", `translate(${margin.left},${margin.top})`);
            
            const x = d3.scalePoint().domain(filteredData.map(d => d.Month)).range([0, w]).padding(0.5);
            const maxY = d3.max(filteredData, d => Math.max(+d.IT_Load_kWh || 0, +d.Cooling_Load_kWh || 0)) * 1.1;
            const y = d3.scaleLinear().domain([0, maxY]).nice().range([h, 0]);

            // Grid lines
            svg.append("g").attr("class", "grid").selectAll("line").data(y.ticks(5)).enter()
               .append("line").attr("x1", 0).attr("x2", w).attr("y1", d => y(d)).attr("y2", d => y(d)).attr("class", "grid-line");

            // IT Load line with animation
            const lineIT = svg.append("path").datum(filteredData).attr("fill", "none").attr("stroke", colors.primary).attr("stroke-width", 3)
               .attr("d", d3.line().x(d => x(d.Month)).y(d => y(+d.IT_Load_kWh || 0)).curve(d3.curveMonotoneX));
            const lenIT = lineIT.node().getTotalLength();
            lineIT.attr("stroke-dasharray", lenIT).attr("stroke-dashoffset", lenIT)
                  .transition().duration(1200).ease(d3.easeCubicOut).attr("stroke-dashoffset", 0);
            
            // Cooling Load line with animation
            const lineCool = svg.append("path").datum(filteredData).attr("fill", "none").attr("stroke", colors.secondary).attr("stroke-width", 3)
               .attr("d", d3.line().x(d => x(d.Month)).y(d => y(+d.Cooling_Load_kWh || 0)).curve(d3.curveMonotoneX));
            const lenCool = lineCool.node().getTotalLength();
            lineCool.attr("stroke-dasharray", lenCool).attr("stroke-dashoffset", lenCool)
                    .transition().delay(300).duration(1200).ease(d3.easeCubicOut).attr("stroke-dashoffset", 0);
            
            // IT Load points with staggered animation
            svg.selectAll(".dot-it").data(filteredData).enter().append("circle")
               .attr("class", "data-point").attr("cx", d => x(d.Month)).attr("cy", d => y(+d.IT_Load_kWh || 0))
               .attr("r", 0).attr("fill", colors.primary).attr("stroke", "white").attr("stroke-width", 2)
               .on("mouseover", (e, d) => showTooltip(e, `<div class="tooltip-title">${d.Month}</div><div class="tooltip-value">${Math.round(+d.IT_Load_kWh || 0).toLocaleString()} kWh</div><div class="tooltip-label">IT Infrastructure Load</div>`))
               .on("mousemove", moveTooltip).on("mouseout", hideTooltip)
               .transition().delay((d, i) => 800 + i * 60).duration(300).ease(d3.easeBackOut).attr("r", 4);
            
            // Cooling Load points with staggered animation
            svg.selectAll(".dot-cool").data(filteredData).enter().append("circle")
               .attr("class", "data-point").attr("cx", d => x(d.Month)).attr("cy", d => y(+d.Cooling_Load_kWh || 0))
               .attr("r", 0).attr("fill", colors.secondary).attr("stroke", "white").attr("stroke-width", 2)
               .on("mouseover", (e, d) => {
                   const ratio = (+d.IT_Load_kWh > 0) ? (+d.Cooling_Load_kWh / +d.IT_Load_kWh * 100).toFixed(1) : 0;
                   showTooltip(e, `<div class="tooltip-title">${d.Month}</div><div class="tooltip-value">${Math.round(+d.Cooling_Load_kWh || 0).toLocaleString()} kWh</div><div class="tooltip-label">Cooling Load (${ratio}% of IT)</div>`);
               })
               .on("mousemove", moveTooltip).on("mouseout", hideTooltip)
               .transition().delay((d, i) => 1100 + i * 60).duration(300).ease(d3.easeBackOut).attr("r", 4);

            // Axes
            const filteredMonthsShort = getFilteredMonthsShort();
            svg.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).tickFormat((d,i) => filteredMonthsShort[i]));
            svg.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5).tickFormat(d => d >= 1000 ? (d/1000)+"k" : d));
            svg.append("text").attr("class", "axis-label").attr("transform", "rotate(-90)").attr("y", -45).attr("x", -h/2).attr("text-anchor", "middle").text("Energy (kWh)");
            
            // Legend
            d3.select("#l3").html(`
                <div class="legend-item"><div class="line-dot" style="background:${colors.primary}"></div>IT Load</div>
                <div class="legend-item"><div class="line-dot" style="background:${colors.secondary}"></div>Cooling Load</div>
            `);
        }
        
        d3.csv("../data/ucbl1/insight_3_efficiency_ratio.csv").then(data => {
            rawData.efficiency = data;
            drawChart3(data);
        });

        // --- CHART 4: REDUNDANCY (insight_4_redundancy_balance.csv) ---
        function drawChart4(data) {
            const filteredMonths = getFilteredMonths();
            const filteredMonthsShort = getFilteredMonthsShort();
            
            const id = "#c4";
            d3.select(id).selectAll("*").remove();
            d3.select("#l4").html("");
            const {w, h} = getDims(id);
            const svg = d3.select(id).append("svg").attr("viewBox", `0 0 ${w+margin.left+margin.right} ${h+margin.top+margin.bottom}`)
                          .append("g").attr("transform", `translate(${margin.left},${margin.top})`);
            
            const x = d3.scalePoint().domain(filteredMonths).range([0, w]).padding(0.5);
            const maxVal = d3.max(data, d => d3.max(filteredMonths, m => +d[m] || 0));
            const y = d3.scaleLinear().domain([0, maxVal * 1.1]).nice().range([h, 0]);

            // Grid lines
            svg.append("g").attr("class", "grid").selectAll("line").data(y.ticks(5)).enter()
               .append("line").attr("x1", 0).attr("x2", w).attr("y1", d => y(d)).attr("y2", d => y(d)).attr("class", "grid-line");

            const redundancyColors = [colors.primary, colors.danger, colors.success, colors.purple];

            data.forEach((d, i) => {
                const lineData = filteredMonths.map(m => ({ m: m, v: +d[m] || 0 }));
                
                // Line with animation
                const linePath = svg.append("path").datum(lineData).attr("fill", "none").attr("stroke", redundancyColors[i % redundancyColors.length]).attr("stroke-width", 3)
                   .attr("d", d3.line().x(k => x(k.m)).y(k => y(k.v)).curve(d3.curveMonotoneX));
                const lineLen = linePath.node().getTotalLength();
                linePath.attr("stroke-dasharray", lineLen).attr("stroke-dashoffset", lineLen)
                        .transition().delay(i * 200).duration(1000).ease(d3.easeCubicOut).attr("stroke-dashoffset", 0);
                
                // Points with staggered animation
                svg.selectAll(`.dot-${i}`).data(lineData).enter().append("circle")
                   .attr("class", "data-point").attr("cx", k => x(k.m)).attr("cy", k => y(k.v))
                   .attr("r", 0).attr("fill", redundancyColors[i % redundancyColors.length]).attr("stroke", "white").attr("stroke-width", 2)
                   .on("mouseover", (e, k) => showTooltip(e, `<div class="tooltip-title">${d.Category}</div><div class="tooltip-value">${Math.round(k.v).toLocaleString()} kWh</div><div class="tooltip-label">${k.m}</div>`))
                   .on("mousemove", moveTooltip).on("mouseout", hideTooltip)
                   .transition().delay((k, j) => i * 200 + 600 + j * 50).duration(250).ease(d3.easeBackOut).attr("r", 4);
            });

            // Axes
            svg.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).tickFormat((d,i) => filteredMonthsShort[i]));
            svg.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5).tickFormat(d => d >= 1000 ? (d/1000)+"k" : d));
            svg.append("text").attr("class", "axis-label").attr("transform", "rotate(-90)").attr("y", -45).attr("x", -h/2).attr("text-anchor", "middle").text("Energy (kWh)");
            
            // Legend
            const leg = d3.select("#l4");
            data.forEach((d, i) => {
                leg.append("div").attr("class", "legend-item").html(`<div class="line-dot" style="background:${redundancyColors[i % redundancyColors.length]}"></div>${d.Category}`);
            });
        }
        
        d3.csv("../data/ucbl1/insight_4_redundancy_balance.csv").then(data => {
            rawData.redundancy = data;
            drawChart4(data);
        });

        // --- CHART 5: NEXUS (insight_5_water_energy_nexus.csv) ---
        function drawChart5(data) {
            const filteredData = data.filter((d, i) => i >= filterState.monthStart && i <= filterState.monthEnd);
            const filteredMonthsShort = getFilteredMonthsShort();
            
            const id = "#c5";
            d3.select(id).selectAll("*").remove();
            const {w, h} = getDims(id);
            const svg = d3.select(id).append("svg").attr("viewBox", `0 0 ${w+margin.left+margin.right+30} ${h+margin.top+margin.bottom}`)
                          .append("g").attr("transform", `translate(${margin.left},${margin.top})`);
            
            const x = d3.scalePoint().domain(filteredData.map(d => d.Month)).range([0, w]).padding(0.5);
            const y1 = d3.scaleLinear().domain([0, d3.max(filteredData, d => +d.Cooling_Elec_kWh || 0) * 1.1]).nice().range([h, 0]);
            const y2 = d3.scaleLinear().domain([0, d3.max(filteredData, d => +d.Water_Usage_m3 || 0) * 1.1]).nice().range([h, 0]);

            // Grid lines
            svg.append("g").attr("class", "grid").selectAll("line").data(y1.ticks(5)).enter()
               .append("line").attr("x1", 0).attr("x2", w).attr("y1", d => y1(d)).attr("y2", d => y1(d)).attr("class", "grid-line");

            // Cooling electricity bars with animation
            const barWidth = w / filteredData.length * 0.6;
            svg.selectAll(".bar").data(filteredData).enter().append("rect")
               .attr("x", d => x(d.Month) - barWidth/2).attr("y", h)
               .attr("width", barWidth).attr("height", 0)
               .attr("fill", colors.primary).attr("opacity", 0.7).attr("rx", 3)
               .on("mouseover", (e, d) => showTooltip(e, `<div class="tooltip-title">${d.Month}</div><div class="tooltip-value">${Math.round(+d.Cooling_Elec_kWh || 0).toLocaleString()} kWh</div><div class="tooltip-label">Cooling Electricity</div>`))
               .on("mousemove", moveTooltip).on("mouseout", hideTooltip)
               .transition().delay((d, i) => i * 80).duration(600).ease(d3.easeCubicOut)
               .attr("y", d => y1(+d.Cooling_Elec_kWh || 0))
               .attr("height", d => h - y1(+d.Cooling_Elec_kWh || 0));

            // Water usage line with animation
            const waterLine = svg.append("path").datum(filteredData).attr("fill", "none").attr("stroke", colors.cyan).attr("stroke-width", 3)
               .attr("d", d3.line().x(d => x(d.Month)).y(d => y2(+d.Water_Usage_m3 || 0)).curve(d3.curveMonotoneX));
            const waterLen = waterLine.node().getTotalLength();
            waterLine.attr("stroke-dasharray", waterLen).attr("stroke-dashoffset", waterLen)
                     .transition().delay(500).duration(1200).ease(d3.easeCubicOut).attr("stroke-dashoffset", 0);
            
            // Water usage points with staggered animation
            svg.selectAll(".dot-water").data(filteredData).enter().append("circle")
               .attr("class", "data-point").attr("cx", d => x(d.Month)).attr("cy", d => y2(+d.Water_Usage_m3 || 0))
               .attr("r", 0).attr("fill", colors.cyan).attr("stroke", "white").attr("stroke-width", 2)
               .on("mouseover", (e, d) => showTooltip(e, `<div class="tooltip-title">${d.Month}</div><div class="tooltip-value">${Math.round(+d.Water_Usage_m3 || 0).toLocaleString()} m³</div><div class="tooltip-label">Water Usage</div>`))
               .on("mousemove", moveTooltip).on("mouseout", hideTooltip)
               .transition().delay((d, i) => 1000 + i * 80).duration(300).ease(d3.easeBackOut).attr("r", 5);
            
            // Axes
            svg.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).tickFormat((d,i) => filteredMonthsShort[i]));
            svg.append("g").attr("class", "axis").call(d3.axisLeft(y1).ticks(5).tickFormat(d => d >= 1000 ? (d/1000)+"k" : d));
            svg.append("g").attr("class", "axis").attr("transform", `translate(${w},0)`).call(d3.axisRight(y2).ticks(5));
            
            // Axis labels
            svg.append("text").attr("class", "axis-label").attr("transform", "rotate(-90)").attr("y", -45).attr("x", -h/2).attr("text-anchor", "middle").attr("fill", colors.primary).text("Electricity (kWh)");
            svg.append("text").attr("class", "axis-label").attr("transform", "rotate(90)").attr("y", -w-30).attr("x", h/2).attr("text-anchor", "middle").attr("fill", colors.cyan).text("Water (m³)");
            
            // Legend
            d3.select("#l5").html(`
                <div class="legend-item"><div class="dot" style="background:${colors.primary}"></div>Cooling Electricity (kWh)</div>
                <div class="legend-item"><div class="line-dot" style="background:${colors.cyan}"></div>Water Usage (m³)</div>
            `);
        }
        
        d3.csv("../data/ucbl1/insight_5_water_energy_nexus.csv").then(data => {
            rawData.nexus = data;
            drawChart5(data);
        });

        // --- CHART 6: TOP N (insight_7_top_consumers.csv) ---
        function drawChart6(data) {
            // Apply topN filter
            const filteredData = data.slice(0, filterState.topN);
            
            const id = "#c6";
            d3.select(id).selectAll("*").remove();
            const {w, h} = getDims(id);
            const svg = d3.select(id).append("svg").attr("viewBox", `0 0 ${w+margin.left+margin.right+60} ${h+margin.top+margin.bottom}`)
                          .append("g").attr("transform", `translate(${margin.left+100},${margin.top})`);
            
            const maxVal = d3.max(filteredData, d => +d.Total_Period_kWh);
            const x = d3.scaleLinear().domain([0, maxVal]).range([0, w-100]);
            const y = d3.scaleBand().domain(filteredData.map(d => d.Meter)).range([0, h]).padding(0.25);

            // Color scale based on value
            const barColor = d3.scaleLinear().domain([0, maxVal]).range([colors.purple, colors.danger]);

            // Grid lines
            svg.append("g").attr("class", "grid").selectAll("line").data(x.ticks(5)).enter()
               .append("line").attr("x1", d => x(d)).attr("x2", d => x(d)).attr("y1", 0).attr("y2", h).attr("class", "grid-line");

            // Bars with animation
            svg.selectAll("rect").data(filteredData).enter().append("rect")
               .attr("y", d => y(d.Meter)).attr("height", y.bandwidth())
               .attr("width", 0).attr("fill", d => barColor(+d.Total_Period_kWh))
               .attr("rx", 4).style("cursor", "pointer")
               .on("mouseover", function(e, d) {
                   d3.select(this).transition().duration(150).attr("opacity", 0.8);
                   const pct = ((+d.Total_Period_kWh / d3.sum(filteredData, k => +k.Total_Period_kWh)) * 100).toFixed(1);
                   showTooltip(e, `<div class="tooltip-title">${d.Meter}</div><div class="tooltip-value">${Math.round(+d.Total_Period_kWh).toLocaleString()} kWh</div><div class="tooltip-label">Category: ${d.Category || 'N/A'}<br>${pct}% of top ${filterState.topN}</div>`);
               })
               .on("mousemove", moveTooltip)
               .on("mouseout", function() {
                   d3.select(this).transition().duration(150).attr("opacity", 1);
                   hideTooltip();
               })
               .transition().delay((d, i) => i * 80).duration(700).ease(d3.easeCubicOut)
               .attr("width", d => x(+d.Total_Period_kWh));

            // Value labels with animation
            svg.selectAll(".bar-label").data(filteredData).enter().append("text")
               .attr("x", 5).attr("y", d => y(d.Meter) + y.bandwidth()/2)
               .attr("dy", "0.35em").attr("font-size", "9px").attr("fill", "#6b7280").attr("opacity", 0)
               .text(d => Math.round(+d.Total_Period_kWh/1000) + "k")
               .transition().delay((d, i) => i * 80 + 400).duration(400)
               .attr("x", d => x(+d.Total_Period_kWh) + 5).attr("opacity", 1);

            // Axes
            svg.append("g").attr("class", "axis").call(d3.axisLeft(y).tickSize(0)).selectAll("text").attr("font-size", "9px");
            svg.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(5).tickFormat(d => d >= 1000 ? (d/1000)+"k" : d));
            
            // X-axis label
            svg.append("text").attr("class", "axis-label").attr("x", (w-100)/2).attr("y", h+35).attr("text-anchor", "middle").text("Total Energy (kWh)");
        }
        
        d3.csv("../data/ucbl1/insight_7_top_consumers.csv").then(data => {
            rawData.topConsumers = data;
            drawChart6(data);
        });

        // --- CHART 7: HEATMAP (insight_1_full_monthly_deltas.csv) ---
        function drawChart7(data) {
            const filteredMonths = getFilteredMonths();
            const filteredMonthsShort = getFilteredMonthsShort();
            
            // Filter data based on heatmap minimum threshold
            let filteredData = data;
            if (filterState.heatmapMin > 0) {
                filteredData = data.filter(d => {
                    // Check if any month value exceeds threshold
                    return filteredMonths.some(m => (+d[m] || 0) >= filterState.heatmapMin);
                });
            }
            
            const id = "#c7";
            d3.select(id).selectAll("*").remove();
            const container = d3.select(id).node().getBoundingClientRect();
            const w = container.width - 220, h = container.height - 60;
            const svg = d3.select(id).append("svg").attr("viewBox", `0 0 ${container.width} ${container.height}`)
                          .append("g").attr("transform", `translate(200,25)`);
            
            // Calculate max value for color scale (only from filtered months)
            let maxVal = 0;
            filteredData.forEach(d => {
                filteredMonths.forEach(m => {
                    const val = +d[m] || 0;
                    if (val > maxVal) maxVal = val;
                });
            });
            
            const x = d3.scaleBand().domain(filteredMonths).range([0, w]).padding(0.03);
            const y = d3.scaleBand().domain(filteredData.map(d => d.Meter)).range([0, h]).padding(0.03);
            const heatmapColor = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, maxVal]);

            // Heatmap cells with staggered animation
            filteredData.forEach((d, rowIdx) => {
                filteredMonths.forEach((m, colIdx) => {
                    const val = +d[m] || 0;
                    const delay = (rowIdx * 20) + (colIdx * 15);
                    svg.append("rect")
                       .attr("x", x(m)).attr("y", y(d.Meter))
                       .attr("width", x.bandwidth()).attr("height", y.bandwidth())
                       .attr("fill", heatmapColor(val)).attr("rx", 2)
                       .attr("opacity", 0)
                       .style("cursor", "pointer")
                       .on("mouseover", function(e) {
                           d3.select(this).attr("stroke", "#111827").attr("stroke-width", 2);
                           const pctOfMax = ((val / maxVal) * 100).toFixed(1);
                           showTooltip(e, `<div class="tooltip-title">${d.Meter}</div><div class="tooltip-value">${Math.round(val).toLocaleString()} kWh</div><div class="tooltip-label">${m}<br>Intensity: ${pctOfMax}% of max</div>`);
                       })
                       .on("mousemove", moveTooltip)
                       .on("mouseout", function() {
                           d3.select(this).attr("stroke", "none");
                           hideTooltip();
                       })
                       .transition().delay(delay).duration(300).ease(d3.easeCubicOut)
                       .attr("opacity", 1);
                });
            });

            // Axes
            svg.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).tickFormat((d,i) => filteredMonthsShort[i]));
            svg.append("g").attr("class", "axis").call(d3.axisLeft(y)).selectAll("text").attr("font-size", "8px");

            // Color scale legend
            d3.select("#l7").html(`
                <span class="scale-label">0 kWh</span>
                <div class="color-bar" style="background: linear-gradient(to right, ${heatmapColor(0)}, ${heatmapColor(maxVal/4)}, ${heatmapColor(maxVal/2)}, ${heatmapColor(maxVal*3/4)}, ${heatmapColor(maxVal)})"></div>
                <span class="scale-label">${Math.round(maxVal/1000)}k kWh</span>
            `);
        }
        
        d3.csv("../data/ucbl1/insight_1_full_monthly_deltas.csv").then(data => {
            rawData.heatmap = data;
            drawChart7(data);
        });

        // --- HELPER FUNCTIONS ---
        function getDims(id) {
            const el = d3.select(id).node().getBoundingClientRect();
            return { w: el.width - margin.left - margin.right, h: el.height - margin.top - margin.bottom };
        }

        function showTooltip(e, html) {
            tooltip.style("opacity", 1).html(html).style("left", (e.pageX+15)+"px").style("top", (e.pageY-15)+"px");
        }
        function moveTooltip(e) {
            tooltip.style("left", (e.pageX+15)+"px").style("top", (e.pageY-15)+"px");
        }
        function hideTooltip() { tooltip.style("opacity", 0); }

