// ========= AUDIO =========
let bgMusic = null;
let isMusicPlaying = true;

function initAudio() {
    bgMusic = document.getElementById('bgMusic');
    if(bgMusic) {
        bgMusic.volume = 0.2;
        bgMusic.play().catch(e => console.log('Audio error:', e));
    }
}

function playClickSound() {
    try {
        const audio = new Audio('https://www.soundjay.com/misc/sounds/click-button-140881.mp3');
        audio.volume = 0.2;
        audio.play().catch(e => console.log('Click error'));
    } catch(e) {}
}

function playLedSound() {
    try {
        const audio = new Audio('https://www.soundjay.com/misc/sounds/light-bulb-90167.mp3');
        audio.volume = 0.15;
        audio.play().catch(e => console.log('LED error'));
    } catch(e) {}
}

function toggleMusic() {
    if(bgMusic) {
        if(isMusicPlaying) {
            bgMusic.pause();
            isMusicPlaying = false;
            document.getElementById('musicToggleBtn').innerHTML = '🔇 Musiqa Yoqish';
        } else {
            bgMusic.play();
            isMusicPlaying = true;
            document.getElementById('musicToggleBtn').innerHTML = '🔊 Musiqa O\'chirish';
        }
    }
}

// ========= MANTIQIY ELEMENTLAR =========
const gatesLibrary = [
    { name: "NOT", uzbek: "EMAS", expr: "Y = A'", desc: "Kirish signalini teskarisiga o‘zgartiradi (inkor qiladi)", amaliy: "Signalni invertatsiya qilish, osilatorlar", fakt: "NOT elementi 'inverter' deb ham ataladi", inputs: 1, truth: [[0,1],[1,0]] },
    { name: "AND", uzbek: "VA", expr: "Y = A · B", desc: "Faqat barcha kirishlar '1' bo‘lganda '1' beradi", amaliy: "Shartlarni tekshirish, signallarni tanlash", fakt: "AND elementi ikki shartni tekshirishda ishlatiladi", inputs: 2, truth: [[0,0,0],[0,1,0],[1,0,0],[1,1,1]] },
    { name: "OR", uzbek: "YOKI", expr: "Y = A + B", desc: "Kamida bitta kirish '1' bo‘lsa, '1' beradi", amaliy: "Hodisalarni jamlash, mantiqiy qo‘shish", fakt: "OR elementi 'mantiqiy qo'shish' deb ataladi", inputs: 2, truth: [[0,0,0],[0,1,1],[1,0,1],[1,1,1]] },
    { name: "NAND", uzbek: "VA-EMAS", expr: "Y = (A·B)'", desc: "AND amali natijasini teskarilaydi", amaliy: "Barcha mantiqiy elementlarni qurish", fakt: "NAND universal element - har qanday sxemani qurish mumkin!", inputs: 2, truth: [[0,0,1],[0,1,1],[1,0,1],[1,1,0]] },
    { name: "NOR", uzbek: "YOKI-EMAS", expr: "Y = (A+B)'", desc: "OR amali natijasini teskarilaydi", amaliy: "Minimal sonli elementlar", fakt: "NOR ham universal element", inputs: 2, truth: [[0,0,1],[0,1,0],[1,0,0],[1,1,0]] },
    { name: "XOR", uzbek: "Istisno YOKI", expr: "Y = A⊕B", desc: "Kirishlar har xil bo‘lsa '1'", amaliy: "Summatorlar, xatoliklarni tekshirish", fakt: "XOR qo'shuvchi sxemalarning asosi", inputs: 2, truth: [[0,0,0],[0,1,1],[1,0,1],[1,1,0]] },
    { name: "XNOR", uzbek: "Istisno YOKI-EMAS", expr: "Y = A⊙B", desc: "Kirishlar bir xil bo‘lsa '1'", amaliy: "Signal tengligini tekshirish", fakt: "XNOR 'tenglik detektori'", inputs: 2, truth: [[0,0,1],[0,1,0],[1,0,0],[1,1,1]] },
    { name: "BUFFER", uzbek: "Takrorlagich", expr: "Y = A", desc: "Signalni o‘zgartirmay o‘tkazadi", amaliy: "Signalni kuchaytirish", fakt: "BUFFER signal susayishini oldini oladi", inputs: 1, truth: [[0,0],[1,1]] }
];

const gateFunctions = {
    NOT: (a) => !a,
    AND: (a,b) => a && b,
    OR: (a,b) => a || b,
    NAND: (a,b) => !(a && b),
    NOR: (a,b) => !(a || b),
    XOR: (a,b) => a !== b,
    XNOR: (a,b) => a === b,
    BUFFER: (a) => a
};

let activeGate = null;
let currentSection = 'home';

function getSchemaImage(gateName) {
    const schemas = {
        'NOT': `<svg width="120" height="60" viewBox="0 0 120 60"><line x1="10" y1="30" x2="25" y2="30" stroke="#0ff" stroke-width="2"/><polygon points="25,15 25,45 55,30" fill="none" stroke="#0ff" stroke-width="2"/><circle cx="60" cy="30" r="4" fill="none" stroke="#0ff" stroke-width="2"/><line x1="64" y1="30" x2="100" y2="30" stroke="#0ff" stroke-width="2"/><text x="3" y="15" fill="#0ff" font-size="8">A</text><text x="95" y="15" fill="#0ff" font-size="8">Y</text></svg>`,
        'AND': `<svg width="120" height="60" viewBox="0 0 120 60"><line x1="10" y1="20" x2="25" y2="20" stroke="#0ff" stroke-width="2"/><line x1="10" y1="40" x2="25" y2="40" stroke="#0ff" stroke-width="2"/><path d="M25,15 Q50,15 50,30 Q50,45 25,45 Z" fill="none" stroke="#0ff" stroke-width="2"/><line x1="55" y1="30" x2="100" y2="30" stroke="#0ff" stroke-width="2"/><text x="3" y="12" fill="#0ff" font-size="8">A</text><text x="3" y="55" fill="#0ff" font-size="8">B</text><text x="95" y="15" fill="#0ff" font-size="8">Y</text></svg>`,
        'OR': `<svg width="120" height="60" viewBox="0 0 120 60"><line x1="10" y1="20" x2="25" y2="20" stroke="#0ff" stroke-width="2"/><line x1="10" y1="40" x2="25" y2="40" stroke="#0ff" stroke-width="2"/><path d="M25,15 Q45,15 50,30 Q45,45 25,45 Q35,30 25,15 Z" fill="none" stroke="#0ff" stroke-width="2"/><line x1="55" y1="30" x2="100" y2="30" stroke="#0ff" stroke-width="2"/><text x="3" y="12" fill="#0ff" font-size="8">A</text><text x="3" y="55" fill="#0ff" font-size="8">B</text><text x="95" y="15" fill="#0ff" font-size="8">Y</text></svg>`,
        'NAND': `<svg width="120" height="60" viewBox="0 0 120 60"><line x1="10" y1="20" x2="25" y2="20" stroke="#0ff" stroke-width="2"/><line x1="10" y1="40" x2="25" y2="40" stroke="#0ff" stroke-width="2"/><path d="M25,15 Q50,15 50,30 Q50,45 25,45 Z" fill="none" stroke="#0ff" stroke-width="2"/><circle cx="55" cy="30" r="4" fill="none" stroke="#0ff" stroke-width="2"/><line x1="59" y1="30" x2="100" y2="30" stroke="#0ff" stroke-width="2"/><text x="3" y="12" fill="#0ff" font-size="8">A</text><text x="3" y="55" fill="#0ff" font-size="8">B</text><text x="95" y="15" fill="#0ff" font-size="8">Y</text></svg>`,
        'NOR': `<svg width="120" height="60" viewBox="0 0 120 60"><line x1="10" y1="20" x2="25" y2="20" stroke="#0ff" stroke-width="2"/><line x1="10" y1="40" x2="25" y2="40" stroke="#0ff" stroke-width="2"/><path d="M25,15 Q45,15 50,30 Q45,45 25,45 Q35,30 25,15 Z" fill="none" stroke="#0ff" stroke-width="2"/><circle cx="55" cy="30" r="4" fill="none" stroke="#0ff" stroke-width="2"/><line x1="59" y1="30" x2="100" y2="30" stroke="#0ff" stroke-width="2"/><text x="3" y="12" fill="#0ff" font-size="8">A</text><text x="3" y="55" fill="#0ff" font-size="8">B</text><text x="95" y="15" fill="#0ff" font-size="8">Y</text></svg>`,
        'XOR': `<svg width="130" height="60" viewBox="0 0 130 60"><line x1="10" y1="20" x2="25" y2="20" stroke="#0ff" stroke-width="2"/><line x1="10" y1="40" x2="25" y2="40" stroke="#0ff" stroke-width="2"/><path d="M25,20 Q40,15 45,30 Q40,45 25,40" fill="none" stroke="#0ff" stroke-width="2"/><path d="M30,15 Q50,15 55,30 Q50,45 30,45" fill="none" stroke="#0ff" stroke-width="2"/><line x1="60" y1="30" x2="100" y2="30" stroke="#0ff" stroke-width="2"/><text x="3" y="12" fill="#0ff" font-size="8">A</text><text x="3" y="55" fill="#0ff" font-size="8">B</text><text x="95" y="15" fill="#0ff" font-size="8">Y</text></svg>`,
        'XNOR': `<svg width="130" height="60" viewBox="0 0 130 60"><line x1="10" y1="20" x2="25" y2="20" stroke="#0ff" stroke-width="2"/><line x1="10" y1="40" x2="25" y2="40" stroke="#0ff" stroke-width="2"/><path d="M25,20 Q40,15 45,30 Q40,45 25,40" fill="none" stroke="#0ff" stroke-width="2"/><path d="M30,15 Q50,15 55,30 Q50,45 30,45" fill="none" stroke="#0ff" stroke-width="2"/><circle cx="60" cy="30" r="4" fill="none" stroke="#0ff" stroke-width="2"/><line x1="64" y1="30" x2="100" y2="30" stroke="#0ff" stroke-width="2"/><text x="3" y="12" fill="#0ff" font-size="8">A</text><text x="3" y="55" fill="#0ff" font-size="8">B</text><text x="95" y="15" fill="#0ff" font-size="8">Y</text></svg>`,
        'BUFFER': `<svg width="120" height="60" viewBox="0 0 120 60"><line x1="10" y1="30" x2="25" y2="30" stroke="#0ff" stroke-width="2"/><polygon points="25,15 25,45 65,30" fill="none" stroke="#0ff" stroke-width="2"/><line x1="70" y1="30" x2="100" y2="30" stroke="#0ff" stroke-width="2"/><text x="3" y="15" fill="#0ff" font-size="8">A</text><text x="95" y="15" fill="#0ff" font-size="8">Y</text></svg>`
    };
    return schemas[gateName] || schemas['AND'];
}

function getTruthTableHtml(gateDef, inputs) {
    let html = '<table class="truth-table"><tr><th>' + (gateDef.inputs==1?'A':'A') + (gateDef.inputs==1?'':'</th><th>B') + '</th><th>Y</th></tr>';
    for(let row of gateDef.truth) {
        let isActive = false;
        if(gateDef.inputs==1) {
            if(inputs[0] === row[0]) isActive = true;
        } else {
            if(inputs[0] === row[0] && inputs[1] === row[1]) isActive = true;
        }
        html += `<tr class="${isActive ? 'highlight-row' : ''}">`;
        if(gateDef.inputs==1) {
            html += `<td>${row[0]}</td><td>${row[1]}</td>`;
        } else {
            html += `<td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td>`;
        }
        html += `</tr>`;
    }
    html += '</table>';
    return html;
}

function updateLeftPanel(gate) {
    const panel = document.getElementById('dynamicInfo');
    if(!panel) return;
    panel.innerHTML = `
        <div style="margin-bottom:20px; padding:12px; background:rgba(0,0,0,0.5); border-radius:12px; border-left:3px solid cyan;">
            <div style="color:cyan; font-weight:bold;">📖 Tavsifi</div>
            <div style="color:#ddd; margin-top:5px;">${gate.desc}</div>
        </div>
        <div style="margin-bottom:20px; padding:12px; background:rgba(0,0,0,0.5); border-radius:12px; border-left:3px solid cyan;">
            <div style="color:cyan; font-weight:bold;">🔧 Amaliy qo'llanilishi</div>
            <div style="color:#ddd; margin-top:5px;">${gate.amaliy}</div>
        </div>
        <div style="margin-bottom:20px; padding:12px; background:rgba(0,0,0,0.5); border-radius:12px; border-left:3px solid cyan;">
            <div style="color:cyan; font-weight:bold;">🧠 Qiziqarli fakt</div>
            <div style="color:#ddd; margin-top:5px;">${gate.fakt}</div>
        </div>
        <div style="padding:12px; background:rgba(0,255,255,0.1); border-radius:12px; text-align:center;">
            💡 <strong>Mantiqiy ifoda:</strong> ${gate.expr}
        </div>
    `;
}

function createSwitch(gateId, inputName, val, onChange) {
    const div = document.createElement('div');
    div.style.cssText = 'text-align:center; cursor:pointer;';
    const sw = document.createElement('div');
    sw.className = `toggle-switch ${val ? 'active' : ''}`;
    const knob = document.createElement('div');
    knob.className = 'toggle-knob';
    sw.appendChild(knob);
    const label = document.createElement('div');
    label.className = 'toggle-label';
    label.textContent = inputName;
    div.appendChild(sw);
    div.appendChild(label);
    sw.onclick = () => {
        playClickSound();
        onChange(!val);
    };
    return div;
}

function updateOutput() {
    if(!activeGate) return;
    const gate = gatesLibrary.find(g => g.name === activeGate.gateType);
    const fn = gateFunctions[gate.name];
    let out;
    if(gate.inputs == 1) {
        out = fn(activeGate.inputStates[0]);
    } else {
        out = fn(activeGate.inputStates[0], activeGate.inputStates[1]);
    }
    if(activeGate.output !== out && out === true) playLedSound();
    activeGate.output = out;
}

function renderCurrentGate() {
    const wrapper = document.getElementById('gatesWrapper');
    if(!wrapper) return;
    
    if(!activeGate) {
        wrapper.innerHTML = '<div style="text-align:center; color:#888; padding:50px;">➕ + tugmasini bosib, mantiqiy element tanlang</div>';
        return;
    }
    
    const gate = gatesLibrary.find(g => g.name === activeGate.gateType);
    const inputs = activeGate.inputStates;
    
    wrapper.innerHTML = `
        <div class="gate-item">
            <div class="gate-header">
                <div><span class="gate-name">${gate.name}</span> <span class="gate-uz">(${gate.uzbek})</span></div>
                <div style="font-size:1.2rem;">${gate.expr}</div>
            </div>
            <div class="schema-container">
                <div style="color:cyan; margin-bottom:8px;">⚡ Sxema belgisi</div>
                ${getSchemaImage(gate.name)}
            </div>
            <div class="switch-panel" id="switchPanel"></div>
            <div class="led-container">
                <div class="led ${activeGate.output ? 'on' : ''}"></div>
                <div style="color:#aaa;">Chiqish LED</div>
            </div>
            <div class="info-grid">
                <div class="info-card"><div class="info-title">📖 Tavsifi</div><div class="info-text">${gate.desc}</div></div>
                <div class="info-card"><div class="info-title">🔧 Amaliy</div><div class="info-text">${gate.amaliy}</div></div>
            </div>
            <div class="info-card"><div class="info-title">📊 Haqiqiylik jadvali</div><div id="truthTableDiv"></div></div>
        </div>
    `;
    
    const switchPanel = document.getElementById('switchPanel');
    if(gate.inputs == 1) {
        const sw = createSwitch(activeGate.id, 'A', inputs[0], (newVal) => {
            activeGate.inputStates[0] = newVal;
            updateOutput();
            renderCurrentGate();
            updateLeftPanel(gate);
        });
        switchPanel.appendChild(sw);
    } else {
        const swA = createSwitch(activeGate.id, 'A', inputs[0], (newVal) => {
            activeGate.inputStates[0] = newVal;
            updateOutput();
            renderCurrentGate();
            updateLeftPanel(gate);
        });
        const swB = createSwitch(activeGate.id, 'B', inputs[1], (newVal) => {
            activeGate.inputStates[1] = newVal;
            updateOutput();
            renderCurrentGate();
            updateLeftPanel(gate);
        });
        switchPanel.appendChild(swA);
        switchPanel.appendChild(swB);
    }
    
    const truthDiv = document.getElementById('truthTableDiv');
    if(truthDiv) truthDiv.innerHTML = getTruthTableHtml(gate, inputs);
    
    updateLeftPanel(gate);
}

function showGateSelector() {
    const modal = document.createElement('div');
    modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:1001; display:flex; justify-content:center; align-items:center;`;
    
    const content = document.createElement('div');
    content.style.cssText = `background:#0a0f1a; border:2px solid cyan; border-radius:30px; padding:30px; max-width:800px; width:90%; max-height:80vh; overflow-y:auto;`;
    
    const title = document.createElement('h2');
    title.textContent = 'Mantiqiy elementni tanlang';
    title.style.cssText = `color:cyan; text-align:center; margin-bottom:25px;`;
    content.appendChild(title);
    
    const grid = document.createElement('div');
    grid.style.cssText = `display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:15px;`;
    
    gatesLibrary.forEach(gate => {
        const card = document.createElement('div');
        card.style.cssText = `background:#0a0e17; border:1px solid cyan; border-radius:15px; padding:15px; text-align:center; cursor:pointer; transition:0.3s;`;
        card.innerHTML = `<div style="font-size:1.5rem; font-weight:bold;">${gate.name}</div><div style="color:#aaa;">${gate.uzbek}</div>`;
        card.onmouseenter = () => { card.style.transform = 'scale(1.05)'; card.style.boxShadow = '0 0 20px cyan'; };
        card.onmouseleave = () => { card.style.transform = 'scale(1)'; card.style.boxShadow = 'none'; };
        card.onclick = () => {
            playClickSound();
            selectGate(gate.name);
            document.body.removeChild(modal);
        };
        grid.appendChild(card);
    });
    
    content.appendChild(grid);
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Yopish';
    closeBtn.style.cssText = `background:rgba(255,0,0,0.3); border:1px solid red; color:red; padding:10px; border-radius:25px; cursor:pointer; width:100%; margin-top:20px;`;
    closeBtn.onclick = () => document.body.removeChild(modal);
    content.appendChild(closeBtn);
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

function selectGate(gateName) {
    const gateDef = gatesLibrary.find(g => g.name === gateName);
    activeGate = {
        id: Date.now(),
        gateType: gateName,
        inputStates: gateDef.inputs == 1 ? [0] : [0, 0],
        output: false
    };
    updateOutput();
    renderCurrentGate();
}

function showHome() {
    document.getElementById('homePage').style.display = 'block';
    document.getElementById('labPage').style.display = 'none';
    currentSection = 'home';
}

function showLab() {
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('labPage').style.display = 'block';
    currentSection = 'lab';
    if(!activeGate) renderCurrentGate();
    else renderCurrentGate();
}

// ========= JONLI ORQA FON (Three.js) =========
function initDynamicBg() {
    const canvas = document.getElementById('bgCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    let particles = [];
    for(let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.8,
            speedY: (Math.random() - 0.5) * 0.5,
            alpha: Math.random() * 0.5 + 0.2
        });
    }
    
    let time = 0;
    function animate() {
        if(!canvas || !ctx) return;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for(let p of particles) {
            p.x += p.speedX;
            p.y += p.speedY;
            if(p.x < 0) p.x = canvas.width;
            if(p.x > canvas.width) p.x = 0;
            if(p.y < 0) p.y = canvas.height;
            if(p.y > canvas.height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 255, ${p.alpha})`;
            ctx.fill();
        }
        
        time += 0.02;
        ctx.font = '14px monospace';
        ctx.fillStyle = 'rgba(0, 255, 255, 0.08)';
        for(let i = 0; i < 20; i++) {
            let x = (i * 180 + time * 30) % canvas.width;
            let y = (i * 60 + time * 20) % canvas.height;
            ctx.fillText('∫ f(x)dx = F(x) + C', x, y);
            ctx.fillText('Y = A·B + A·C', (x + 80) % canvas.width, (y + 35) % canvas.height);
            ctx.fillText('0 1 0 1 1 0 1 0', (x + 120) % canvas.width, (y + 70) % canvas.height);
        }
        
        requestAnimationFrame(animate);
    }
    animate();
}

// ========= BOSHLANG'ICH =========
window.addEventListener('load', () => {
    initDynamicBg();
    initAudio();
    
    const intro = document.getElementById('intro-overlay');
    const mainDiv = document.querySelector('.main-content');
    
    setTimeout(() => {
        intro.style.opacity = '0';
        setTimeout(() => {
            intro.style.display = 'none';
            mainDiv.style.opacity = '1';
        }, 1000);
    }, 1500);
    
    document.querySelectorAll(".card[data-goto='lab']").forEach(c => {
        c.addEventListener('click', () => showLab());
    });
    
    document.getElementById('backHomeBtn').addEventListener('click', () => showHome());
    document.getElementById('addGateBtn').addEventListener('click', () => {
        if(currentSection === 'lab') showGateSelector();
        else { showLab(); setTimeout(showGateSelector, 200); }
    });
    document.getElementById('musicToggleBtn').addEventListener('click', () => toggleMusic());
    
    showHome();
});