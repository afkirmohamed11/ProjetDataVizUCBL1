/**
 * Dark Mode Toggle
 * Self-contained dark mode functionality
 * Author: Lokmane
 */

(function() {
    'use strict';

    // Inject dark mode styles
    const darkModeStyles = `
        /* ========== DARK MODE TOGGLE BUTTON ========== */
        .dark-mode-toggle {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            font-size: 1.4rem;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .dark-mode-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        .dark-mode-toggle .icon-sun { display: none; }
        .dark-mode-toggle .icon-moon { display: block; }
        
        /* ========== DARK MODE STYLES ========== */
        body.dark-mode {
            background-color: #121212 !important;
            color: #e0e0e0 !important;
        }
        
        body.dark-mode .dark-mode-toggle {
            background: linear-gradient(135deg, #f39c12 0%, #e74c3c 100%);
        }
        body.dark-mode .dark-mode-toggle .icon-sun { display: block; }
        body.dark-mode .dark-mode-toggle .icon-moon { display: none; }

        /* Navbar */
        body.dark-mode .navbar {
            background-color: #1a1a2e !important;
            border-bottom: 1px solid #2d2d44;
        }
        body.dark-mode .navbar-brand h1,
        body.dark-mode .navbar .nav-link {
            color: #e0e0e0 !important;
        }
        body.dark-mode .navbar .nav-link:hover,
        body.dark-mode .navbar .nav-link.active {
            color: #20c997 !important;
        }

        /* Sections & Containers */
        body.dark-mode .container-xxl,
        body.dark-mode .container-fluid {
            background-color: #121212 !important;
        }
        body.dark-mode .bg-light {
            background-color: #1e1e2f !important;
        }
        body.dark-mode .bg-white {
            background-color: #1a1a2e !important;
        }

        /* Text */
        body.dark-mode h1, body.dark-mode h2, body.dark-mode h3, 
        body.dark-mode h4, body.dark-mode h5, body.dark-mode h6 {
            color: #ffffff !important;
        }
        body.dark-mode p, body.dark-mode span, body.dark-mode div {
            color: #b0b0b0;
        }
        body.dark-mode .text-dark {
            color: #e0e0e0 !important;
        }
        body.dark-mode .text-muted {
            color: #888 !important;
        }

        /* Cards & Boxes - Be specific to avoid overriding section containers */
        body.dark-mode .card {
            background-color: #1e1e2f !important;
            border-color: #2d2d44 !important;
        }
        body.dark-mode .shadow-sm.bg-white,
        body.dark-mode .rounded.bg-white {
            background-color: #1a1a2e !important;
            border-color: #2d2d44 !important;
        }
        body.dark-mode .card {
            background-color: #1e1e2f !important;
            border-color: #2d2d44 !important;
        }

        /* Buttons */
        body.dark-mode .btn-primary {
            background-color: #20c997 !important;
            border-color: #20c997 !important;
        }
        body.dark-mode .btn-secondary {
            background-color: #6c757d !important;
            border-color: #6c757d !important;
        }

        /* Section titles */
        body.dark-mode .section-title {
            background-color: #1a1a2e !important;
        }

        /* Forms & Inputs */
        body.dark-mode input,
        body.dark-mode textarea,
        body.dark-mode select {
            background-color: #2d2d44 !important;
            border-color: #3d3d5c !important;
            color: #e0e0e0 !important;
        }

        /* Tables */
        body.dark-mode table {
            color: #e0e0e0 !important;
        }
        body.dark-mode th, body.dark-mode td {
            border-color: #2d2d44 !important;
        }
        body.dark-mode thead {
            background-color: #1e1e2f !important;
        }
        body.dark-mode tbody tr:nth-child(even) {
            background-color: #1a1a2e !important;
        }

        /* Footer */
        body.dark-mode footer,
        body.dark-mode .footer {
            background-color: #0d0d15 !important;
        }

        /* Specific Section 7 elements that need overriding */
        body.dark-mode #viz-solutions-impact .solution-card {
            background: linear-gradient(135deg, #1e1e2f 0%, #2d2d44 100%) !important;
            border-color: #3d3d5c !important;
        }
        body.dark-mode #viz-solutions-impact .solution-card:hover {
            border-color: #20c997 !important;
        }
        body.dark-mode #viz-solutions-impact .solution-card.active {
            background: linear-gradient(135deg, #1a3d2e 0%, #2d4d3e 100%) !important;
            border-color: #20c997 !important;
        }
        body.dark-mode #viz-solutions-impact .solution-title {
            color: #e0e0e0 !important;
        }
        body.dark-mode #viz-solutions-impact .solution-detail {
            background: #1e1e2f !important;
            border-left-color: #20c997 !important;
        }
        body.dark-mode #viz-solutions-impact .solution-detail h5 {
            color: #20c997 !important;
        }
        body.dark-mode #viz-solutions-impact .solution-detail p {
            color: #b0b0b0 !important;
        }

        body.dark-mode #viz-personal-calculator .action-item {
            background: #1e1e2f !important;
            border-color: #3d3d5c !important;
        }
        body.dark-mode #viz-personal-calculator .action-item:hover {
            background: #2d2d44 !important;
        }
        body.dark-mode #viz-personal-calculator .action-item.checked {
            background: #1a3d2e !important;
            border-color: #20c997 !important;
        }
        body.dark-mode #viz-personal-calculator .action-text {
            color: #e0e0e0 !important;
        }
        body.dark-mode #viz-personal-calculator .result-message {
            background: #1e1e2f !important;
            color: #b0b0b0 !important;
        }
        body.dark-mode #viz-personal-calculator .result-message.excellent {
            background: #1a3d2e !important;
            color: #20c997 !important;
        }

        body.dark-mode #viz-journey-recap .step-icon {
            background: #1e1e2f !important;
            border-color: #3d3d5c !important;
        }
        body.dark-mode #viz-journey-recap .step-title {
            color: #e0e0e0 !important;
        }
        body.dark-mode #viz-journey-recap .step-stat {
            background: #2d2d44 !important;
            color: #b0b0b0 !important;
        }
        body.dark-mode #viz-journey-recap .journey-path {
            background: #2d2d44 !important;
        }

        body.dark-mode #viz-future-roadmap .roadmap-item {
            background: #1e1e2f !important;
            border-color: #3d3d5c !important;
        }
        body.dark-mode #viz-future-roadmap .roadmap-item.past {
            background: linear-gradient(135deg, #1a3d2e 0%, #1e1e2f 100%) !important;
            border-color: #198754 !important;
        }
        body.dark-mode #viz-future-roadmap .roadmap-item.present {
            background: linear-gradient(135deg, #1a2d4e 0%, #1e1e2f 100%) !important;
            border-color: #0d6efd !important;
        }
        body.dark-mode #viz-future-roadmap .roadmap-item.future {
            background: linear-gradient(135deg, #2d1a4e 0%, #1e1e2f 100%) !important;
            border-color: #6f42c1 !important;
        }
        body.dark-mode #viz-future-roadmap .roadmap-title {
            color: #e0e0e0 !important;
        }
        body.dark-mode #viz-future-roadmap .roadmap-desc {
            color: #b0b0b0 !important;
        }
        body.dark-mode #viz-future-roadmap .roadmap-stat {
            background: rgba(255,255,255,0.05) !important;
        }

        /* Testimonials / Team */
        body.dark-mode .testimonial-item {
            background-color: #1e1e2f !important;
        }

        /* Spinner */
        body.dark-mode #spinner {
            background-color: #121212 !important;
        }

        /* Scrollbar */
        body.dark-mode::-webkit-scrollbar {
            width: 10px;
        }
        body.dark-mode::-webkit-scrollbar-track {
            background: #1a1a2e;
        }
        body.dark-mode::-webkit-scrollbar-thumb {
            background: #3d3d5c;
            border-radius: 5px;
        }
        body.dark-mode::-webkit-scrollbar-thumb:hover {
            background: #4d4d6c;
        }

        /* ========================================================
           D3 CHARTS & SVG ELEMENTS - COMPREHENSIVE DARK MODE
           ======================================================== */
        
        /* SVG Global Text Styling */
        body.dark-mode svg text {
            fill: #e0e0e0 !important;
        }
        body.dark-mode svg text.axis-label,
        body.dark-mode svg .axis-label {
            fill: #b0b0b0 !important;
        }
        
        /* D3 Axes */
        body.dark-mode svg .axis text,
        body.dark-mode svg .tick text,
        body.dark-mode svg g.axis text {
            fill: #b0b0b0 !important;
        }
        body.dark-mode svg .axis line,
        body.dark-mode svg .tick line,
        body.dark-mode svg .domain,
        body.dark-mode svg g.axis line,
        body.dark-mode svg g.axis path {
            stroke: #4a4a6a !important;
        }
        
        /* Grid Lines */
        body.dark-mode svg .grid line,
        body.dark-mode svg .grid-line,
        body.dark-mode svg line.grid-line {
            stroke: #3d3d5c !important;
            opacity: 0.4 !important;
        }
        
        /* Hardcoded text colors in charts - override to light colors */
        body.dark-mode svg text[fill="#333"],
        body.dark-mode svg text[fill="#666"],
        body.dark-mode svg text[fill="#6c757d"],
        body.dark-mode svg text[fill="#111827"],
        body.dark-mode svg text[fill="#6b7280"],
        body.dark-mode svg text[fill="black"],
        body.dark-mode svg text[fill="#000"],
        body.dark-mode svg text[fill="#000000"] {
            fill: #b0b0b0 !important;
        }
        
        /* Hardcoded stroke colors - make visible in dark mode */
        body.dark-mode svg line[stroke="#e0e0e0"],
        body.dark-mode svg line[stroke="#ddd"],
        body.dark-mode svg line[stroke="#ccc"],
        body.dark-mode svg path[stroke="#e0e0e0"],
        body.dark-mode svg path[stroke="#ddd"] {
            stroke: #3d3d5c !important;
        }
        
        /* SVG rect backgrounds (for chart backgrounds) */
        body.dark-mode svg rect[fill="#fff"],
        body.dark-mode svg rect[fill="#ffffff"],
        body.dark-mode svg rect[fill="white"] {
            fill: #1e1e2f !important;
        }
        
        /* D3 Tooltips (multiple patterns) */
        body.dark-mode .d3-tooltip,
        body.dark-mode .tooltip,
        body.dark-mode .chart-tooltip,
        body.dark-mode #tooltip,
        body.dark-mode .sec1-tooltip,
        body.dark-mode div[class*="tooltip"] {
            background: linear-gradient(135deg, rgba(30,30,46,0.98), rgba(45,45,68,0.98)) !important;
            color: #e0e0e0 !important;
            border: 1px solid #4a4a6a !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
        }
        body.dark-mode .tooltip-title,
        body.dark-mode .tooltip-value,
        body.dark-mode .tooltip-label {
            color: #e0e0e0 !important;
        }
        body.dark-mode .tooltip-title {
            color: #20c997 !important;
        }
        
        /* Chart Containers & Wrappers - Be specific to avoid overriding sections */
        body.dark-mode .chart-container,
        body.dark-mode .viz-container,
        body.dark-mode [class*="chart-wrapper"] {
            background-color: #1e1e2f !important;
        }
        
        /* Viz-card is the graph frame - needs special styling */
        body.dark-mode .viz-card {
            background: linear-gradient(145deg, #1e1e2f 0%, #252540 100%) !important;
            border: 1px solid #3d3d5c !important;
            box-shadow: 
                0 2px 4px rgba(0, 0, 0, 0.2),
                0 8px 24px rgba(0, 0, 0, 0.3) !important;
        }
        body.dark-mode .viz-card::before {
            background: linear-gradient(90deg, #20c997 0%, #667eea 100%) !important;
        }
        body.dark-mode .viz-card:hover {
            box-shadow: 
                0 4px 8px rgba(0, 0, 0, 0.3),
                0 12px 32px rgba(32, 201, 151, 0.15) !important;
        }
        body.dark-mode .viz-card h5,
        body.dark-mode .viz-card h6 {
            color: #e0e0e0 !important;
        }
        body.dark-mode .viz-card h5 i {
            color: #20c997 !important;
        }
        body.dark-mode .viz-card .text-muted {
            color: #888 !important;
        }
        body.dark-mode .viz-card p {
            color: #b0b0b0 !important;
        }
        
        /* Legend Items */
        body.dark-mode .legend text,
        body.dark-mode .legend-item,
        body.dark-mode .legend-item span,
        body.dark-mode [class*="legend"] {
            color: #b0b0b0 !important;
        }
        body.dark-mode .legend-item .dot,
        body.dark-mode .legend-item .line-dot {
            box-shadow: 0 0 0 2px rgba(255,255,255,0.1);
        }
        
        /* ========== SECTION 1: WHY IT MATTERS ========== */
        body.dark-mode .counter-card,
        body.dark-mode #sec1-counter-dashboard .counter-card {
            background: linear-gradient(135deg, #1e1e2f 0%, #2d2d44 100%) !important;
            border: 1px solid #3d3d5c !important;
        }
        body.dark-mode .counter-label {
            color: #b0b0b0 !important;
        }
        body.dark-mode .counter-icon-wrapper {
            background: rgba(255,255,255,0.05) !important;
        }
        body.dark-mode #sec1-energy-chart,
        body.dark-mode #sec1-device-metaphor,
        body.dark-mode #sec1-transition,
        body.dark-mode #viz-laptop-breakdown {
            background-color: transparent !important;
        }
        body.dark-mode #sec1-energy-chart .action-label,
        body.dark-mode #sec1-energy-chart .value-label {
            fill: #e0e0e0 !important;
        }
        body.dark-mode #sec1-energy-chart .energy-bar-bg {
            fill: #2d2d44 !important;
        }
        body.dark-mode #sec1-energy-chart svg text,
        body.dark-mode #sec1-device-metaphor svg text,
        body.dark-mode #viz-laptop-breakdown svg text {
            fill: #b0b0b0 !important;
        }
        
        /* ========== SECTION 2: SERVERS & DATA CENTERS (Energy Proportionality) ========== */
        /* Section 2 main container */
        body.dark-mode #servers {
            background: linear-gradient(180deg, #121212 0%, #1a1a2e 50%, #1e1e2f 100%) !important;
        }
        body.dark-mode #servers h1,
        body.dark-mode #servers h4 {
            color: #ffffff !important;
        }
        body.dark-mode #servers p {
            color: #b0b0b0 !important;
        }
        body.dark-mode #servers .section-title {
            background-color: #1e1e2f !important;
            color: #20c997 !important;
        }
        /* Section 2 chart container card */
        body.dark-mode #servers .bg-white {
            background-color: #1e1e2f !important;
        }
        body.dark-mode #servers .shadow-sm {
            box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
        }
        /* Section 2 scroller and SVGs */
        body.dark-mode #servers-3d-container {
            background-color: transparent !important;
        }
        body.dark-mode #servers-3d-container svg {
            background: #1a1a2e !important;
            border-color: #3d3d5c !important;
        }
        body.dark-mode #servers-3d-container svg text {
            fill: #b0b0b0 !important;
        }
        body.dark-mode #servers-3d-container svg .domain,
        body.dark-mode #servers-3d-container svg .tick line {
            stroke: #4a4a6a !important;
        }
        /* Scroller wrapper and buttons */
        body.dark-mode .scroller-wrapper {
            background-color: #1a1a2e !important;
        }
        body.dark-mode #servers-3d-container button,
        body.dark-mode .scroller-wrapper button,
        body.dark-mode .scroll-btn {
            background-color: #2d2d44 !important;
            color: #e0e0e0 !important;
            border-color: #4a4a6a !important;
        }
        body.dark-mode #servers-3d-container button:hover,
        body.dark-mode .scroller-wrapper button:hover,
        body.dark-mode .scroll-btn:hover {
            background-color: #3d3d5c !important;
            color: #20c997 !important;
        }
        /* Dot indicators - override inline styles */
        body.dark-mode #servers-3d-container > div > span {
            background-color: #4a4a6a !important;
        }
        body.dark-mode #servers-3d-container > div > span[style*="rgb(44, 160, 44)"],
        body.dark-mode #servers-3d-container > div > span[style*="#2ca02c"] {
            background-color: #20c997 !important;
        }
        body.dark-mode .dot-indicators span,
        body.dark-mode .carousel-dot {
            background-color: #4a4a6a !important;
        }
        body.dark-mode .dot-indicators span.active,
        body.dark-mode .carousel-dot.active {
            background-color: #20c997 !important;
        }
        body.dark-mode .section-card,
        body.dark-mode .scroll-section {
            background-color: #1e1e2f !important;
            border-color: #3d3d5c !important;
        }
        
        /* ========== SECTION 3: DATA CENTER ENERGY SPLIT (d3charts.js) ========== */
        /* Section 3 main container */
        body.dark-mode #network {
            background: linear-gradient(180deg, #121212 0%, #1a1a2e 50%, #1e1e2f 100%) !important;
        }
        body.dark-mode #network::before {
            background: linear-gradient(135deg, rgba(32, 201, 151, 0.03) 0%, rgba(102, 126, 234, 0.03) 100%) !important;
        }
        body.dark-mode #network h1,
        body.dark-mode #network h2 {
            color: #ffffff !important;
        }
        body.dark-mode #network p {
            color: #b0b0b0 !important;
        }
        body.dark-mode #network .section-title {
            background-color: #1e1e2f !important;
            color: #20c997 !important;
        }
        /* Section 3 chart containers - transparent to show viz-card background */
        body.dark-mode #viz-energy-split,
        body.dark-mode #viz-digital-growth,
        body.dark-mode #viz-energy-growth {
            background-color: transparent !important;
        }
        body.dark-mode #viz-energy-split svg text,
        body.dark-mode #viz-digital-growth svg text,
        body.dark-mode #viz-energy-growth svg text {
            fill: #e0e0e0 !important;
        }
        body.dark-mode #viz-energy-split text[fill="#333"],
        body.dark-mode #viz-energy-split text[fill="#666"] {
            fill: #b0b0b0 !important;
        }
        body.dark-mode #energy-split-donut-container span,
        body.dark-mode #energy-split-donut-container div {
            color: #b0b0b0 !important;
        }
        /* Section 3 stat cards */
        body.dark-mode #network .stat-card-s3.bg-secondary,
        body.dark-mode .stat-card-s3.bg-secondary {
            background-color: #2d2d44 !important;
        }
        body.dark-mode #network .stat-card-s3.bg-secondary h2,
        body.dark-mode .stat-card-s3.bg-secondary h2 {
            color: #e0e0e0 !important;
        }
        body.dark-mode #network .stat-card-s3.bg-secondary span,
        body.dark-mode .stat-card-s3.bg-secondary span {
            color: #20c997 !important;
        }
        /* Section 3 description text */
        body.dark-mode #network .fs-5,
        body.dark-mode #network .mb-4 {
            color: #b0b0b0 !important;
        }
        body.dark-mode #network i.fas,
        body.dark-mode #network i.fab {
            color: inherit;
        }
        
        /* ========== SECTION 4: CALIFORNIA IMPACT (California.js) ========== */
        body.dark-mode #california-impact-chart,
        body.dark-mode #california-vs-us-chart,
        body.dark-mode #emission-factors-chart,
        body.dark-mode #efficiency-metrics-chart,
        body.dark-mode #water-breakdown-chart,
        body.dark-mode #health-costs-chart,
        body.dark-mode #ca-share-chart {
            background-color: transparent !important;
        }
        body.dark-mode #california-impact-chart svg text,
        body.dark-mode #california-vs-us-chart svg text,
        body.dark-mode #emission-factors-chart svg text,
        body.dark-mode #efficiency-metrics-chart svg text,
        body.dark-mode #water-breakdown-chart svg text,
        body.dark-mode #health-costs-chart svg text,
        body.dark-mode #ca-share-chart svg text {
            fill: #b0b0b0 !important;
        }
        body.dark-mode #california-metric-toggles .btn-outline-primary {
            color: #e0e0e0 !important;
            border-color: #4a4a6a !important;
        }
        body.dark-mode #california-metric-toggles .btn-outline-primary:hover {
            background-color: #2d2d44 !important;
            color: #20c997 !important;
        }
        body.dark-mode #california-metric-toggles .btn-primary {
            background-color: #20c997 !important;
            border-color: #20c997 !important;
        }
        
        /* ========== SECTION 5: GOOGLE PUE & CLOUD DATA ========== */
        /* Section 5 main container */
        body.dark-mode #global {
            background: linear-gradient(180deg, #121212 0%, #1a1a2e 50%, #1e1e2f 100%) !important;
        }
        body.dark-mode #global::before {
            background: linear-gradient(135deg, rgba(32, 201, 151, 0.03) 0%, rgba(102, 126, 234, 0.03) 100%) !important;
        }
        body.dark-mode #global h1,
        body.dark-mode #global h2 {
            color: #ffffff !important;
        }
        body.dark-mode #global p {
            color: #b0b0b0 !important;
        }
        body.dark-mode #global .section-title {
            background-color: #1e1e2f !important;
            color: #20c997 !important;
        }
        body.dark-mode #global .fs-5 {
            color: #b0b0b0 !important;
        }
        /* Section 5 PUE chart SVG text */
        body.dark-mode .pue-chart svg text,
        body.dark-mode #google-pue-chart svg text,
        body.dark-mode #cloud-emissions-chart svg text,
        body.dark-mode #viz-pue-timeline svg text,
        body.dark-mode #viz-provider-comparison svg text,
        body.dark-mode #viz-cfe-timeline svg text,
        body.dark-mode #viz-region-emissions svg text,
        body.dark-mode #viz-pue-stats svg text,
        body.dark-mode #viz-pue-comparison svg text,
        body.dark-mode #viz-pue-regions svg text,
        body.dark-mode #viz-renewable-compare svg text,
        body.dark-mode #viz-pue-map svg text {
            fill: #b0b0b0 !important;
        }
        /* Section 5 chart containers - transparent to show viz-card background */
        body.dark-mode #viz-pue-timeline,
        body.dark-mode #viz-pue-stats,
        body.dark-mode #viz-pue-comparison,
        body.dark-mode #viz-pue-regions,
        body.dark-mode #viz-renewable-compare,
        body.dark-mode #viz-pue-map {
            background-color: transparent !important;
        }
        /* Section 5 PUE info boxes (2.0 and 1.1 boxes) */
        body.dark-mode #global .bg-light {
            background-color: #2d2d44 !important;
        }
        body.dark-mode #global .bg-light .display-6 {
            color: inherit;
        }
        body.dark-mode #global .bg-light p {
            color: #b0b0b0 !important;
        }
        body.dark-mode #global .bg-light small {
            color: #888 !important;
        }
        /* Section 5 stat row (gray bg-light boxes in row) */
        body.dark-mode #global .row.g-3 .bg-light {
            background-color: #2d2d44 !important;
            border: 1px solid #3d3d5c !important;
        }
        body.dark-mode #global .row.g-3 .bg-light .display-6.text-danger {
            color: #ef4444 !important;
        }
        body.dark-mode #global .row.g-3 .bg-light .display-6.text-success {
            color: #20c997 !important;
        }
        body.dark-mode #global .row.g-3 .bg-light p {
            color: #b0b0b0 !important;
        }
        body.dark-mode #global .row.g-3 .bg-light strong {
            color: #e0e0e0 !important;
        }
        
        /* ========== SECTION 6: UCBL1 DASHBOARD (sec6v2.js) ========== */
        /* Section 6 main container */
        body.dark-mode #ucbl {
            background: linear-gradient(180deg, #121212 0%, #1a1a2e 50%, #1e1e2f 100%) !important;
        }
        body.dark-mode #ucbl h1,
        body.dark-mode #ucbl h2,
        body.dark-mode #ucbl h4,
        body.dark-mode #ucbl h5 {
            color: #ffffff !important;
        }
        body.dark-mode #ucbl p {
            color: #b0b0b0 !important;
        }
        body.dark-mode #ucbl .section-title {
            background-color: #1e1e2f !important;
            color: #20c997 !important;
        }
        /* Chart containers */
        body.dark-mode #c1, body.dark-mode #c2, body.dark-mode #c3,
        body.dark-mode #c4, body.dark-mode #c5, body.dark-mode #c6,
        body.dark-mode #c7 {
            background-color: #1e1e2f !important;
        }
        body.dark-mode #c1 svg, body.dark-mode #c2 svg,
        body.dark-mode #c3 svg, body.dark-mode #c4 svg,
        body.dark-mode #c5 svg, body.dark-mode #c6 svg,
        body.dark-mode #c7 svg {
            background-color: transparent !important;
        }
        body.dark-mode #c1 svg text, body.dark-mode #c2 svg text,
        body.dark-mode #c3 svg text, body.dark-mode #c4 svg text,
        body.dark-mode #c5 svg text, body.dark-mode #c6 svg text,
        body.dark-mode #c7 svg text {
            fill: #b0b0b0 !important;
        }
        /* Heatmap specific styling */
        body.dark-mode #c7 {
            background-color: #1a1a2e !important;
        }
        body.dark-mode #c7 svg rect[stroke="#111827"] {
            stroke: #20c997 !important;
        }
        body.dark-mode .chart-card,
        body.dark-mode .dashboard-card {
            background: linear-gradient(135deg, #1e1e2f 0%, #252540 100%) !important;
            border: 1px solid #3d3d5c !important;
        }
        body.dark-mode .chart-title,
        body.dark-mode .card-title {
            color: #e0e0e0 !important;
        }
        body.dark-mode .chart-subtitle {
            color: #888 !important;
        }
        /* Section 6 legend items */
        body.dark-mode #l1, body.dark-mode #l2, body.dark-mode #l3,
        body.dark-mode #l4, body.dark-mode #l5, body.dark-mode #l6,
        body.dark-mode #l7 {
            color: #b0b0b0 !important;
        }
        body.dark-mode #l1 *, body.dark-mode #l2 *, body.dark-mode #l3 *,
        body.dark-mode #l4 *, body.dark-mode #l5 *, body.dark-mode #l6 *,
        body.dark-mode #l7 * {
            color: #b0b0b0 !important;
        }
        
        /* Filter Panel */
        body.dark-mode .filter-panel,
        body.dark-mode .filters-container {
            background: #1a1a2e !important;
            border-color: #3d3d5c !important;
        }
        body.dark-mode .filter-chip {
            background: #2d2d44 !important;
            color: #b0b0b0 !important;
            border: 1px solid #3d3d5c !important;
        }
        body.dark-mode .filter-chip:hover {
            background: #3d3d5c !important;
            color: #e0e0e0 !important;
        }
        body.dark-mode .filter-chip.active {
            background: #20c997 !important;
            color: #1a1a2e !important;
            border-color: #20c997 !important;
        }
        body.dark-mode .active-filter-tag {
            background: #2d2d44 !important;
            color: #e0e0e0 !important;
        }
        body.dark-mode .filter-label {
            color: #b0b0b0 !important;
        }
        
        /* Donut chart center text */
        body.dark-mode svg text[fill="#111827"],
        body.dark-mode svg text[fill="#6b7280"] {
            fill: #b0b0b0 !important;
        }
        
        /* Data Points */
        body.dark-mode .data-point {
            stroke: #1e1e2f !important;
        }
        
        /* ========== HEATMAP SPECIFIC ========== */
        body.dark-mode .heatmap-container {
            background: #1e1e2f !important;
        }
        body.dark-mode .heatmap-cell {
            stroke: #2d2d44 !important;
        }
        body.dark-mode .heatmap-label {
            fill: #b0b0b0 !important;
        }
        
        /* ========== BAR CHARTS ========== */
        body.dark-mode rect.bar-bg,
        body.dark-mode .bar-background {
            fill: #2d2d44 !important;
        }
        
        /* ========== LINE CHARTS ========== */
        body.dark-mode .area-fill {
            opacity: 0.3 !important;
        }
        
        /* ========== TIMELINE & ROADMAP ========== */
        body.dark-mode .timeline-item,
        body.dark-mode .timeline-card {
            background: #1e1e2f !important;
            border-color: #3d3d5c !important;
        }
        body.dark-mode .timeline-line,
        body.dark-mode .timeline-connector {
            background: #4a4a6a !important;
        }
        body.dark-mode .timeline-dot {
            border-color: #4a4a6a !important;
            background: #1e1e2f !important;
        }
        body.dark-mode .timeline-dot.active {
            background: #20c997 !important;
            border-color: #20c997 !important;
        }
        
        /* ========== STAT BOXES & METRICS ========== */
        body.dark-mode .stat-box,
        body.dark-mode .metric-card,
        body.dark-mode .info-box {
            background: #1e1e2f !important;
            border-color: #3d3d5c !important;
        }
        body.dark-mode .stat-value,
        body.dark-mode .metric-value {
            color: #20c997 !important;
        }
        body.dark-mode .stat-label,
        body.dark-mode .metric-label {
            color: #b0b0b0 !important;
        }
        
        /* ========== INTERACTIVE ELEMENTS ========== */
        body.dark-mode .clickable-element:hover,
        body.dark-mode svg rect:hover,
        body.dark-mode svg path:hover {
            filter: brightness(1.1);
        }
        
        /* ========== SECTION HEADERS & DESCRIPTIONS ========== */
        body.dark-mode .section-header h2,
        body.dark-mode .section-heading {
            color: #ffffff !important;
        }
        body.dark-mode .section-description,
        body.dark-mode .section-subtitle {
            color: #b0b0b0 !important;
        }
        
        /* ========== CHART INFO BOXES ========== */
        body.dark-mode .insight-box,
        body.dark-mode .annotation-box {
            background: rgba(32, 201, 151, 0.1) !important;
            border-color: #20c997 !important;
            color: #b0b0b0 !important;
        }
        body.dark-mode .source-text,
        body.dark-mode .data-source {
            color: #666 !important;
        }
        
        /* ========== PROGRESS BARS ========== */
        body.dark-mode .progress {
            background-color: #2d2d44 !important;
        }
        body.dark-mode .progress-bar {
            background-color: #20c997 !important;
        }
        
        /* ========== ALERT & INFO BOXES ========== */
        body.dark-mode .alert-info {
            background-color: rgba(32, 201, 151, 0.1) !important;
            border-color: #20c997 !important;
            color: #b0b0b0 !important;
        }
        body.dark-mode .alert-warning {
            background-color: rgba(255, 193, 7, 0.1) !important;
            border-color: #ffc107 !important;
            color: #ffc107 !important;
        }
        
        /* ========== CAROUSEL & SLIDERS ========== */
        body.dark-mode .carousel,
        body.dark-mode .owl-carousel {
            background: transparent !important;
        }
        body.dark-mode .carousel-control-prev,
        body.dark-mode .carousel-control-next {
            background: rgba(45, 45, 68, 0.8) !important;
        }
        body.dark-mode .carousel-indicators button {
            background-color: #4a4a6a !important;
        }
        body.dark-mode .carousel-indicators button.active {
            background-color: #20c997 !important;
        }
        
        /* ========== MODALS ========== */
        body.dark-mode .modal-content {
            background-color: #1e1e2f !important;
            border-color: #3d3d5c !important;
        }
        body.dark-mode .modal-header,
        body.dark-mode .modal-footer {
            border-color: #3d3d5c !important;
        }
        body.dark-mode .modal-title {
            color: #e0e0e0 !important;
        }
        
        /* ========== ACCORDIONS ========== */
        body.dark-mode .accordion-item {
            background-color: #1e1e2f !important;
            border-color: #3d3d5c !important;
        }
        body.dark-mode .accordion-button {
            background-color: #1e1e2f !important;
            color: #e0e0e0 !important;
        }
        body.dark-mode .accordion-button:not(.collapsed) {
            background-color: #2d2d44 !important;
            color: #20c997 !important;
        }
        body.dark-mode .accordion-body {
            background-color: #1a1a2e !important;
            color: #b0b0b0 !important;
        }
        
        /* ========== BADGES ========== */
        body.dark-mode .badge.bg-light {
            background-color: #2d2d44 !important;
            color: #e0e0e0 !important;
        }
        body.dark-mode .badge.bg-secondary {
            background-color: #4a4a6a !important;
        }
        
        /* ========== HORIZONTAL RULES & DIVIDERS ========== */
        body.dark-mode hr {
            border-color: #3d3d5c !important;
            opacity: 0.3;
        }
        body.dark-mode .divider {
            background-color: #3d3d5c !important;
        }
        
        /* ========== ICONS ========== */
        body.dark-mode .fa, body.dark-mode .fas, 
        body.dark-mode .far, body.dark-mode .fab,
        body.dark-mode i[class*="fa-"] {
            color: inherit;
        }
        
        /* ========== LINKS ========== */
        body.dark-mode a:not(.btn):not(.nav-link) {
            color: #20c997;
        }
        body.dark-mode a:not(.btn):not(.nav-link):hover {
            color: #3dd5aa;
        }
        
        /* ========== LIST GROUPS ========== */
        body.dark-mode .list-group-item {
            background-color: #1e1e2f !important;
            border-color: #3d3d5c !important;
            color: #e0e0e0 !important;
        }
        body.dark-mode .list-group-item:hover {
            background-color: #2d2d44 !important;
        }
        
        /* ========== BLOCKQUOTES ========== */
        body.dark-mode blockquote {
            border-left-color: #20c997 !important;
            background: rgba(32, 201, 151, 0.05) !important;
            color: #b0b0b0 !important;
        }
        
        /* ========== CODE BLOCKS ========== */
        body.dark-mode code {
            background-color: #2d2d44 !important;
            color: #20c997 !important;
        }
        body.dark-mode pre {
            background-color: #1a1a2e !important;
            border-color: #3d3d5c !important;
        }
        
        /* ========== IMAGE PLACEHOLDERS ========== */
        body.dark-mode .img-placeholder,
        body.dark-mode .skeleton {
            background: linear-gradient(90deg, #2d2d44 25%, #3d3d5c 50%, #2d2d44 75%) !important;
        }

        /* Smooth transition for all elements */
        body, body * {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, fill 0.3s ease;
        }
        
        /* Exclude SVG animations from transition */
        body svg *, body svg {
            transition: fill 0.3s ease !important;
        }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = darkModeStyles;
    document.head.appendChild(styleSheet);

    // Create toggle button
    function createToggleButton() {
        const button = document.createElement('button');
        button.className = 'dark-mode-toggle';
        button.setAttribute('aria-label', 'Toggle dark mode');
        button.setAttribute('title', 'Toggle dark mode');
        button.innerHTML = `
            <span class="icon-moon">🌙</span>
            <span class="icon-sun">☀️</span>
        `;
        document.body.appendChild(button);

        // Check for saved preference
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'enabled') {
            document.body.classList.add('dark-mode');
        }

        // Toggle handler
        button.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            // Save preference
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
            } else {
                localStorage.setItem('darkMode', 'disabled');
            }
        });
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createToggleButton);
    } else {
        createToggleButton();
    }

})();
