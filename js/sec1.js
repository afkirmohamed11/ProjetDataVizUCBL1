/**
 * Section 1 - Why It Matters: Data in Our Daily Lives
 * D3.js Visualizations for demonstrating the scale and energy impact of data usage
 */

// ============================================
// Theme Colors (Minimal Light Palette)
// ============================================
const THEME = {
    primary: "#4A6FA5",
    secondary: "#88C9A1", 
    dark: "#2D3748",
    light: "#F8FAFB",
    gray: {
        100: "#F7FAFC",
        200: "#EDF2F7",
        300: "#E2E8F0",
        500: "#A0AEC0",
        600: "#718096"
    },
    accent: "#E8B4B8",
    chart: {
        green: "#88C9A1",
        blue: "#4A6FA5",
        orange: "#F6AD55",
        red: "#FC8181"
    }
};

// ============================================
// PART A: Live Counter Dashboard
// ============================================

const Section1 = {
    // Reference data (orders of magnitude)
    constants: {
        exabytesPerDay: 350, // ~300-400 EB/day
        emailsPerSecond: 3500000, // ~3-4 million
        videoMinutesPerSecond: 1000000, // estimated streaming minutes globally per second
        videoTrafficShare: 65, // ~60-70%
        avgInternetHoursPerDay: 6.5 // ~6-7 hours
    },

    // Counter state
    counters: {
        startTime: null,
        exabytes: 0,
        emails: 0,
        videoMinutes: 0,
        animationId: null
    },

    // Energy data for actions (in Wh)
    energyData: [
        { action: "Google Search", energy: 0.3, unit: "Wh", equivalent: "≈ LED bulb for 2 minutes", icon: "🔍" },
        { action: "Email (no attachment)", energy: 0.04, unit: "Wh", equivalent: "≈ LED bulb for 15 seconds", icon: "✉️" },
        { action: "1 GB Data Transfer", energy: 130, unit: "Wh", equivalent: "≈ LED bulb for 13 hours", icon: "📶" },
        { action: "1h HD Streaming", energy: 300, unit: "Wh", equivalent: "≈ LED bulb for 30 hours", icon: "🎬" }
    ],

    // Device scenarios
    deviceScenarios: {
        idle: { laptop: 15, phone: 2, label: "Idle / Email checking" },
        browsing: { laptop: 30, phone: 5, label: "Web Browsing" },
        streaming: { laptop: 50, phone: 8, label: "Video Streaming" }
    },

    /**
     * Initialize all Section 1 visualizations
     */
    init() {
        this.initCounterDashboard();
        this.initEnergyBarChart();
        this.initDeviceMetaphor();
        this.initTransitionAnimation();
    },

    // ============================================
    // Visualization 1: Live Counter Dashboard
    // ============================================
    initCounterDashboard() {
        const container = d3.select("#sec1-counters");
        if (container.empty()) return;

        container.html(""); // Clear existing content

        const countersData = [
            { id: "exabytes", label: "Exabytes Generated Today", value: 0, suffix: " EB", color: THEME.secondary, gradient: [THEME.secondary, "#9DD5B1"], icon: "📊" },
            { id: "emails", label: "Emails Sent Since Page Load", value: 0, suffix: "", color: THEME.primary, gradient: [THEME.primary, "#6B8FBD"], icon: "✉️" },
            { id: "video", label: "Video Minutes Streamed", value: 0, suffix: " min", color: THEME.chart.orange, gradient: [THEME.chart.orange, "#F6C177"], icon: "🎬" }
        ];

        // Create counter cards with enhanced styling
        const cardWrappers = container.selectAll(".counter-wrapper")
            .data(countersData)
            .enter()
            .append("div")
            .attr("class", "col-md-4 mb-4");

        const cards = cardWrappers.append("div")
            .attr("class", "counter-card bg-white rounded-3 shadow p-4 text-center h-100 position-relative overflow-hidden");

        // Add decorative top border with gradient
        cards.append("div")
            .style("position", "absolute")
            .style("top", "0")
            .style("left", "0")
            .style("right", "0")
            .style("height", "4px")
            .style("background", d => `linear-gradient(90deg, ${d.gradient[0]}, ${d.gradient[1]})`);

        // Icon with background circle
        const iconWrapper = cards.append("div")
            .attr("class", "counter-icon-wrapper mb-3 d-inline-flex align-items-center justify-content-center")
            .style("width", "80px")
            .style("height", "80px")
            .style("border-radius", "50%")
            .style("background", d => `linear-gradient(135deg, ${d.gradient[0]}15, ${d.gradient[1]}25)`);

        iconWrapper.append("span")
            .attr("class", "counter-icon")
            .style("font-size", "2.5rem")
            .style("line-height", "1")
            .text(d => d.icon);

        // Value display with SVG for animated numbers
        const valueSvg = cards.append("svg")
            .attr("class", "counter-svg")
            .attr("width", "100%")
            .attr("height", "55")
            .attr("viewBox", "0 0 200 55");

        // Add gradient definitions
        const defs = valueSvg.append("defs");
        countersData.forEach(d => {
            const grad = defs.append("linearGradient")
                .attr("id", `grad-${d.id}`)
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");
            grad.append("stop").attr("offset", "0%").attr("stop-color", d.gradient[0]);
            grad.append("stop").attr("offset", "100%").attr("stop-color", d.gradient[1]);
        });

        valueSvg.append("text")
            .attr("id", d => `counter-${d.id}`)
            .attr("x", "100")
            .attr("y", "40")
            .attr("text-anchor", "middle")
            .attr("class", "counter-value")
            .style("font-size", "1.8rem")
            .style("font-weight", "bold")
            .style("fill", d => d.color)
            .text("0");

        // Label
        cards.append("p")
            .attr("class", "counter-label text-muted mb-0 mt-2")
            .style("font-size", "0.95rem")
            .text(d => d.label);

        // Estimated values caption
        container.append("div")
            .attr("class", "col-12 text-center mt-4")
            .append("small")
            .attr("class", "text-muted fst-italic d-inline-block px-3 py-2 bg-light rounded-pill")
            .html('<i class="fas fa-info-circle me-1"></i>Estimated values based on global averages (Cisco, Statista, IEA)');

        // Start animation
        this.counters.startTime = Date.now();
        this.animateCounters();
    },

    animateCounters() {
        const self = this;
        const secondsElapsed = (Date.now() - this.counters.startTime) / 1000;
        
        // Calculate current values
        // Exabytes: ~350 EB per day = ~0.00405 EB per second
        const exabytesPerSecond = this.constants.exabytesPerDay / 86400;
        this.counters.exabytes = secondsElapsed * exabytesPerSecond;
        
        // Emails: ~3.5 million per second
        this.counters.emails = Math.floor(secondsElapsed * this.constants.emailsPerSecond);
        
        // Video minutes: estimated based on traffic share
        this.counters.videoMinutes = Math.floor(secondsElapsed * this.constants.videoMinutesPerSecond);

        // Update displays
        d3.select("#counter-exabytes")
            .text(this.counters.exabytes.toFixed(4) + " EB");
        
        d3.select("#counter-emails")
            .text(this.formatNumber(this.counters.emails));
        
        d3.select("#counter-video")
            .text(this.formatNumber(this.counters.videoMinutes) + " min");

        // Continue animation
        this.counters.animationId = requestAnimationFrame(() => self.animateCounters());
    },

    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
        if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
        if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
        return num.toFixed(0);
    },

    // ============================================
    // Visualization 2: Energy per Digital Action
    // ============================================
    initEnergyBarChart() {
        const container = d3.select("#sec1-energy-chart");
        if (container.empty()) return;

        container.html(""); // Clear existing

        const margin = { top: 50, right: 120, bottom: 50, left: 160 };
        const containerWidth = container.node().getBoundingClientRect().width || 700;
        const width = Math.max(300, containerWidth - margin.left - margin.right);
        const height = 280 - margin.top - margin.bottom;

        const svg = container.append("svg")
            .attr("width", "100%")
            .attr("height", height + margin.top + margin.bottom)
            .attr("viewBox", `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add gradient definitions
        const defs = svg.append("defs");
        
        // Gradient for each bar (minimal light palette)
        const gradients = [
            { id: "grad-search", colors: [THEME.secondary, "#9DD5B1"] },
            { id: "grad-email", colors: [THEME.primary, "#6B8FBD"] },
            { id: "grad-transfer", colors: [THEME.chart.orange, "#F6C177"] },
            { id: "grad-streaming", colors: [THEME.chart.red, "#FCA5A5"] }
        ];
        
        gradients.forEach(g => {
            const gradient = defs.append("linearGradient")
                .attr("id", g.id)
                .attr("x1", "0%").attr("y1", "0%")
                .attr("x2", "100%").attr("y2", "0%");
            gradient.append("stop").attr("offset", "0%").attr("stop-color", g.colors[0]);
            gradient.append("stop").attr("offset", "100%").attr("stop-color", g.colors[1]);
        });

        // Use logarithmic scale for better visualization of different magnitudes
        const maxEnergy = d3.max(this.energyData, d => d.energy);
        
        const x = d3.scaleLog()
            .domain([0.01, maxEnergy * 1.5])
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(this.energyData.map(d => d.action))
            .range([0, height])
            .padding(0.35);

        // Gradient IDs mapped to data
        const gradientIds = ["grad-search", "grad-email", "grad-transfer", "grad-streaming"];

        // Add subtle grid lines
        svg.append("g")
            .attr("class", "grid")
            .selectAll("line")
            .data([0.1, 1, 10, 100])
            .enter()
            .append("line")
            .attr("x1", d => x(d))
            .attr("x2", d => x(d))
            .attr("y1", 0)
            .attr("y2", height)
            .style("stroke", THEME.gray[300])
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.7);

        // Create tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "sec1-tooltip")
            .style("position", "absolute")
            .style("background", "linear-gradient(135deg, rgba(30,30,30,0.95), rgba(50,50,50,0.95))")
            .style("color", "white")
            .style("padding", "15px 20px")
            .style("border-radius", "12px")
            .style("font-size", "14px")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("z-index", 1000)
            .style("box-shadow", "0 8px 25px rgba(0,0,0,0.3)")
            .style("border", "1px solid rgba(255,255,255,0.1)")
            .style("backdrop-filter", "blur(10px)");

        // Draw bars with animation
        const bars = svg.selectAll(".energy-bar-group")
            .data(this.energyData)
            .enter()
            .append("g")
            .attr("class", "energy-bar-group");

        // Background bar
        bars.append("rect")
            .attr("class", "energy-bar-bg")
            .attr("x", 0)
            .attr("y", d => y(d.action))
            .attr("width", width)
            .attr("height", y.bandwidth())
            .attr("fill", THEME.gray[200])
            .attr("rx", y.bandwidth() / 2);

        // Actual bar with gradient
        bars.append("rect")
            .attr("class", "energy-bar")
            .attr("x", 0)
            .attr("y", d => y(d.action))
            .attr("width", 0)
            .attr("height", y.bandwidth())
            .attr("fill", (d, i) => `url(#${gradientIds[i]})`)
            .attr("rx", y.bandwidth() / 2)
            .style("cursor", "pointer")
            .style("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("filter", "drop-shadow(3px 3px 8px rgba(0,0,0,0.25))")
                    .attr("transform", "scale(1.02)");
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                
                tooltip.html(`
                    <div style="font-size: 1.3em; margin-bottom: 8px;">${d.icon} <strong>${d.action}</strong></div>
                    <div style="color: #88C9A1; font-size: 1.1em; margin-bottom: 5px;">⚡ ${d.energy} ${d.unit}</div>
                    <div style="color: #A0AEC0; font-size: 0.9em; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; margin-top: 5px;">💡 ${d.equivalent}</div>
                `)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))")
                    .attr("transform", "scale(1)");
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            })
            .transition()
            .duration(1200)
            .delay((d, i) => i * 250)
            .ease(d3.easeCubicOut)
            .attr("width", d => x(d.energy));

        // Y axis labels with icons
        svg.selectAll(".action-label")
            .data(this.energyData)
            .enter()
            .append("text")
            .attr("class", "action-label")
            .attr("x", -15)
            .attr("y", d => y(d.action) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .style("font-size", "13px")
            .style("font-weight", "500")
            .style("fill", "#333")
            .text(d => `${d.icon} ${d.action}`)
            .style("opacity", 0)
            .transition()
            .duration(600)
            .delay((d, i) => i * 150)
            .style("opacity", 1);

        // Value labels on bars
        svg.selectAll(".value-label")
            .data(this.energyData)
            .enter()
            .append("text")
            .attr("class", "value-label")
            .attr("x", d => x(d.energy) + 10)
            .attr("y", d => y(d.action) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("opacity", 0)
            .text(d => `${d.energy} ${d.unit}`)
            .transition()
            .delay(1200)
            .duration(500)
            .style("opacity", 1);

        // Add title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -15)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Energy Consumption per Digital Action");

        // Add source note
        container.append("small")
            .attr("class", "text-muted d-block text-center mt-2")
            .html('<i class="fas fa-info-circle me-1"></i>Sources: Google Sustainability Reports, IEA Digital Energy Studies');
    },

    // ============================================
    // Visualization 3: Device Energy Metaphor
    // ============================================
    initDeviceMetaphor() {
        const container = d3.select("#sec1-device-metaphor");
        if (container.empty()) return;

        container.html(""); // Clear existing

        const self = this;

        // Title
        container.append("div")
            .attr("class", "text-center mb-4")
            .append("p")
            .attr("class", "fw-bold text-dark mb-2")
            .style("font-size", "1.1rem")
            .text("🔌 Select a usage scenario to see power consumption:");

        // Create scenario buttons with icons
        const buttonContainer = container.append("div")
            .attr("class", "scenario-buttons d-flex justify-content-center flex-wrap gap-3 mb-5");

        const scenarioIcons = { idle: "📧", browsing: "🌐", streaming: "🎬" };

        const buttons = buttonContainer.selectAll(".scenario-btn")
            .data(Object.entries(this.deviceScenarios))
            .enter()
            .append("button")
            .attr("class", "btn btn-outline-primary scenario-btn d-flex align-items-center gap-2")
            .attr("data-scenario", d => d[0])
            .html(d => `<span style="font-size: 1.3rem;">${scenarioIcons[d[0]]}</span> ${d[1].label}`)
            .on("click", function(event, d) {
                d3.selectAll(".scenario-btn").classed("active btn-primary", false).classed("btn-outline-primary", true);
                d3.select(this).classed("active btn-primary", true).classed("btn-outline-primary", false);
                self.updateDeviceMetaphor(d[0]);
            });

        // Set first button as active
        buttons.filter((d, i) => i === 0).classed("active btn-primary", true).classed("btn-outline-primary", false);

        // Create device visualizations
        const devicesRow = container.append("div")
            .attr("class", "row justify-content-center g-4");

        // Laptop Card
        const laptopCol = devicesRow.append("div")
            .attr("class", "col-md-5");
        
        const laptopCard = laptopCol.append("div")
            .attr("class", "device-card bg-white rounded-3 shadow-sm p-4 text-center h-100")
            .style("border", "1px solid rgba(0,0,0,0.05)")
            .style("transition", "transform 0.3s ease, box-shadow 0.3s ease");

        laptopCard.append("div")
            .attr("class", "device-icon mb-3")
            .style("font-size", "4.5rem")
            .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.1))")
            .text("💻");

        laptopCard.append("h5")
            .attr("class", "mb-3 text-dark")
            .text("Laptop");

        // Laptop power bar SVG
        const laptopSvg = laptopCard.append("svg")
            .attr("id", "laptop-power-bar")
            .attr("width", "100%")
            .attr("height", "45")
            .attr("viewBox", "0 0 220 45")
            .attr("preserveAspectRatio", "xMidYMid meet");

        // Gradient for laptop
        const laptopDefs = laptopSvg.append("defs");
        const laptopGradient = laptopDefs.append("linearGradient")
            .attr("id", "laptop-gradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%");
        laptopGradient.append("stop").attr("id", "laptop-grad-start").attr("offset", "0%").attr("stop-color", THEME.secondary);
        laptopGradient.append("stop").attr("id", "laptop-grad-end").attr("offset", "100%").attr("stop-color", "#9DD5B1");

        // Background bar
        laptopSvg.append("rect")
            .attr("x", 10).attr("y", 12)
            .attr("width", 200).attr("height", 22)
            .attr("fill", THEME.gray[200])
            .attr("rx", 11);

        // Power bar
        laptopSvg.append("rect")
            .attr("id", "laptop-power")
            .attr("x", 10).attr("y", 12)
            .attr("width", 0).attr("height", 22)
            .attr("fill", "url(#laptop-gradient)")
            .attr("rx", 11)
            .style("filter", "drop-shadow(1px 1px 3px rgba(0,0,0,0.15))");

        laptopCard.append("p")
            .attr("id", "laptop-watts")
            .attr("class", "mt-3 mb-0 fw-bold")
            .style("font-size", "1.2rem")
            .style("color", THEME.secondary)
            .text("0 W");

        // Phone Card
        const phoneCol = devicesRow.append("div")
            .attr("class", "col-md-5");
        
        const phoneCard = phoneCol.append("div")
            .attr("class", "device-card bg-white rounded-3 shadow-sm p-4 text-center h-100")
            .style("border", "1px solid rgba(0,0,0,0.05)")
            .style("transition", "transform 0.3s ease, box-shadow 0.3s ease");

        phoneCard.append("div")
            .attr("class", "device-icon mb-3")
            .style("font-size", "4.5rem")
            .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.1))")
            .text("📱");

        phoneCard.append("h5")
            .attr("class", "mb-3 text-dark")
            .text("Smartphone");

        // Phone power bar SVG
        const phoneSvg = phoneCard.append("svg")
            .attr("id", "phone-power-bar")
            .attr("width", "100%")
            .attr("height", "45")
            .attr("viewBox", "0 0 220 45")
            .attr("preserveAspectRatio", "xMidYMid meet");

        // Gradient for phone
        const phoneDefs = phoneSvg.append("defs");
        const phoneGradient = phoneDefs.append("linearGradient")
            .attr("id", "phone-gradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%");
        phoneGradient.append("stop").attr("id", "phone-grad-start").attr("offset", "0%").attr("stop-color", THEME.primary);
        phoneGradient.append("stop").attr("id", "phone-grad-end").attr("offset", "100%").attr("stop-color", "#6B8FBD");

        // Background bar
        phoneSvg.append("rect")
            .attr("x", 10).attr("y", 12)
            .attr("width", 200).attr("height", 22)
            .attr("fill", THEME.gray[200])
            .attr("rx", 11);

        // Power bar
        phoneSvg.append("rect")
            .attr("id", "phone-power")
            .attr("x", 10).attr("y", 12)
            .attr("width", 0).attr("height", 22)
            .attr("fill", "url(#phone-gradient)")
            .attr("rx", 11)
            .style("filter", "drop-shadow(1px 1px 3px rgba(0,0,0,0.15))");

        phoneCard.append("p")
            .attr("id", "phone-watts")
            .attr("class", "mt-3 mb-0 fw-bold")
            .style("font-size", "1.2rem")
            .style("color", THEME.primary)
            .text("0 W");

        // Initialize with first scenario
        this.updateDeviceMetaphor("idle");

        // Add explanation with styled box
        container.append("div")
            .attr("class", "text-center mt-4")
            .append("div")
            .attr("class", "d-inline-block px-4 py-2 bg-white rounded-pill shadow-sm")
            .style("border", "1px solid rgba(0,0,0,0.05)")
            .html('<i class="fas fa-lightbulb text-warning me-2"></i><span class="text-muted">Power consumption increases significantly with data-intensive tasks</span>');
    },

    updateDeviceMetaphor(scenario) {
        const data = this.deviceScenarios[scenario];
        const maxLaptop = 60; // max watts for scaling
        const maxPhone = 10;

        // Get gradient colors based on intensity
        const getGradientColors = (value, max) => {
            const ratio = value / max;
            if (ratio < 0.35) return { start: THEME.secondary, end: "#9DD5B1" }; // Green (secondary)
            if (ratio < 0.65) return { start: THEME.chart.orange, end: "#F6C177" }; // Orange
            return { start: THEME.chart.red, end: "#FCA5A5" }; // Red
        };

        const laptopColors = getGradientColors(data.laptop, maxLaptop);
        const phoneColors = getGradientColors(data.phone, maxPhone);

        // Update laptop gradient colors
        d3.select("#laptop-grad-start").attr("stop-color", laptopColors.start);
        d3.select("#laptop-grad-end").attr("stop-color", laptopColors.end);

        // Animate laptop power bar
        d3.select("#laptop-power")
            .transition()
            .duration(800)
            .ease(d3.easeCubicOut)
            .attr("width", (data.laptop / maxLaptop) * 200);

        d3.select("#laptop-watts")
            .style("color", laptopColors.start)
            .text(`~${data.laptop} W`);

        // Update phone gradient colors
        d3.select("#phone-grad-start").attr("stop-color", phoneColors.start);
        d3.select("#phone-grad-end").attr("stop-color", phoneColors.end);

        // Animate phone power bar
        d3.select("#phone-power")
            .transition()
            .duration(800)
            .ease(d3.easeCubicOut)
            .attr("width", (data.phone / maxPhone) * 200);

        d3.select("#phone-watts")
            .style("color", phoneColors.start)
            .text(`~${data.phone} W`);
    },

    // ============================================
    // Visualization 4: Transition Animation
    // ============================================
    initTransitionAnimation() {
        const container = d3.select("#sec1-transition");
        if (container.empty()) return;

        container.html(""); // Clear existing

        const width = 600;
        const height = 160;

        const svg = container.append("svg")
            .attr("width", "100%")
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        const centerY = 70;

        // Simple connection line
        svg.append("line")
            .attr("x1", 100)
            .attr("y1", centerY)
            .attr("x2", width - 100)
            .attr("y2", centerY)
            .attr("stroke", "rgba(136, 201, 161, 0.4)")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "6,4");

        // Node data
        const nodes = [
            { x: 60, icon: "💻", label: "Your Device", color: "#4A6FA5" },
            { x: width / 2, icon: "🌐", label: "Network", color: "#88C9A1" },
            { x: width - 60, icon: "🏢", label: "Data Center", color: "#4A6FA5" }
        ];

        // Draw nodes
        nodes.forEach((node, i) => {
            const g = svg.append("g")
                .attr("transform", `translate(${node.x}, ${centerY})`);

            // Circle background
            g.append("circle")
                .attr("r", 35)
                .attr("fill", "rgba(255,255,255,0.08)")
                .attr("stroke", node.color)
                .attr("stroke-width", 2);

            // Icon
            g.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "0.35em")
                .style("font-size", "1.8rem")
                .text(node.icon);

            // Label
            svg.append("text")
                .attr("x", node.x)
                .attr("y", centerY + 55)
                .attr("text-anchor", "middle")
                .style("font-size", "0.8rem")
                .style("fill", "rgba(255,255,255,0.7)")
                .style("font-weight", "500")
                .text(node.label);
        });

        // Animated data packets
        const packetColors = ["#88C9A1", "#4A6FA5", "#9DD5B1", "#6B8FBD"];
        const packetsGroup = svg.append("g").attr("class", "data-packets");

        const createPacket = (delay) => {
            const color = packetColors[Math.floor(Math.random() * packetColors.length)];
            const yOffset = (Math.random() - 0.5) * 20;

            packetsGroup.append("circle")
                .attr("cx", 100)
                .attr("cy", centerY + yOffset)
                .attr("r", 5)
                .attr("fill", color)
                .attr("opacity", 0)
                .transition()
                .duration(150)
                .attr("opacity", 0.85)
                .transition()
                .delay(delay)
                .duration(1800)
                .ease(d3.easeLinear)
                .attr("cx", width - 100)
                .transition()
                .duration(150)
                .attr("opacity", 0)
                .remove();
        };

        const animatePackets = () => {
            for (let i = 0; i < 3; i++) {
                createPacket(i * 150);
            }
        };

        animatePackets();
        this.packetInterval = setInterval(animatePackets, 1000);

        // Bottom message
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 8)
            .attr("text-anchor", "middle")
            .style("font-size", "0.85rem")
            .style("font-style", "italic")
            .style("fill", "rgba(255,255,255,0.6)")
            .text("Data travels through multiple hops before reaching its destination");
    },

    // ============================================
    // Cleanup
    // ============================================
    destroy() {
        if (this.counters.animationId) {
            cancelAnimationFrame(this.counters.animationId);
        }
        if (this.packetInterval) {
            clearInterval(this.packetInterval);
        }
        d3.selectAll(".sec1-tooltip").remove();
    }
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    // Check if D3 is available
    if (typeof d3 === "undefined") {
        console.error("D3.js is required for Section 1 visualizations");
        return;
    }
    
    // Initialize with a small delay to ensure containers are rendered
    setTimeout(() => {
        Section1.init();
    }, 500);
});

// Reinitialize on window resize for responsive charts
let resizeTimeout;
window.addEventListener("resize", function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        Section1.initEnergyBarChart();
    }, 250);
});
