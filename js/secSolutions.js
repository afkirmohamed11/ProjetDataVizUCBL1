/**
 * Solutions Section: Impact of Solutions & Personal Action Score
 * Self-contained visualization with research-based data
 * Author: Lokmane
 */

(function() {
    'use strict';

    // Inject scoped styles
    const styles = `
        /* ========== SOLUTIONS GRID ========== */
        #viz-solutions-impact .solutions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 12px;
        }
        #viz-solutions-impact .solution-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            padding: 18px 12px;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid transparent;
            position: relative;
            overflow: hidden;
        }
        #viz-solutions-impact .solution-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-color: #198754;
        }
        #viz-solutions-impact .solution-card.active {
            border-color: #198754;
            background: linear-gradient(135deg, #d1e7dd 0%, #badbcc 100%);
        }
        #viz-solutions-impact .solution-icon { font-size: 2rem; margin-bottom: 8px; display: block; }
        #viz-solutions-impact .solution-title { font-weight: 600; font-size: 0.85rem; color: #333; margin-bottom: 4px; }
        #viz-solutions-impact .solution-impact { font-size: 0.75rem; color: #198754; font-weight: 700; }
        #viz-solutions-impact .impact-bar { height: 4px; background: #dee2e6; border-radius: 2px; margin-top: 8px; overflow: hidden; }
        #viz-solutions-impact .impact-fill { height: 100%; background: linear-gradient(90deg, #198754, #20c997); border-radius: 2px; width: 0%; transition: width 1s ease; }
        #viz-solutions-impact .solution-detail { margin-top: 15px; padding: 15px; background: #fff; border-radius: 10px; border-left: 4px solid #198754; display: none; animation: secSolFadeIn 0.3s ease; }
        #viz-solutions-impact .solution-detail.show { display: block; }
        #viz-solutions-impact .solution-detail h5 { color: #198754; margin-bottom: 8px; font-size: 1rem; }
        #viz-solutions-impact .solution-detail p { color: #666; font-size: 0.85rem; margin: 0; }

        /* ========== PERSONAL CALCULATOR ========== */
        #viz-personal-calculator .calculator-container { text-align: center; }
        #viz-personal-calculator .score-ring { position: relative; width: 160px; height: 160px; margin: 0 auto 15px; }
        #viz-personal-calculator .score-ring svg { transform: rotate(-90deg); }
        #viz-personal-calculator .score-ring circle { fill: none; stroke-width: 10; }
        #viz-personal-calculator .score-ring .bg { stroke: #e9ecef; }
        #viz-personal-calculator .score-ring .progress { stroke: url(#scoreGradient); stroke-linecap: round; transition: stroke-dashoffset 0.8s ease; }
        #viz-personal-calculator .score-value { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
        #viz-personal-calculator .score-number { font-size: 2.2rem; font-weight: 700; color: #198754; line-height: 1; }
        #viz-personal-calculator .score-label { font-size: 0.75rem; color: #666; }
        #viz-personal-calculator .actions-list { text-align: left; max-height: 180px; overflow-y: auto; }
        #viz-personal-calculator .action-item { display: flex; align-items: center; padding: 8px 10px; margin-bottom: 6px; background: #fff; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; border: 1px solid #e9ecef; }
        #viz-personal-calculator .action-item:hover { background: #f8f9fa; }
        #viz-personal-calculator .action-item.checked { background: #d1e7dd; border-color: #198754; }
        #viz-personal-calculator .action-checkbox { width: 20px; height: 20px; border: 2px solid #adb5bd; border-radius: 50%; margin-right: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s ease; font-size: 0.7rem; }
        #viz-personal-calculator .action-item.checked .action-checkbox { background: #198754; border-color: #198754; color: #fff; }
        #viz-personal-calculator .action-text { flex: 1; font-size: 0.8rem; color: #333; }
        #viz-personal-calculator .action-points { font-size: 0.75rem; font-weight: 600; color: #198754; margin-left: 8px; }
        #viz-personal-calculator .result-message { margin-top: 12px; padding: 10px; border-radius: 8px; font-size: 0.85rem; background: #f8f9fa; color: #666; }
        #viz-personal-calculator .result-message.excellent { background: #d1e7dd; color: #0f5132; }

        @keyframes secSolFadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // ========== DATA ==========
    // Sources: IEA, Purdue University, The Shift Project, Carbon Trust, Greenspector
    const solutions = [
        { icon: '💻', title: 'Green Coding', impact: 15, detail: 'Efficient algorithms reduce CPU cycles by up to 40%. Simple optimizations like caching and reducing loops make a real difference.', source: 'Source: Greenspector (2021) - "Digital Sobriety: A study on software energy consumption"' },
        { icon: '🌙', title: 'Dark Mode', impact: 8, detail: 'OLED screens use up to 60% less power displaying dark colors. At 100% brightness, dark mode can save 39-47% of screen power.', source: 'Source: Purdue University (2021) - "How Much Energy Does Dark Mode Save?" published in MobiCom' },
        { icon: '☁️', title: 'Green Hosting', impact: 25, detail: 'Renewable-powered data centers can eliminate 100% of hosting carbon footprint. Google, Microsoft report 100% renewable energy matching.', source: 'Source: IEA Data Centres Report (2023) & Google Environmental Report (2023)' },
        { icon: '📉', title: 'Data Minimization', impact: 12, detail: 'Store only necessary data. Retention policies reduce storage needs by 30-50%. Each GB of cloud storage uses ~7 kWh/year.', source: 'Source: The Shift Project (2019) - "Lean ICT: Towards Digital Sobriety"' },
        { icon: '🔄', title: 'Edge Computing', impact: 20, detail: 'Processing data closer to users cuts network travel by 90%. Reduces latency and data center load.', source: 'Source: IEEE Transactions on Cloud Computing (2020) - "Energy Efficiency in Edge Computing"' },
        { icon: '📱', title: 'Device Longevity', impact: 18, detail: 'Extending device life from 2 to 4 years halves manufacturing emissions. 70-80% of a smartphone\'s carbon footprint is from manufacturing.', source: 'Source: European Environmental Bureau (2019) - "Coolproducts don\'t cost the Earth"' }
    ];

    // Points based on CO2 savings (1 point ≈ 1 kg CO2/year saved)
    // Sources: Mike Berners-Lee "How Bad Are Bananas?", Carbon Trust, IEA
    const personalActions = [
        { text: 'Stream in SD instead of 4K', points: 12, source: 'Source: Carbon Trust (2021) - 4K streaming uses ~7g CO2/hour vs ~0.7g for SD. Saving ~12 kg CO2/year for avg viewer.' },
        { text: 'Turn off auto-play videos', points: 6, source: 'Source: The Shift Project (2019) - Auto-play accounts for ~35% of video traffic. Saves ~6 kg CO2/year.' },
        { text: 'Block ads with browser extensions', points: 5, source: 'Source: Greenspector (2022) - Ads increase page energy consumption by 18-79%. Saves ~5 kg CO2/year.' },
        { text: 'Consolidate cloud storage', points: 8, source: 'Source: IEA (2023) - 1GB cloud storage uses ~7 kWh/year. Deleting 100GB saves ~8 kg CO2/year.' },
        { text: 'Unsubscribe from unused newsletters', points: 3, source: 'Source: Mike Berners-Lee (2020) - Each spam/unused email ~4g CO2. 100 emails/month = ~3 kg CO2/year.' },
        { text: 'Delete old cloud files & emails', points: 7, source: 'Source: The Shift Project - Stored data requires continuous energy. 50GB cleanup saves ~7 kg CO2/year.' },
        { text: 'Use WiFi instead of mobile data', points: 4, source: 'Source: Columbia University SIPA (2021) - 4G uses ~23x more energy than WiFi per GB transferred.' },
        { text: 'Enable device power-saving mode', points: 5, source: 'Source: Lawrence Berkeley Lab (2020) - Power-saving mode reduces device energy use by 15-30%.' }
    ];

    // ========== RENDER FUNCTIONS ==========
    function renderSolutionsImpact() {
        const container = document.getElementById('viz-solutions-impact');
        if (!container) return;
        container.innerHTML = `
            <div class="solutions-grid">
                ${solutions.map((s, i) => `
                    <div class="solution-card" data-index="${i}">
                        <span class="solution-icon">${s.icon}</span>
                        <div class="solution-title">${s.title}</div>
                        <div class="solution-impact">-${s.impact}% energy</div>
                        <div class="impact-bar"><div class="impact-fill"></div></div>
                    </div>
                `).join('')}
            </div>
            <div class="solution-detail" id="solution-detail">
                <h5>👆 Click a solution to learn more</h5>
                <p>Each card shows potential energy savings from different approaches.</p>
            </div>
        `;
        
        // Animate bars on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    container.querySelectorAll('.impact-fill').forEach((fill, i) => {
                        setTimeout(() => { fill.style.width = `${solutions[i].impact * 3}%`; }, i * 100);
                    });
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });
        observer.observe(container);
        
        // Click handler for cards
        container.querySelectorAll('.solution-card').forEach(card => {
            card.addEventListener('click', function() {
                const idx = parseInt(this.dataset.index);
                container.querySelectorAll('.solution-card').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                const detail = document.getElementById('solution-detail');
                detail.innerHTML = `<h5>${solutions[idx].icon} ${solutions[idx].title}</h5><p>${solutions[idx].detail}</p><p style="font-size: 0.75rem; color: #888; margin-top: 10px; font-style: italic;">${solutions[idx].source}</p>`;
                detail.classList.add('show');
            });
        });
    }

    function renderPersonalCalculator() {
        const container = document.getElementById('viz-personal-calculator');
        if (!container) return;
        const circumference = 2 * Math.PI * 65;
        const maxPoints = personalActions.reduce((sum, a) => sum + a.points, 0);
        
        container.innerHTML = `
            <div class="calculator-container">
                <div class="score-ring">
                    <svg width="160" height="160">
                        <defs><linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#198754"/><stop offset="100%" stop-color="#20c997"/>
                        </linearGradient></defs>
                        <circle class="bg" cx="80" cy="80" r="65"/>
                        <circle class="progress" cx="80" cy="80" r="65" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"/>
                    </svg>
                    <div class="score-value"><div class="score-number" id="score-display">0</div><div class="score-label">Eco Points</div></div>
                </div>
                <p style="font-size: 0.75rem; color: #666; margin-bottom: 12px;">Check actions you already take: <span style="color: #198754;">(1 point ≈ 1 kg CO₂/year saved)</span></p>
                <div class="actions-list">
                    ${personalActions.map((a, i) => `
                        <div class="action-item" data-index="${i}" data-points="${a.points}" data-source="${a.source}" title="Click for source info">
                            <div class="action-checkbox">✓</div>
                            <span class="action-text">${a.text}</span>
                            <span class="action-points">+${a.points}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="result-message" id="result-message">Start checking to see your eco-score!</div>
                <div id="source-info" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 8px; font-size: 0.7rem; color: #666; font-style: italic; display: none; border-left: 3px solid #198754;"></div>
            </div>
        `;
        
        let currentScore = 0;
        const progressCircle = container.querySelector('.progress');
        const scoreDisplay = container.querySelector('#score-display');
        const resultMessage = container.querySelector('#result-message');
        const sourceInfo = container.querySelector('#source-info');
        
        function updateScore() {
            const pct = currentScore / maxPoints;
            progressCircle.style.strokeDashoffset = circumference - (pct * circumference);
            scoreDisplay.textContent = currentScore;
            if (currentScore === 0) { 
                resultMessage.textContent = 'Start checking to see your eco-score!'; 
                resultMessage.className = 'result-message'; 
            }
            else if (pct < 0.3) { 
                resultMessage.textContent = '🌱 Good start!'; 
                resultMessage.className = 'result-message'; 
            }
            else if (pct < 0.6) { 
                resultMessage.textContent = '🌿 Nice progress!'; 
                resultMessage.className = 'result-message'; 
            }
            else if (pct < 0.9) { 
                resultMessage.textContent = '🌳 Eco-warrior!'; 
                resultMessage.className = 'result-message'; 
            }
            else { 
                resultMessage.textContent = '🏆 Sustainability champion!'; 
                resultMessage.className = 'result-message excellent'; 
            }
        }
        
        container.querySelectorAll('.action-item').forEach(item => {
            item.addEventListener('click', function() {
                const pts = parseInt(this.dataset.points);
                const source = this.dataset.source;
                if (this.classList.contains('checked')) { 
                    this.classList.remove('checked'); 
                    currentScore -= pts; 
                }
                else { 
                    this.classList.add('checked'); 
                    currentScore += pts; 
                }
                updateScore();
                // Show source info
                sourceInfo.textContent = source;
                sourceInfo.style.display = 'block';
            });
        });
    }

    // ========== INITIALIZE ==========
    function init() {
        renderSolutionsImpact();
        renderPersonalCalculator();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
