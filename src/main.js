import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Configuration
const DATA_URL = '../data/EfficiencyAnalysis - The CHIP Dataset.csv';

// Global State
let scene, camera, renderer, controls;
let points; // The current point cloud
let raycaster, pointer;
let currentViz = document.body.dataset.viz || 'transistors'; // Read from HTML
let rawData = []; // Store parsed CSV data

// DOM Elements
const tooltip = document.getElementById('tooltip');
const axisInfo = document.getElementById('axis-info');
const legend = document.getElementById('legend');

// Initialize Application
init();

function init() {
    // 1. Setup Three.js Scene
    setupScene();

    // 2. Setup Interaction
    setupInteraction();

    // 3. Load Data
    loadData();

    // 4. Animation Loop
    animate();
}

function setupScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.FogExp2(0x050505, 0.002);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(80, 60, 120);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 500;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(100, 100, 50);
    scene.add(dirLight);

    // Grid
    const gridHelper = new THREE.GridHelper(200, 40, 0x333333, 0x111111);
    scene.add(gridHelper);

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function setupInteraction() {
    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 1.5; // Easier to hit points
    pointer = new THREE.Vector2();

    window.addEventListener('pointermove', (event) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        tooltip.style.left = event.clientX + 15 + 'px';
        tooltip.style.top = event.clientY + 15 + 'px';
    });
}

function loadData() {
    Papa.parse(DATA_URL, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            rawData = results.data;
            console.log(`Loaded ${rawData.length} rows.`);
            // Initial Render based on currentViz
            if (currentViz === 'transistors') {
                renderTransistorsViz();
            } else if (currentViz === 'performance') {
                renderPerformanceViz();
            }
        },
        error: function(err) {
            console.error("Error loading CSV:", err);
            axisInfo.innerText = "Error loading data.";
        }
    });
}

function switchViz(vizType) {
    if (points) {
        scene.remove(points);
        points.geometry.dispose();
        points.material.dispose();
        points = null;
    }
    // No UI update needed here as pages are separate
}

// ==========================================
// VIZ 1: Transistors vs Process Size
// ==========================================
function renderTransistorsViz() {
    axisInfo.innerHTML = "X: Release Year | Y: Transistors (Log Scale) | Z: Process Size (nm)";
    
    // Update Legend
    legend.innerHTML = `
        <div class="legend-item"><div class="color-box" style="background: #ff0000;"></div>AMD</div>
        <div class="legend-item"><div class="color-box" style="background: #0000ff;"></div>Intel</div>
        <div class="legend-item"><div class="color-box" style="background: #00ff00;"></div>NVIDIA</div>
        <div class="legend-item"><div class="color-box" style="background: #ff00ff;"></div>ATI</div>
        <div class="legend-item"><div class="color-box" style="background: #ffffff;"></div>Other</div>
    `;

    const processedData = [];
    let minYear = Infinity, maxYear = -Infinity;
    let minTrans = Infinity, maxTrans = -Infinity;
    let minProcess = Infinity, maxProcess = -Infinity;

    rawData.forEach(row => {
        if (!row['Release Date'] || !row['Transistors (million)'] || !row['Process Size (nm)']) return;

        const date = new Date(row['Release Date']);
        if (isNaN(date.getTime())) return;
        
        const year = date.getFullYear() + (date.getMonth() / 12);
        const transistors = parseFloat(row['Transistors (million)']);
        const processSize = parseFloat(row['Process Size (nm)']);

        if (isNaN(transistors) || isNaN(processSize)) return;

        minYear = Math.min(minYear, year);
        maxYear = Math.max(maxYear, year);
        
        const logTrans = Math.log10(transistors);
        minTrans = Math.min(minTrans, logTrans);
        maxTrans = Math.max(maxTrans, logTrans);

        minProcess = Math.min(minProcess, processSize);
        maxProcess = Math.max(maxProcess, processSize);

        processedData.push({
            original: row,
            year,
            transistors,
            logTrans,
            processSize
        });
    });

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const colorObj = new THREE.Color();

    const xScale = 100; 
    const yScale = 60;  
    const zScale = 60;  

    processedData.forEach((d) => {
        const x = ((d.year - minYear) / (maxYear - minYear) - 0.5) * xScale;
        const y = ((d.logTrans - minTrans) / (maxTrans - minTrans)) * yScale;
        const z = ((d.processSize - minProcess) / (maxProcess - minProcess) - 0.5) * zScale;

        positions.push(x, y, z);

        const vendor = d.original['Vendor'];
        if (vendor === 'AMD') colorObj.set(0xff0000);
        else if (vendor === 'Intel') colorObj.set(0x0000ff);
        else if (vendor === 'NVIDIA') colorObj.set(0x00ff00);
        else if (vendor === 'ATI') colorObj.set(0xff00ff);
        else colorObj.set(0xffffff);

        colors.push(colorObj.r, colorObj.g, colorObj.b);
        d.position = new THREE.Vector3(x, y, z);
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ 
        size: 1.5, 
        vertexColors: true,
        sizeAttenuation: true 
    });

    points = new THREE.Points(geometry, material);
    points.userData = { data: processedData, type: 'transistors' };
    scene.add(points);
}

// ==========================================
// VIZ 2: Performance (Freq vs TDP)
// ==========================================
function renderPerformanceViz() {
    axisInfo.innerHTML = "X: Release Year | Y: Frequency (MHz) | Z: TDP (Watts)";

    // Update Legend
    legend.innerHTML = `
        <div class="legend-item"><div class="color-box" style="background: #4facfe;"></div>CPU</div>
        <div class="legend-item"><div class="color-box" style="background: #ff0055;"></div>GPU</div>
        <div class="legend-item"><div class="color-box" style="background: #aaaaaa;"></div>Other</div>
    `;

    const processedData = [];
    let minYear = Infinity, maxYear = -Infinity;
    let minFreq = Infinity, maxFreq = -Infinity;
    let minTDP = Infinity, maxTDP = -Infinity;

    rawData.forEach(row => {
        if (!row['Release Date'] || !row['Freq (GHz)'] || !row['TDP (W)']) return;

        const date = new Date(row['Release Date']);
        if (isNaN(date.getTime())) return;
        
        const year = date.getFullYear() + (date.getMonth() / 12);
        let freq = parseFloat(row['Freq (GHz)']); // Assuming MHz based on previous analysis
        const tdp = parseFloat(row['TDP (W)']);

        if (isNaN(freq) || isNaN(tdp)) return;

        minYear = Math.min(minYear, year);
        maxYear = Math.max(maxYear, year);
        minFreq = Math.min(minFreq, freq);
        maxFreq = Math.max(maxFreq, freq);
        minTDP = Math.min(minTDP, tdp);
        maxTDP = Math.max(maxTDP, tdp);

        processedData.push({
            original: row,
            year,
            freq,
            tdp,
            type: row['Type']
        });
    });

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    const colorCPU = new THREE.Color(0x4facfe);
    const colorGPU = new THREE.Color(0xff0055);
    const colorOther = new THREE.Color(0xaaaaaa);

    const xScale = 120;
    const yScale = 60;
    const zScale = 60;

    processedData.forEach((d) => {
        const x = ((d.year - minYear) / (maxYear - minYear) - 0.5) * xScale;
        const y = ((d.freq - minFreq) / (maxFreq - minFreq)) * yScale;
        const z = ((d.tdp - minTDP) / (maxTDP - minTDP) - 0.5) * zScale;

        positions.push(x, y, z);

        let c = colorOther;
        if (d.type === 'CPU') c = colorCPU;
        else if (d.type === 'GPU') c = colorGPU;

        colors.push(c.r, c.g, c.b);
        d.position = new THREE.Vector3(x, y, z);
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Use sprite for glow effect
    const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');

    const material = new THREE.PointsMaterial({ 
        size: 1.5, 
        vertexColors: true,
        map: sprite,
        alphaTest: 0.5,
        transparent: true,
        opacity: 0.8
    });

    points = new THREE.Points(geometry, material);
    points.userData = { data: processedData, type: 'performance' };
    scene.add(points);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Raycasting
    if (points) {
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(points);

        if (intersects.length > 0) {
            const index = intersects[0].index;
            const data = points.userData.data[index];
            const vizType = points.userData.type;
            
            tooltip.style.display = 'block';
            
            if (vizType === 'transistors') {
                tooltip.innerHTML = `
                    <strong>${data.original['Product']}</strong>
                    <span>Vendor:</span> ${data.original['Vendor']}<br>
                    <span>Year:</span> ${Math.floor(data.year)}<br>
                    <span>Transistors:</span> ${data.transistors} M<br>
                    <span>Process:</span> ${data.processSize} nm
                `;
            } else {
                tooltip.innerHTML = `
                    <strong>${data.original['Product']}</strong>
                    <span>Type:</span> ${data.original['Type']}<br>
                    <span>Year:</span> ${Math.floor(data.year)}<br>
                    <span>Freq:</span> ${data.freq} MHz<br>
                    <span>TDP:</span> ${data.tdp} W
                `;
            }
            document.body.style.cursor = 'pointer';
        } else {
            tooltip.style.display = 'none';
            document.body.style.cursor = 'default';
        }
    }

    renderer.render(scene, camera);
}
