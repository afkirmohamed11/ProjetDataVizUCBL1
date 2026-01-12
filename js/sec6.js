/* ============================================================
   SECTION 6 – UCBL1 DATA CENTER VISUALIZATIONS
   D3.js v7+
============================================================ */

/* -----------------------------
   GLOBAL TOOLTIP
----------------------------- */
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "d3-tooltip")
  .style("position", "absolute")
  .style("background", "rgba(0,0,0,0.85)")
  .style("color", "#fff")
  .style("padding", "6px 10px")
  .style("border-radius", "4px")
  .style("font-size", "12px")
  .style("pointer-events", "none")
  .style("opacity", 0);

/* CO₂ conversion factor (France – approx) */
const CO2_FACTOR = 0.056; // kg CO₂ / kWh

/* ============================================================
   1️⃣ MONTHLY ENERGY CONSUMPTION – LINE CHART
============================================================ */
(() => {
  const margin = { top: 40, right: 30, bottom: 50, left: 70 };
  const width = 700 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#monthly-seasonality")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv("./data/ucbl1/ucbl1_monthly_total.csv", d => ({
    month: d.month,
    month_index: +d.month_index,
    total_kwh: +d.total_kwh
  })).then(data => {

    data.sort((a, b) => a.month_index - b.month_index);

    const x = d3.scaleLinear()
      .domain([1, 12])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total_kwh)])
      .nice()
      .range([height, 0]);

    const line = d3.line()
      .x(d => x(d.month_index))
      .y(d => y(d.total_kwh))
      .curve(d3.curveMonotoneX);

    const path = svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3a9ed0")
      .attr("stroke-width", 3)
      .attr("d", line);

    const length = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", length)
      .attr("stroke-dashoffset", length)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

    svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.month_index))
      .attr("cy", d => y(d.total_kwh))
      .attr("r", 4)
      .attr("fill", "#fca367")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.month}</strong><br>${d.total_kwh.toLocaleString()} kWh`);
      })
      .on("mousemove", event => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(12).tickFormat(i => data[i - 1]?.month || ""));

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text("Monthly Energy Consumption (kWh)");

  });
})();

/* ============================================================
   2️⃣ ENERGY CONSUMPTION BY METER – BAR CHART
============================================================ */
(() => {
  const margin = { top: 40, right: 20, bottom: 120, left: 80 };
  const width = 700 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const svg = d3.select("#meter-volatility")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv("./data/ucbl1/ucbl1_meter_total.csv", d => ({
    meter: d.meter_name,
    kwh: +d.total_kwh
  })).then(data => {

    const x = d3.scaleBand()
      .domain(data.map(d => d.meter))
      .range([0, width])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.kwh)])
      .nice()
      .range([height, 0]);

    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.meter))
      .attr("width", x.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", "#fca367")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.meter}</strong><br>
            ${d.kwh.toLocaleString()} kWh<br>
            ${(d.kwh * CO2_FACTOR).toFixed(1)} kg CO₂
          `);
      })
      .on("mousemove", event => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0))
      .transition()
      .duration(1000)
      .delay((_, i) => i * 40)
      .attr("y", d => y(d.kwh))
      .attr("height", d => height - y(d.kwh));

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text("Energy Consumption by Data Center Section");
  });
})();

/* ============================================================
   3️⃣ HEATMAP – METER × MONTH
============================================================ */
(() => {
  const margin = { top: 80, right: 20, bottom: 50, left: 160 };
  const width = 700 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#pareto-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv("./data/ucbl1/ucbl1_heatmap_data.csv", d => ({
    meter: d.meter_name,
    month: d.month,
    kwh: +d.kwh
  })).then(data => {

    const meters = [...new Set(data.map(d => d.meter))];
    const months = [...new Set(data.map(d => d.month))];

    const x = d3.scaleBand()
      .domain(months)
      .range([0, width])
      .padding(0.05);

    const y = d3.scaleBand()
      .domain(meters)
      .range([0, height])
      .padding(0.05);

    const color = d3.scaleSequential()
      .interpolator(d3.interpolateYlOrRd)
      .domain([0, d3.max(data, d => d.kwh)]);

    svg.selectAll(".cell")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", d => x(d.month))
      .attr("y", d => y(d.meter))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", d => color(d.kwh))
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.meter}</strong><br>
            ${d.month}<br>
            ${d.kwh.toLocaleString()} kWh
          `);
      })
      .on("mousemove", event => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    svg.append("g").call(d3.axisLeft(y));
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
  });
})();

/* ============================================================
   4️⃣ KPI – ANNUAL TOTAL + CO₂
============================================================ */
(() => {
  d3.csv("./data/ucbl1/ucbl1_monthly_total.csv", d => +d.total_kwh)
    .then(values => {

      const total = d3.sum(values);
      const totalCO2 = total * CO2_FACTOR;

      const container = d3.select("#kpi-total");

      container.append("div")
        .style("font-size", "26px")
        .style("font-weight", "bold")
        .text(`${total.toLocaleString()} kWh`);

      container.append("div")
        .style("color", "#3a9ed0")
        .style("margin-top", "4px")
        .text(`≈ ${totalCO2.toFixed(0)} kg CO₂`);

      container.append("div")
        .style("font-size", "12px")
        .style("color", "#777")
        .text("Annual electricity consumption of the UCBL1 data center");
    });
})();




/* ============================================================
   1️⃣ SEASONALITY – BASELINE VS EXTRA CONSUMPTION
============================================================ */
(() => {
  const margin = { top: 40, right: 30, bottom: 50, left: 70 };
  const width = 700 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#monthly-consumption")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv("./data/ucbl1/ucbl1_seasonality.csv", d => ({
    month: d.month,
    month_index: +d.month_index,
    total_kwh: +d.total_kwh,
    baseline_kwh: +d.baseline_kwh,
    extra_kwh: +d.extra_kwh
  })).then(data => {

    data.sort((a, b) => a.month_index - b.month_index);

    const x = d3.scaleLinear()
      .domain([1, 12])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total_kwh)])
      .nice()
      .range([height, 0]);

    // Baseline area
    const baselineArea = d3.area()
      .x(d => x(d.month_index))
      .y0(height)
      .y1(d => y(d.baseline_kwh))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "#3a9ed0")
      .attr("opacity", 0.3)
      .attr("d", baselineArea);

    // Extra consumption area
    const extraArea = d3.area()
      .x(d => x(d.month_index))
      .y0(d => y(d.baseline_kwh))
      .y1(d => y(d.total_kwh))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "#fca367")
      .attr("opacity", 0.5)
      .attr("d", extraArea);

    // Total line
    const line = d3.line()
      .x(d => x(d.month_index))
      .y(d => y(d.total_kwh))
      .curve(d3.curveMonotoneX);

    const path = svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3a9ed0")
      .attr("stroke-width", 3)
      .attr("d", line);

    const length = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", length)
      .attr("stroke-dashoffset", length)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

    svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.month_index))
      .attr("cy", d => y(d.total_kwh))
      .attr("r", 4)
      .attr("fill", "#fca367")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.month}</strong><br>
            Total: ${d.total_kwh.toLocaleString()} kWh<br>
            Baseline: ${d.baseline_kwh.toLocaleString()} kWh<br>
            Extra: ${d.extra_kwh.toLocaleString()} kWh
          `);
      })
      .on("mousemove", event => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(12).tickFormat(i => data[i - 1]?.month || ""));

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text("Monthly Energy Consumption - Baseline vs Seasonal");

  });
})();

/* ============================================================
   2️⃣ METER VOLATILITY – SCATTER PLOT
============================================================ */
(() => {
  const margin = { top: 40, right: 20, bottom: 120, left: 80 };
  const width = 700 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const svg = d3.select("#meter-breakdown")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv("./data/ucbl1/ucbl1_meter_volatility.csv", d => ({
    meter: d.meter_name,
    avg_kwh: +d.avg_kwh,
    std_kwh: +d.std_kwh,
    min_kwh: +d.min_kwh,
    max_kwh: +d.max_kwh,
    cv: +d.cv
  })).then(data => {

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.avg_kwh)])
      .nice()
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.cv)])
      .nice()
      .range([height, 0]);

    const size = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.max_kwh)])
      .range([5, 20]);

    svg.selectAll(".bubble")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("cx", d => x(d.avg_kwh))
      .attr("cy", d => y(d.cv))
      .attr("r", 0)
      .attr("fill", "#fca367")
      .attr("opacity", 0.6)
      .attr("stroke", "#3a9ed0")
      .attr("stroke-width", 2)
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.meter}</strong><br>
            Avg: ${d.avg_kwh.toLocaleString()} kWh<br>
            CV: ${d.cv.toFixed(2)}<br>
            Range: ${d.min_kwh.toLocaleString()} - ${d.max_kwh.toLocaleString()} kWh
          `);
      })
      .on("mousemove", event => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0))
      .transition()
      .duration(1000)
      .delay((_, i) => i * 50)
      .attr("r", d => size(d.max_kwh));

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text("Meter Volatility: Average Consumption vs Coefficient of Variation");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Average kWh");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -60)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Coefficient of Variation");
  });
})();

/* ============================================================
   3️⃣ PARETO CHART – CUMULATIVE CONSUMPTION
============================================================ */
(() => {
  const margin = { top: 40, right: 60, bottom: 120, left: 80 };
  const width = 700 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#heatmap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv("./data/ucbl1/ucbl1_pareto.csv", d => ({
    meter: d.meter_name,
    total_kwh: +d.total_kwh,
    cum_kwh: +d.cum_kwh,
    cum_pct: +d.cum_pct
  })).then(data => {

    const x = d3.scaleBand()
      .domain(data.map(d => d.meter))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total_kwh)])
      .nice()
      .range([height, 0]);

    const y2 = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    // Bars
    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.meter))
      .attr("width", x.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", "#3a9ed0")
      .transition()
      .duration(1000)
      .delay((_, i) => i * 40)
      .attr("y", d => y(d.total_kwh))
      .attr("height", d => height - y(d.total_kwh));

    // Cumulative line
    const line = d3.line()
      .x(d => x(d.meter) + x.bandwidth() / 2)
      .y(d => y2(d.cum_pct))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#fca367")
      .attr("stroke-width", 3)
      .attr("d", line);

    svg.selectAll(".line-dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "line-dot")
      .attr("cx", d => x(d.meter) + x.bandwidth() / 2)
      .attr("cy", d => y2(d.cum_pct))
      .attr("r", 4)
      .attr("fill", "#fca367")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.meter}</strong><br>
            Consumption: ${d.total_kwh.toLocaleString()} kWh<br>
            Cumulative: ${(d.cum_pct * 100).toFixed(1)}%
          `);
      })
      .on("mousemove", event => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.append("g")
      .attr("transform", `translate(${width},0)`)
      .call(d3.axisRight(y2).tickFormat(d => `${(d * 100).toFixed(0)}%`));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text("Pareto Chart - Cumulative Energy Consumption");
  });
})();

/* ============================================================
   4️⃣ LOAD PROFILE – BASE VS VARIABLE
============================================================ */
(() => {
  d3.csv("./data/ucbl1/ucbl1_load_profile.csv", d => ({
    month: d.month,
    month_index: +d.month_index,
    total_kwh: +d.total_kwh,
    base_load_kwh: +d.base_load_kwh,
    variable_load_kwh: +d.variable_load_kwh
  })).then(data => {

    data.sort((a, b) => a.month_index - b.month_index);

    const total = d3.sum(data, d => d.total_kwh);
    const totalCO2 = total * CO2_FACTOR;
    const avgBase = d3.mean(data, d => d.base_load_kwh);
    const avgVariable = d3.mean(data, d => d.variable_load_kwh);

    const container = d3.select("#load-profile-kpis");

    container.append("div")
      .style("font-size", "26px")
      .style("font-weight", "bold")
      .text(`${total.toLocaleString()} kWh`);

    container.append("div")
      .style("color", "#3a9ed0")
      .style("margin-top", "4px")
      .text(`≈ ${totalCO2.toFixed(0)} kg CO₂`);

    container.append("div")
      .style("font-size", "12px")
      .style("color", "#777")
      .style("margin-top", "8px")
      .text(`Avg Base Load: ${avgBase.toLocaleString()} kWh/month`);

    container.append("div")
      .style("font-size", "12px")
      .style("color", "#777")
      .text(`Avg Variable Load: ${avgVariable.toLocaleString()} kWh/month`);

    container.append("div")
      .style("font-size", "12px")
      .style("color", "#777")
      .style("margin-top", "4px")
      .text("Annual electricity consumption of the UCBL1 data center");
  });
})();
