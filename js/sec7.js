/**
 * Section 7: Solutions & Future Roadmap
 * Self-contained visualization - no external CSS dependencies
 * Author: Lokmane
 */

(function() {
    'use strict';

    // Inject scoped styles for Section 7 only
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
        #viz-solutions-impact .solution-detail { margin-top: 15px; padding: 15px; background: #fff; border-radius: 10px; border-left: 4px solid #198754; display: none; animation: sec7FadeIn 0.3s ease; }
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

        /* ========== JOURNEY RECAP ========== */
        #viz-journey-recap .journey-container { position: relative; padding: 20px 0; }
        #viz-journey-recap .journey-path { position: absolute; top: 50%; left: 5%; right: 5%; height: 4px; background: #e9ecef; border-radius: 2px; transform: translateY(-50%); z-index: 1; }
        #viz-journey-recap .journey-path-fill { position: absolute; top: 0; left: 0; height: 100%; width: 0%; background: linear-gradient(90deg, #0d6efd, #6f42c1, #d63384, #fd7e14, #198754); border-radius: 2px; transition: width 2s ease; }
        #viz-journey-recap .journey-steps { display: flex; justify-content: space-between; position: relative; z-index: 2; }
        #viz-journey-recap .journey-step { text-align: center; flex: 1; opacity: 0; transform: translateY(20px); transition: all 0.5s ease; }
        #viz-journey-recap .journey-step.visible { opacity: 1; transform: translateY(0); }
        #viz-journey-recap .step-icon { width: 60px; height: 60px; border-radius: 50%; background: #fff; border: 3px solid #e9ecef; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 10px; transition: all 0.5s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        #viz-journey-recap .journey-step.active .step-icon { transform: scale(1.1); border-color: currentColor; }
        #viz-journey-recap .step-icon.blue { color: #0d6efd; }
        #viz-journey-recap .step-icon.purple { color: #6f42c1; }
        #viz-journey-recap .step-icon.pink { color: #d63384; }
        #viz-journey-recap .step-icon.orange { color: #fd7e14; }
        #viz-journey-recap .step-icon.green { color: #198754; }
        #viz-journey-recap .step-title { font-weight: 600; font-size: 0.85rem; color: #333; margin-bottom: 4px; }
        #viz-journey-recap .step-stat { font-size: 0.7rem; color: #666; background: #f8f9fa; padding: 3px 8px; border-radius: 12px; display: inline-block; }
        #viz-journey-recap .step-stat strong { color: #198754; }

        /* ========== FACTS CAROUSEL ========== */
        #viz-facts-carousel .facts-container { position: relative; overflow: hidden; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 30px; color: #fff; min-height: 180px; }
        #viz-facts-carousel .fact-slide { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; opacity: 0; transform: translateX(50px); transition: all 0.5s ease; }
        #viz-facts-carousel .fact-slide.active { opacity: 1; transform: translateX(0); }
        #viz-facts-carousel .fact-icon { font-size: 3rem; margin-bottom: 15px; }
        #viz-facts-carousel .fact-text { font-size: 1.1rem; text-align: center; max-width: 500px; line-height: 1.6; }
        #viz-facts-carousel .fact-text strong { color: #ffd700; }
        #viz-facts-carousel .fact-nav { position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
        #viz-facts-carousel .fact-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.3); cursor: pointer; transition: all 0.3s ease; }
        #viz-facts-carousel .fact-dot.active { background: #fff; transform: scale(1.2); }
        #viz-facts-carousel .fact-arrows { position: absolute; top: 50%; width: 100%; display: flex; justify-content: space-between; padding: 0 10px; transform: translateY(-50%); pointer-events: none; }
        #viz-facts-carousel .fact-arrow { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer; pointer-events: all; transition: all 0.3s ease; font-size: 1.2rem; }
        #viz-facts-carousel .fact-arrow:hover { background: rgba(255,255,255,0.4); }

        /* ========== ENERGY EQUIVALENTS ========== */
        #viz-energy-equivalents .equiv-container { text-align: center; }
        #viz-energy-equivalents .equiv-selector { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 20px; }
        #viz-energy-equivalents .equiv-btn { padding: 8px 16px; border: 2px solid #e9ecef; border-radius: 20px; background: #fff; cursor: pointer; transition: all 0.3s ease; font-size: 0.85rem; }
        #viz-energy-equivalents .equiv-btn:hover { border-color: #0d6efd; }
        #viz-energy-equivalents .equiv-btn.active { background: #0d6efd; border-color: #0d6efd; color: #fff; }
        #viz-energy-equivalents .equiv-display { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 25px; }
        #viz-energy-equivalents .equiv-main { font-size: 1.8rem; font-weight: 700; color: #0d6efd; margin-bottom: 10px; }
        #viz-energy-equivalents .equiv-icon { font-size: 3rem; margin-bottom: 15px; display: block; }
        #viz-energy-equivalents .equiv-comparisons { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px; }
        #viz-energy-equivalents .equiv-item { background: #fff; padding: 12px; border-radius: 10px; text-align: center; }
        #viz-energy-equivalents .equiv-item-icon { font-size: 1.5rem; }
        #viz-energy-equivalents .equiv-item-value { font-weight: 700; color: #333; font-size: 1.1rem; }
        #viz-energy-equivalents .equiv-item-label { font-size: 0.7rem; color: #666; }

        /* ========== QUIZ ========== */
        #viz-quiz .quiz-container { text-align: center; }
        #viz-quiz .quiz-question { font-size: 1rem; font-weight: 600; color: #333; margin-bottom: 20px; min-height: 50px; }
        #viz-quiz .quiz-options { display: flex; flex-direction: column; gap: 10px; }
        #viz-quiz .quiz-option { padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 10px; background: #fff; cursor: pointer; transition: all 0.3s ease; text-align: left; font-size: 0.9rem; }
        #viz-quiz .quiz-option:hover { border-color: #6f42c1; background: #f8f9fa; }
        #viz-quiz .quiz-option.correct { border-color: #198754; background: #d1e7dd; }
        #viz-quiz .quiz-option.wrong { border-color: #dc3545; background: #f8d7da; }
        #viz-quiz .quiz-option.disabled { pointer-events: none; opacity: 0.7; }
        #viz-quiz .quiz-progress { display: flex; gap: 5px; justify-content: center; margin-bottom: 15px; }
        #viz-quiz .quiz-dot { width: 12px; height: 12px; border-radius: 50%; background: #e9ecef; }
        #viz-quiz .quiz-dot.current { background: #6f42c1; }
        #viz-quiz .quiz-dot.correct { background: #198754; }
        #viz-quiz .quiz-dot.wrong { background: #dc3545; }
        #viz-quiz .quiz-result { margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #d1e7dd 0%, #badbcc 100%); border-radius: 12px; display: none; }
        #viz-quiz .quiz-result.show { display: block; animation: sec7FadeIn 0.5s ease; }
        #viz-quiz .quiz-score { font-size: 2.5rem; font-weight: 700; color: #198754; }
        #viz-quiz .quiz-restart { margin-top: 15px; padding: 10px 25px; background: #6f42c1; color: #fff; border: none; border-radius: 20px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; }
        #viz-quiz .quiz-restart:hover { background: #5a3d8a; transform: scale(1.05); }

        /* ========== LIVE COUNTER ========== */
        #viz-live-counter .counter-container { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 30px; color: #fff; text-align: center; position: relative; overflow: hidden; }
        #viz-live-counter .counter-title { font-size: 1rem; color: rgba(255,255,255,0.7); margin-bottom: 5px; }
        #viz-live-counter .counter-subtitle { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-bottom: 20px; }
        #viz-live-counter .counter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; }
        #viz-live-counter .counter-item { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px 15px; border: 1px solid rgba(255,255,255,0.1); }
        #viz-live-counter .counter-icon { font-size: 2rem; margin-bottom: 10px; }
        #viz-live-counter .counter-value { font-size: 1.8rem; font-weight: 700; font-family: 'Courier New', monospace; margin-bottom: 5px; }
        #viz-live-counter .counter-value.green { color: #20c997; }
        #viz-live-counter .counter-value.blue { color: #0dcaf0; }
        #viz-live-counter .counter-value.orange { color: #fd7e14; }
        #viz-live-counter .counter-value.pink { color: #d63384; }
        #viz-live-counter .counter-label { font-size: 0.75rem; color: rgba(255,255,255,0.6); }
        #viz-live-counter .counter-pulse { position: absolute; top: 15px; right: 15px; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; color: #20c997; }
        #viz-live-counter .pulse-dot { width: 8px; height: 8px; background: #20c997; border-radius: 50%; animation: sec7Pulse 1.5s infinite; }

        /* ========== ROADMAP ========== */
        #viz-future-roadmap .roadmap-container { position: relative; padding: 15px 0; }
        #viz-future-roadmap .roadmap-timeline { display: flex; justify-content: space-between; align-items: stretch; gap: 12px; flex-wrap: wrap; }
        #viz-future-roadmap .roadmap-item { flex: 1; min-width: 180px; background: #fff; border-radius: 14px; padding: 20px 15px; text-align: center; position: relative; border: 2px solid #e9ecef; transition: all 0.4s ease; opacity: 0; transform: translateY(30px); }
        #viz-future-roadmap .roadmap-item.visible { opacity: 1; transform: translateY(0); }
        #viz-future-roadmap .roadmap-item:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.1); }
        #viz-future-roadmap .roadmap-item.past { border-color: #198754; background: linear-gradient(135deg, #d1e7dd 0%, #fff 100%); }
        #viz-future-roadmap .roadmap-item.present { border-color: #0d6efd; background: linear-gradient(135deg, #cfe2ff 0%, #fff 100%); }
        #viz-future-roadmap .roadmap-item.present.visible { animation: sec7PulseBorder 2s infinite; }
        #viz-future-roadmap .roadmap-item.future { border-color: #6f42c1; background: linear-gradient(135deg, #e2d9f3 0%, #fff 100%); }
        #viz-future-roadmap .roadmap-year { font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; }
        #viz-future-roadmap .roadmap-item.past .roadmap-year { color: #198754; }
        #viz-future-roadmap .roadmap-item.present .roadmap-year { color: #0d6efd; }
        #viz-future-roadmap .roadmap-item.future .roadmap-year { color: #6f42c1; }
        #viz-future-roadmap .roadmap-icon { font-size: 2rem; margin-bottom: 10px; }
        #viz-future-roadmap .roadmap-title { font-weight: 600; font-size: 0.9rem; color: #333; margin-bottom: 6px; }
        #viz-future-roadmap .roadmap-desc { font-size: 0.8rem; color: #666; line-height: 1.4; }
        #viz-future-roadmap .roadmap-stat { margin-top: 12px; padding: 8px; background: rgba(0,0,0,0.03); border-radius: 8px; }
        #viz-future-roadmap .roadmap-stat-value { font-size: 1.2rem; font-weight: 700; }
        #viz-future-roadmap .roadmap-item.past .roadmap-stat-value { color: #198754; }
        #viz-future-roadmap .roadmap-item.present .roadmap-stat-value { color: #0d6efd; }
        #viz-future-roadmap .roadmap-item.future .roadmap-stat-value { color: #6f42c1; }
        #viz-future-roadmap .roadmap-stat-label { font-size: 0.7rem; color: #888; }

        /* ========== FINAL CTA - Horizontal Layout ========== */
        #viz-final-cta .cta-container { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); border-radius: 24px; padding: 40px; color: #fff; position: relative; overflow: hidden; display: flex; gap: 40px; align-items: center; }
        #viz-final-cta .cta-particles { position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; pointer-events: none; }
        #viz-final-cta .particle { position: absolute; width: 6px; height: 6px; background: rgba(255,255,255,0.3); border-radius: 50%; animation: sec7FloatParticle 15s infinite; }
        #viz-final-cta .cta-left { position: relative; z-index: 2; flex-shrink: 0; }
        #viz-final-cta .cta-icon { font-size: 5rem; display: block; animation: sec7Glow 2s ease-in-out infinite alternate; }
        #viz-final-cta .cta-title { font-size: 2.2rem; font-weight: 700; margin-top: 15px; background: linear-gradient(90deg, #20c997, #0dcaf0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        #viz-final-cta .cta-right { position: relative; z-index: 2; flex: 1; }
        #viz-final-cta .cta-subtitle { font-size: 1.05rem; color: rgba(255,255,255,0.8); margin-bottom: 25px; line-height: 1.6; }
        #viz-final-cta .cta-stats { display: flex; gap: 30px; flex-wrap: wrap; margin-bottom: 25px; }
        #viz-final-cta .cta-stat { text-align: center; background: rgba(255,255,255,0.05); padding: 15px 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
        #viz-final-cta .cta-stat-value { font-size: 2rem; font-weight: 700; color: #20c997; display: block; }
        #viz-final-cta .cta-stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.6); }
        #viz-final-cta .cta-message { background: rgba(255,255,255,0.08); backdrop-filter: blur(10px); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1); }
        #viz-final-cta .cta-message p { margin: 0; font-size: 0.95rem; line-height: 1.7; color: rgba(255,255,255,0.9); }
        #viz-final-cta .cta-message strong { color: #20c997; }
        #viz-final-cta .cta-tagline { margin-top: 20px; font-size: 1.1rem; font-weight: 600; color: #fff; opacity: 0; animation: sec7FadeInUp 1s ease forwards; animation-delay: 0.5s; }
        @media (max-width: 768px) {
            #viz-final-cta .cta-container { flex-direction: column; text-align: center; padding: 30px 20px; }
            #viz-final-cta .cta-stats { justify-content: center; }
        }

        /* ========== ANIMATIONS ========== */
        @keyframes sec7FadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sec7FadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sec7Pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.5); } }
        @keyframes sec7PulseBorder { 0%, 100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); } 50% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); } }
        @keyframes sec7FloatParticle { 0%, 100% { transform: translateY(100%) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; } }
        @keyframes sec7Glow { from { filter: drop-shadow(0 0 10px rgba(32, 201, 151, 0.5)); } to { filter: drop-shadow(0 0 25px rgba(32, 201, 151, 0.8)); } }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // ========== DATA ==========
    const solutions = [
        { icon: '💻', title: 'Green Coding', impact: 15, detail: 'Efficient algorithms reduce CPU cycles by up to 40%. Simple optimizations like caching and reducing loops make a real difference.' },
        { icon: '🌙', title: 'Dark Mode', impact: 8, detail: 'OLED screens use up to 60% less power displaying dark colors. Enable dark mode everywhere!' },
        { icon: '☁️', title: 'Green Hosting', impact: 25, detail: 'Renewable-powered data centers can eliminate 100% of hosting carbon footprint.' },
        { icon: '📉', title: 'Data Minimization', impact: 12, detail: 'Store only necessary data. Retention policies reduce storage needs by 30-50%.' },
        { icon: '🔄', title: 'Edge Computing', impact: 20, detail: 'Processing data closer to users cuts network travel by 90%.' },
        { icon: '📱', title: 'Device Longevity', impact: 18, detail: 'Extending device life from 2 to 4 years halves manufacturing emissions.' }
    ];

    const personalActions = [
        { text: 'Unsubscribe from unused newsletters', points: 5 },
        { text: 'Delete old cloud files & emails', points: 10 },
        { text: 'Use WiFi instead of mobile data', points: 8 },
        { text: 'Enable device power-saving mode', points: 7 },
        { text: 'Stream in SD instead of 4K', points: 12 },
        { text: 'Turn off auto-play videos', points: 6 },
        { text: 'Block ads with browser extensions', points: 5 },
        { text: 'Consolidate cloud storage', points: 8 }
    ];

    const journeySteps = [
        { icon: '👆', title: 'Your Click', stat: '0.0003 Wh', color: 'blue' },
        { icon: '💻', title: 'Your Device', stat: '15-60W', color: 'purple' },
        { icon: '📡', title: 'Network', stat: '0.06 kWh/GB', color: 'pink' },
        { icon: '🖥️', title: 'Data Center', stat: 'PUE 1.1-2.0', color: 'orange' },
        { icon: '🌍', title: 'Global', stat: '1-2% energy', color: 'green' }
    ];

    const facts = [
        { icon: '📧', text: 'The world sends <strong>350 billion emails daily</strong>. If everyone deleted 10 unnecessary emails, we\'d save enough energy to power <strong>1.7 million homes</strong> for a day!' },
        { icon: '🎬', text: 'Streaming video accounts for <strong>65% of all internet traffic</strong>. Watching in SD instead of 4K uses <strong>10x less data</strong>!' },
        { icon: '🔍', text: 'A single Google search uses <strong>0.3 Wh</strong> of energy — enough to power an LED bulb for <strong>3 minutes</strong>.' },
        { icon: '💾', text: 'Data centers worldwide use <strong>more electricity than the UK</strong>. By 2030, they could consume <strong>8% of global energy</strong>.' },
        { icon: '🌳', text: 'Training a large AI model can emit as much CO₂ as <strong>5 cars in their entire lifetime</strong>!' },
        { icon: '♻️', text: 'If the internet were a country, it would be the <strong>6th largest energy consumer</strong> in the world.' }
    ];

    const energyEquivalents = [
        { label: '1 Hour HD Streaming', value: 0.3, icon: '🎬', comparisons: [
            { icon: '💡', value: '3 hours', label: 'LED bulb' },
            { icon: '📱', value: '10 charges', label: 'Phone charges' },
            { icon: '🚗', value: '0.1 km', label: 'Electric car' },
            { icon: '☕', value: '6 cups', label: 'Coffee brewed' }
        ]},
        { label: '100 Emails', value: 4, icon: '📧', comparisons: [
            { icon: '💡', value: '40 hours', label: 'LED bulb' },
            { icon: '📱', value: '130 charges', label: 'Phone charges' },
            { icon: '🚗', value: '1.5 km', label: 'Electric car' },
            { icon: '☕', value: '80 cups', label: 'Coffee brewed' }
        ]},
        { label: '1 GB Cloud Storage/year', value: 7, icon: '☁️', comparisons: [
            { icon: '💡', value: '70 hours', label: 'LED bulb' },
            { icon: '📱', value: '230 charges', label: 'Phone charges' },
            { icon: '🚗', value: '2.5 km', label: 'Electric car' },
            { icon: '☕', value: '140 cups', label: 'Coffee brewed' }
        ]},
        { label: '1 ChatGPT Query', value: 0.01, icon: '🤖', comparisons: [
            { icon: '💡', value: '6 min', label: 'LED bulb' },
            { icon: '📱', value: '0.3 charges', label: 'Phone charges' },
            { icon: '🚗', value: '3.5 m', label: 'Electric car' },
            { icon: '☕', value: '0.2 cups', label: 'Coffee brewed' }
        ]}
    ];

    const quizQuestions = [
        { question: 'Which uses more energy: sending 65 emails or driving 1 km in an electric car?', options: ['65 emails', '1 km driving', 'About the same'], correct: 2 },
        { question: 'What percentage of global electricity do data centers consume?', options: ['0.5%', '1-2%', '5-10%'], correct: 1 },
        { question: 'How much can dark mode reduce OLED screen power usage?', options: ['Up to 20%', 'Up to 40%', 'Up to 60%'], correct: 2 },
        { question: 'What does PUE stand for in data centers?', options: ['Power Usage Effectiveness', 'Processed Unit Energy', 'Primary Utility Expense'], correct: 0 },
        { question: 'Which activity uses the most data per hour?', options: ['Video call', '4K streaming', 'Online gaming'], correct: 1 }
    ];

    const roadmapItems = [
        { year: '2020', icon: '🌱', title: 'Awareness Era', desc: 'First global reports on digital carbon footprint', stat: '~2%', statLabel: 'of global CO₂', type: 'past' },
        { year: '2025', icon: '⚡', title: 'Efficiency Push', desc: 'AI-optimized data centers, PUE dropping', stat: '~1.58', statLabel: 'avg. PUE', type: 'present' },
        { year: '2030', icon: '♻️', title: 'Green Transition', desc: 'Major tech targeting 100% renewable', stat: '100%', statLabel: 'renewable goal', type: 'future' },
        { year: '2050', icon: '🌍', title: 'Net Zero Digital', desc: 'Carbon-neutral internet worldwide', stat: 'Net Zero', statLabel: 'target', type: 'future' }
    ];

    const pledgeOptions = [
        { icon: '📧', text: 'Delete 50+ old emails weekly' },
        { icon: '🎬', text: 'Stream in SD when possible' },
        { icon: '🌙', text: 'Use dark mode everywhere' },
        { icon: '📱', text: 'Keep devices 4+ years' },
        { icon: '☁️', text: 'Clean cloud storage monthly' },
        { icon: '🔌', text: 'Unplug idle chargers' }
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
        container.querySelectorAll('.solution-card').forEach(card => {
            card.addEventListener('click', function() {
                const idx = parseInt(this.dataset.index);
                container.querySelectorAll('.solution-card').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                const detail = document.getElementById('solution-detail');
                detail.innerHTML = `<h5>${solutions[idx].icon} ${solutions[idx].title}</h5><p>${solutions[idx].detail}</p>`;
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
                <p style="font-size: 0.8rem; color: #666; margin-bottom: 12px;">Check actions you already take:</p>
                <div class="actions-list">
                    ${personalActions.map((a, i) => `
                        <div class="action-item" data-index="${i}" data-points="${a.points}">
                            <div class="action-checkbox">✓</div>
                            <span class="action-text">${a.text}</span>
                            <span class="action-points">+${a.points}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="result-message" id="result-message">Start checking to see your eco-score!</div>
            </div>
        `;
        let currentScore = 0;
        const progressCircle = container.querySelector('.progress');
        const scoreDisplay = container.querySelector('#score-display');
        const resultMessage = container.querySelector('#result-message');
        function updateScore() {
            const pct = currentScore / maxPoints;
            progressCircle.style.strokeDashoffset = circumference - (pct * circumference);
            scoreDisplay.textContent = currentScore;
            if (currentScore === 0) { resultMessage.textContent = 'Start checking to see your eco-score!'; resultMessage.className = 'result-message'; }
            else if (pct < 0.3) { resultMessage.textContent = '🌱 Good start!'; resultMessage.className = 'result-message'; }
            else if (pct < 0.6) { resultMessage.textContent = '🌿 Nice progress!'; resultMessage.className = 'result-message'; }
            else if (pct < 0.9) { resultMessage.textContent = '🌳 Eco-warrior!'; resultMessage.className = 'result-message'; }
            else { resultMessage.textContent = '🏆 Sustainability champion!'; resultMessage.className = 'result-message excellent'; }
        }
        container.querySelectorAll('.action-item').forEach(item => {
            item.addEventListener('click', function() {
                const pts = parseInt(this.dataset.points);
                if (this.classList.contains('checked')) { this.classList.remove('checked'); currentScore -= pts; }
                else { this.classList.add('checked'); currentScore += pts; }
                updateScore();
            });
        });
    }

    function renderJourneyRecap() {
        const container = document.getElementById('viz-journey-recap');
        if (!container) return;
        container.innerHTML = `
            <div class="journey-container">
                <div class="journey-path"><div class="journey-path-fill"></div></div>
                <div class="journey-steps">
                    ${journeySteps.map((step, i) => `
                        <div class="journey-step" data-index="${i}">
                            <div class="step-icon ${step.color}">${step.icon}</div>
                            <div class="step-title">${step.title}</div>
                            <div class="step-stat"><strong>${step.stat}</strong></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => { container.querySelector('.journey-path-fill').style.width = '100%'; }, 200);
                    container.querySelectorAll('.journey-step').forEach((step, i) => {
                        setTimeout(() => { step.classList.add('visible'); setTimeout(() => step.classList.add('active'), 300); }, i * 400 + 300);
                    });
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });
        observer.observe(container);
    }

    function renderFactsCarousel() {
        const container = document.getElementById('viz-facts-carousel');
        if (!container) return;
        let currentFact = 0;
        container.innerHTML = `
            <div class="facts-container">
                ${facts.map((f, i) => `<div class="fact-slide ${i === 0 ? 'active' : ''}"><div class="fact-icon">${f.icon}</div><div class="fact-text">${f.text}</div></div>`).join('')}
                <div class="fact-nav">${facts.map((_, i) => `<div class="fact-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}</div>
                <div class="fact-arrows"><div class="fact-arrow" id="fact-prev">◀</div><div class="fact-arrow" id="fact-next">▶</div></div>
            </div>
        `;
        function showFact(idx) {
            container.querySelectorAll('.fact-slide').forEach((s, i) => s.classList.toggle('active', i === idx));
            container.querySelectorAll('.fact-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
            currentFact = idx;
        }
        container.querySelectorAll('.fact-dot').forEach(dot => dot.addEventListener('click', () => showFact(parseInt(dot.dataset.index))));
        container.querySelector('#fact-prev').addEventListener('click', () => showFact((currentFact - 1 + facts.length) % facts.length));
        container.querySelector('#fact-next').addEventListener('click', () => showFact((currentFact + 1) % facts.length));
        setInterval(() => showFact((currentFact + 1) % facts.length), 6000);
    }

    function renderEnergyEquivalents() {
        const container = document.getElementById('viz-energy-equivalents');
        if (!container) return;
        let currentEquiv = 0;
        function render() {
            const eq = energyEquivalents[currentEquiv];
            container.innerHTML = `
                <div class="equiv-container">
                    <div class="equiv-selector">
                        ${energyEquivalents.map((e, i) => `<button class="equiv-btn ${i === currentEquiv ? 'active' : ''}" data-index="${i}">${e.icon} ${e.label}</button>`).join('')}
                    </div>
                    <div class="equiv-display">
                        <span class="equiv-icon">${eq.icon}</span>
                        <div class="equiv-main">${eq.value} kWh</div>
                        <div style="font-size: 0.85rem; color: #666;">is equivalent to:</div>
                        <div class="equiv-comparisons">
                            ${eq.comparisons.map(c => `<div class="equiv-item"><div class="equiv-item-icon">${c.icon}</div><div class="equiv-item-value">${c.value}</div><div class="equiv-item-label">${c.label}</div></div>`).join('')}
                        </div>
                    </div>
                </div>
            `;
            container.querySelectorAll('.equiv-btn').forEach(btn => btn.addEventListener('click', () => { currentEquiv = parseInt(btn.dataset.index); render(); }));
        }
        render();
    }

    function renderQuiz() {
        const container = document.getElementById('viz-quiz');
        if (!container) return;
        let currentQ = 0, score = 0, answers = [];
        function renderQuestion() {
            const q = quizQuestions[currentQ];
            container.innerHTML = `
                <div class="quiz-container">
                    <div class="quiz-progress">${quizQuestions.map((_, i) => `<div class="quiz-dot ${i === currentQ ? 'current' : ''} ${answers[i] !== undefined ? (answers[i] ? 'correct' : 'wrong') : ''}"></div>`).join('')}</div>
                    <div class="quiz-question">${q.question}</div>
                    <div class="quiz-options">${q.options.map((opt, i) => `<div class="quiz-option" data-index="${i}">${opt}</div>`).join('')}</div>
                    <div class="quiz-result" id="quiz-result"><div class="quiz-score">${score}/${quizQuestions.length}</div><p>Great job testing your knowledge!</p><button class="quiz-restart">Try Again</button></div>
                </div>
            `;
            container.querySelectorAll('.quiz-option').forEach(opt => {
                opt.addEventListener('click', function() {
                    const idx = parseInt(this.dataset.index);
                    const isCorrect = idx === q.correct;
                    answers[currentQ] = isCorrect;
                    if (isCorrect) score++;
                    this.classList.add(isCorrect ? 'correct' : 'wrong');
                    if (!isCorrect) container.querySelectorAll('.quiz-option')[q.correct].classList.add('correct');
                    container.querySelectorAll('.quiz-option').forEach(o => o.classList.add('disabled'));
                    setTimeout(() => {
                        if (currentQ < quizQuestions.length - 1) { currentQ++; renderQuestion(); }
                        else { document.getElementById('quiz-result').classList.add('show'); }
                    }, 1500);
                });
            });
            const restartBtn = container.querySelector('.quiz-restart');
            if (restartBtn) restartBtn.addEventListener('click', () => { currentQ = 0; score = 0; answers = []; renderQuestion(); });
        }
        renderQuestion();
    }

    function renderLiveCounter() {
        const container = document.getElementById('viz-live-counter');
        if (!container) return;
        let counters = { emails: 0, searches: 0, videos: 0, data: 0 };
        const rates = { emails: 3500000, searches: 99000, videos: 694, data: 4050 }; // per second
        container.innerHTML = `
            <div class="counter-container">
                <div class="counter-pulse"><div class="pulse-dot"></div> LIVE</div>
                <div class="counter-title">⚡ Global Digital Activity</div>
                <div class="counter-subtitle">Simulated real-time counters since you opened this page</div>
                <div class="counter-grid">
                    <div class="counter-item"><div class="counter-icon">📧</div><div class="counter-value green" id="counter-emails">0</div><div class="counter-label">Emails Sent</div></div>
                    <div class="counter-item"><div class="counter-icon">🔍</div><div class="counter-value blue" id="counter-searches">0</div><div class="counter-label">Google Searches</div></div>
                    <div class="counter-item"><div class="counter-icon">▶️</div><div class="counter-value orange" id="counter-videos">0</div><div class="counter-label">Hours YouTube Watched</div></div>
                    <div class="counter-item"><div class="counter-icon">📊</div><div class="counter-value pink" id="counter-data">0</div><div class="counter-label">TB Data Created</div></div>
                </div>
            </div>
        `;
        function formatNum(n) { if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'; if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'; if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'; return Math.floor(n).toString(); }
        setInterval(() => {
            counters.emails += rates.emails / 10;
            counters.searches += rates.searches / 10;
            counters.videos += rates.videos / 10;
            counters.data += rates.data / 10;
            document.getElementById('counter-emails').textContent = formatNum(counters.emails);
            document.getElementById('counter-searches').textContent = formatNum(counters.searches);
            document.getElementById('counter-videos').textContent = formatNum(counters.videos);
            document.getElementById('counter-data').textContent = formatNum(counters.data);
        }, 100);
    }

    function renderFutureRoadmap() {
        const container = document.getElementById('viz-future-roadmap');
        if (!container) return;
        container.innerHTML = `
            <div class="roadmap-container">
                <div class="roadmap-timeline">
                    ${roadmapItems.map((item, i) => `
                        <div class="roadmap-item ${item.type}" data-index="${i}">
                            <div class="roadmap-year">${item.year}</div>
                            <div class="roadmap-icon">${item.icon}</div>
                            <div class="roadmap-title">${item.title}</div>
                            <div class="roadmap-desc">${item.desc}</div>
                            <div class="roadmap-stat"><div class="roadmap-stat-value">${item.stat}</div><div class="roadmap-stat-label">${item.statLabel}</div></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    container.querySelectorAll('.roadmap-item').forEach((item, i) => setTimeout(() => item.classList.add('visible'), i * 200));
                    observer.disconnect();
                }
            });
        }, { threshold: 0.2 });
        observer.observe(container);
    }

    function renderFinalCTA() {
        const container = document.getElementById('viz-final-cta');
        if (!container) return;
        let particles = '';
        for (let i = 0; i < 20; i++) particles += `<div class="particle" style="left: ${Math.random() * 100}%; animation-delay: ${Math.random() * 15}s; width: ${4 + Math.random() * 6}px; height: ${4 + Math.random() * 6}px;"></div>`;
        container.innerHTML = `
            <div class="cta-container">
                <div class="cta-particles">${particles}</div>
                <div class="cta-left">
                    <div class="cta-icon">🌱</div>
                    <h2 class="cta-title">Every Byte Counts</h2>
                </div>
                <div class="cta-right">
                    <p class="cta-subtitle">From a single click to global infrastructure, we've traced the invisible energy cost of our digital lives.</p>
                    <div class="cta-stats">
                        <div class="cta-stat"><span class="cta-stat-value">1-2%</span><span class="cta-stat-label">Global Electricity</span></div>
                        <div class="cta-stat"><span class="cta-stat-value">~4%</span><span class="cta-stat-label">CO₂ Emissions</span></div>
                        <div class="cta-stat"><span class="cta-stat-value">2x</span><span class="cta-stat-label">Growth by 2030</span></div>
                    </div>
                    <div class="cta-message"><p><strong>The good news?</strong> Awareness is the first step. Whether you're a developer writing efficient code, a business choosing green hosting, or a user managing digital habits, <strong>you have the power to shape a sustainable digital future.</strong></p></div>
                    <p class="cta-tagline">💡 Be curious. Be conscious. Be the change.</p>
                </div>
            </div>
        `;
    }

    // ========== INITIALIZE ==========
    function init() {
        renderSolutionsImpact();
        renderPersonalCalculator();
        renderJourneyRecap();
        renderFutureRoadmap();
        renderFinalCTA();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();
