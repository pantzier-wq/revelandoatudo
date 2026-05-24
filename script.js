/* =========================================================================
   Detecta A.I — Single Page Immersive Experience
   ========================================================================= */

// ---- USER DATA ----
let userData = { name: '', partner: '', time: '', feeling: '' };

// ---- QUIZ STATE ----
const TOTAL_Q = 10;
let score = 0;
const answers = {
    intuition:0, gaslighting:0, coldness:0, frequency:0, phone:0,
    deepFeel:0, anxiety:0, projection:0, courage:0, final:0
};

// ============================================================
// PARTICLES
// ============================================================
(function(){
    const c = document.getElementById('particles-canvas');
    if(!c) return;
    const ctx = c.getContext('2d');
    let pts = [];
    function resize(){ c.width=innerWidth; c.height=innerHeight; }
    resize(); addEventListener('resize', resize);
    for(let i=0; i<50; i++) pts.push({
        x:Math.random()*innerWidth, y:Math.random()*innerHeight,
        r:Math.random()*1.2+0.3, dx:(Math.random()-0.5)*0.25,
        dy:(Math.random()-0.5)*0.25, o:Math.random()*0.35+0.08
    });
    (function draw(){
        ctx.clearRect(0,0,c.width,c.height);
        pts.forEach(p=>{
            ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
            ctx.fillStyle=`rgba(59,130,246,${p.o})`; ctx.fill();
            p.x+=p.dx; p.y+=p.dy;
            if(p.x<0||p.x>c.width)p.dx*=-1;
            if(p.y<0||p.y>c.height)p.dy*=-1;
        });
        requestAnimationFrame(draw);
    })();
})();

// ============================================================
// ONLINE COUNTER
// ============================================================
(function(){
    const el = document.getElementById('online-num');
    if(!el) return;
    let n = 65 + Math.floor(Math.random()*20);
    el.textContent = n;
    setInterval(()=>{
        n += Math.floor(Math.random()*5)-2;
        n = Math.max(55, Math.min(100, n));
        el.textContent = n;
    }, 5000);
})();

// ============================================================
// SOCIAL TOAST
// ============================================================
const NAMES = ['Juliana','Camila','Ana','Mariana','Bruna','Letícia','Fernanda','Rafaela','Carlos','Pedro','Lucas','Gabriel','Thiago'];
const ACTIONS = ['acabou de desbloquear o relatório.','descobriu a verdade agora.','está lendo o relatório.','concluiu a análise.'];

function showToast(){
    const t = document.getElementById('social-toast');
    const tn = document.getElementById('toast-name');
    if(!t||!tn) return;
    tn.textContent = NAMES[Math.floor(Math.random()*NAMES.length)];
    document.getElementById('toast-action').textContent = ACTIONS[Math.floor(Math.random()*ACTIONS.length)];
    t.classList.add('show');
    setTimeout(()=> t.classList.remove('show'), 4000);
}
setTimeout(showToast, 9000);
setInterval(showToast, 20000);

// ============================================================
// EXIT POPUP
// ============================================================
function closeExit(){ document.getElementById('exit-popup').classList.add('hidden'); }
document.addEventListener('mouseleave', function(e){
    if(e.clientY <= 0 && 
       sessionStorage.getItem('exitShown')!=='true' && 
       (sessionStorage.getItem('quizStarted') === 'true' || sessionStorage.getItem('fakeReportState') === 'true')){
        const p = document.getElementById('exit-popup');
        if(p && p.classList.contains('hidden')){
            p.classList.remove('hidden');
            sessionStorage.setItem('exitShown','true');
        }
    }
});

// ============================================================
// PHONE DEMO ANIMATION
// ============================================================
(function(){
    const frame = document.getElementById('phone-frame');
    const msgs = document.querySelectorAll('.chat-msg');
    const btnArea = document.getElementById('demo-btn-area');
    const loadOvl = document.getElementById('demo-load');
    const resOvl = document.getElementById('demo-res');
    const items = document.querySelectorAll('.demo-result-item');
    if(!frame) return;
    let running = false;
    function reset(){
        msgs.forEach(m=> m.classList.remove('show'));
        if(loadOvl) loadOvl.classList.remove('show');
        if(resOvl) resOvl.classList.remove('show');
        items.forEach(i=> i.classList.remove('show'));
    }
    function run(){
        frame.classList.add('visible');
        msgs.forEach((m,i)=> setTimeout(()=> m.classList.add('show'), 500+i*550));
        const t1 = 500+msgs.length*550+500;
        setTimeout(()=>{ if(loadOvl) loadOvl.classList.add('show'); }, t1);
        setTimeout(()=>{
            if(loadOvl) loadOvl.classList.remove('show');
            if(resOvl) resOvl.classList.add('show');
            items.forEach((it,i)=> setTimeout(()=> it.classList.add('show'), 350+i*500));
            setTimeout(()=>{ reset(); setTimeout(run, 700); }, 350+items.length*500+3000);
        }, t1+2200);
    }
    const obs = new IntersectionObserver(entries=>{
        entries.forEach(e=>{ if(e.isIntersecting && !running){ running=true; run(); obs.unobserve(e.target); } });
    }, {threshold:0.35});
    obs.observe(frame);
})();

// ============================================================
// SCROLL TO EXPERIENCE
// ============================================================
function scrollToExperience(){
    const el = document.getElementById('experience');
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
}

// ============================================================
// WIZARD DE IDENTIFICAÇÃO EM ETAPAS & FOCUS MODE
// ============================================================
function enterFocusMode() {
    document.body.classList.add('focus-mode');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exitToHome() {
    document.body.classList.remove('focus-mode');
    
    // Reset wizard
    const intro = document.getElementById('id-intro');
    const steps = document.getElementById('id-steps');
    if(intro && steps) {
        steps.classList.add('hidden');
        steps.style.opacity = '0';
        intro.classList.remove('hidden');
        intro.style.opacity = '1';
    }
    
    document.querySelectorAll('.id-step-pane').forEach((p, idx) => {
        if(idx === 0) {
            p.classList.remove('hidden');
            p.classList.add('active');
        } else {
            p.classList.add('hidden');
            p.classList.remove('active');
        }
    });
    updateIdProgress(1);

    // Reset inputs
    const inpName = document.getElementById('inp-name');
    const inpPartner = document.getElementById('inp-partner');
    const inpTime = document.getElementById('inp-time');
    const inpFeeling = document.getElementById('inp-feeling');
    if(inpName) inpName.value = '';
    if(inpPartner) inpPartner.value = '';
    if(inpTime) inpTime.selectedIndex = 0;
    if(inpFeeling) inpFeeling.selectedIndex = 0;

    // Reset screens to show identification screen
    const idScreen = document.getElementById('id-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const uploadScreen = document.getElementById('upload-screen');
    const analysisScreen = document.getElementById('analysis-screen');
    const resultScreen = document.getElementById('result-screen');
    
    if (idScreen) { idScreen.classList.remove('hidden'); idScreen.style.opacity = '1'; }
    if (quizScreen) { quizScreen.classList.add('hidden'); quizScreen.style.opacity = '0'; }
    if (uploadScreen) { uploadScreen.classList.add('hidden'); uploadScreen.style.opacity = '0'; }
    if (analysisScreen) { analysisScreen.classList.add('hidden'); analysisScreen.style.opacity = '0'; }
    if (resultScreen) { resultScreen.classList.add('hidden'); resultScreen.style.opacity = '0'; }
    
    // Reset quiz variables
    score = 0;
    Object.keys(answers).forEach(k => answers[k] = 0);
    document.querySelectorAll('.quiz-step').forEach((q, idx) => {
        if (idx === 0) q.classList.add('active');
        else q.classList.remove('active');
    });
    updateProgress(1);
    
    // Reset quiz back button visibility
    const qb = document.getElementById('quiz-back-btn-container');
    if(qb) qb.classList.remove('hidden');

    // Scroll to the experience section
    const el = document.getElementById('experience');
    if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
}

function startIdSteps(){
    sessionStorage.setItem('quizStarted', 'true');
    enterFocusMode();
    fadeSwitch('id-intro', 'id-steps');
    setTimeout(()=>{
        const n = document.getElementById('inp-name');
        if(n) n.focus();
    }, 500);
}

function updateIdProgress(step){
    const fill = document.getElementById('id-step-fill');
    const label = document.getElementById('id-step-label');
    if(fill) fill.style.width = (step * 25) + '%';
    if(label) label.textContent = `Passo ${step} de 4`;
}

function nextIdPane(next){
    const current = next - 1;
    let valid = true;
    if(current === 1){
        const inp = document.getElementById('inp-name');
        if(inp){
            inp.classList.remove('error');
            if(!inp.value.trim()){ inp.classList.add('error'); valid = false; }
        }
    } else if(current === 2){
        const inp = document.getElementById('inp-partner');
        if(inp){
            inp.classList.remove('error');
            if(!inp.value.trim()){ inp.classList.add('error'); valid = false; }
        }
    } else if(current === 3){
        const inp = document.getElementById('inp-time');
        if(inp){
            inp.classList.remove('error');
            if(!inp.value){ inp.classList.add('error'); valid = false; }
        }
    }

    if(!valid) return;

    document.querySelectorAll('.id-step-pane').forEach(p => p.classList.add('hidden'));
    const nextPane = document.getElementById('id-pane-' + next);
    if(nextPane) {
        nextPane.classList.remove('hidden');
        updateIdProgress(next);
        const input = nextPane.querySelector('input, select');
        if(input) setTimeout(() => input.focus(), 150);
    }
}

function prevIdPane(prev){
    document.querySelectorAll('.id-step-pane').forEach(p => p.classList.add('hidden'));
    const prevPane = document.getElementById('id-pane-' + prev);
    if(prevPane) {
        prevPane.classList.remove('hidden');
        updateIdProgress(prev);
    }
}

// ============================================================
// IDENTIFICATION
// ============================================================
function startIdentification(){
    const n = document.getElementById('inp-name');
    const p = document.getElementById('inp-partner');
    const t = document.getElementById('inp-time');
    const f = document.getElementById('inp-feeling');
    let valid = true;
    [n,p,t].forEach(el=>{ el.classList.remove('error'); if(!el.value.trim()){ el.classList.add('error'); valid=false; } });
    if(!valid) return;
    userData.name = n.value.trim();
    userData.partner = p.value.trim();
    userData.time = t.value;
    userData.feeling = f.value;
    sessionStorage.setItem('userData', JSON.stringify(userData));
    injectNames();
    fadeSwitch('id-screen','quiz-screen');
}

function injectNames(){
    const ctx = document.getElementById('q1-ctx');
    if(ctx) ctx.textContent = `Entendido, ${userData.name}. Iniciando diagnóstico — analisando padrões de ${userData.partner}…`;
}

// ============================================================
// QUIZ
// ============================================================
function updateProgress(step){
    const fill = document.getElementById('qp-fill');
    const label = document.getElementById('qp-label');
    const pct = document.getElementById('qp-pct');
    const p = Math.round(((step-1)/TOTAL_Q)*100);
    if(fill) fill.style.width = p+'%';
    if(label) label.textContent = `Pergunta ${step} de ${TOTAL_Q}`;
    if(pct) pct.textContent = p+'%';
}

function showFB(msg){
    const el = document.getElementById('fb-text');
    const w = document.getElementById('sys-fb');
    if(!el||!w) return;
    w.style.opacity='0';
    setTimeout(()=>{ el.textContent=msg; w.style.opacity='1'; }, 280);
}

function nextQ(next, pts, key, fb){
    if(pts!==undefined){ score+=pts; if(key&&key in answers) answers[key]=pts; }
    if(fb) showFB(fb);
    document.querySelectorAll('.quiz-step.active').forEach(el=> el.classList.remove('active'));
    const nxt = document.getElementById('q'+next);
    if(nxt) setTimeout(()=>{
        nxt.classList.add('active');
        updateProgress(next);
        const mc = nxt.querySelector('.quiz-microcopy');
        if(mc){ mc.style.animation='none'; mc.offsetHeight; mc.style.animation=''; }
    }, 80);
}

function finishQuiz(pts, key){
    if(pts!==undefined){ score+=pts; if(key&&key in answers) answers[key]=pts; }
    sessionStorage.setItem('quizScore', score);
    sessionStorage.setItem('quizAnswers', JSON.stringify(answers));
    
    const qb = document.getElementById('quiz-back-btn-container');
    if(qb) qb.classList.add('hidden');

    document.querySelectorAll('.quiz-step.active').forEach(el=> el.classList.remove('active'));
    const tr = document.getElementById('q-trans');
    if(tr) tr.classList.add('active');

    // Reset the scoring screen
    const logEl = document.getElementById('qs-log');
    const barEl = document.getElementById('qs-bar');
    const pctEl = document.getElementById('qs-pct');
    const titleEl = document.getElementById('qs-title');
    const subtitleEl = document.getElementById('qs-subtitle');
    const alertEl = document.getElementById('qs-alert');
    const scoreReveal = document.getElementById('qs-score-reveal');
    const scoreNum = document.getElementById('qs-score-num');

    if(logEl) logEl.innerHTML = '';
    if(barEl) barEl.style.width = '0%';
    if(pctEl) pctEl.textContent = '0%';
    if(scoreReveal) scoreReveal.classList.add('hidden');

    // Partner-aware title
    if(titleEl && userData.partner) titleEl.textContent = `Analisando padrões de ${userData.partner}…`;
    if(subtitleEl) subtitleEl.textContent = 'Processando suas respostas...';

    // Build dynamic log lines based on quiz answers
    const dynamicLines = [];
    if(answers.intuition >= 2)  dynamicLines.push({ t: 600,  txt: '✓ Mudança de comportamento comunicacional registrada', alert: false });
    if(answers.gaslighting >= 2) dynamicLines.push({ t: 1000, txt: '✓ Padrão de resposta fria mapeado', alert: false });
    if(answers.coldness >= 2)   dynamicLines.push({ t: 1400, txt: 'Resfriamento emocional sob análise', alert: false });
    if(answers.frequency >= 2)  dynamicLines.push({ t: 1800, txt: '✓ Padrão comportamental mapeado', alert: false });
    if(answers.phone >= 2)      dynamicLines.push({ t: 2200, txt: 'Comportamento evasivo de rotina registrado', alert: false });
    if(answers.deepFeel >= 2)   dynamicLines.push({ t: 2600, txt: '✓ Padrão de resposta registrado', alert: false });
    if(answers.anxiety >= 2)    dynamicLines.push({ t: 3000, txt: 'Variação de afeto quantificada', alert: false });
    if(answers.projection >= 2) dynamicLines.push({ t: 3400, txt: 'Indicadores comportamentais mapeados', alert: false });
    // always-on lines
    dynamicLines.push({ t: 200,  txt: 'Inicializando motor de análise comportamental...', alert: false });
    dynamicLines.push({ t: 1600, txt: `Cruzando dados com banco de 14.000 perfis...`, alert: false });
    dynamicLines.push({ t: 3800, txt: 'Gerando pré-diagnóstico confidencial...', alert: false });
    dynamicLines.sort((a,b) => a.t - b.t);

    dynamicLines.forEach(line => {
        setTimeout(() => {
            if(!logEl) return;
            const div = document.createElement('div');
            div.className = 'qs-log-line' + (line.alert ? ' qs-alert-line' : '');
            div.innerHTML = `<span class="qs-log-icon">${line.alert ? '⚠' : '▶'}</span><span>${line.txt}</span>`;
            logEl.appendChild(div);
            logEl.scrollTop = logEl.scrollHeight;
        }, line.t);
    });

    // Progress animation over 4.2s
    const SCORE_DURATION = 4200;
    const startTime = Date.now();
    function animProgress() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / SCORE_DURATION, 1);
        // Ease-out-expo curve
        const p = t === 1 ? 100 : Math.round((1 - Math.pow(2, -10 * t)) * 100 * 100) / 100;
        if(barEl) barEl.style.width = p + '%';
        if(pctEl) pctEl.textContent = Math.floor(p) + '%';
        if(t < 1) requestAnimationFrame(animProgress);
    }
    requestAnimationFrame(animProgress);

    // Alert flash at 2s - gentle feedback
    setTimeout(() => {
        if(!alertEl) return;
        const alertMsg = '✓ RESPOSTAS PROCESSADAS COM SUCESSO';
        const alertText = document.getElementById('qs-alert-text');
        if(alertText) alertText.textContent = alertMsg;
        alertEl.classList.remove('hidden');
        alertEl.classList.add('qs-alert-show');
        setTimeout(() => { alertEl.classList.add('hidden'); alertEl.classList.remove('qs-alert-show'); }, 2200);
    }, 2000);

    // Score reveal at 4s - soft confirm
    setTimeout(() => {
        if(subtitleEl) subtitleEl.textContent = 'Pré-análise concluída!';
        if(scoreReveal) {
            scoreReveal.classList.remove('hidden');
        }
    }, 4000);

    // After 5s transition to upload screen
    setTimeout(() => fadeSwitch('quiz-screen', 'upload-screen'), 5000);
}


// ============================================================
// UPLOAD
// ============================================================
function initUploadScreen(){
    // Copy is now static in HTML; no dynamic overwrite needed
}

function handleDrop(e){
    e.preventDefault();
    document.getElementById('dropzone').classList.remove('dragover');
    const f = e.dataTransfer.files[0];
    if(f) processFile(f);
}
function handleFile(inp){
    const f = inp.files[0];
    if(f) processFile(f);
}
function processFile(f){
    const validExt = f.name.endsWith('.txt') || f.name.endsWith('.zip');
    if(!validExt){ alert('Envie um arquivo .txt ou .zip exportado do WhatsApp.'); return; }
    const dz = document.getElementById('dropzone');
    if(dz) dz.innerHTML = `<div class="dropzone-icon">✅</div><h3>${f.name}</h3><p style="color:var(--green);">Arquivo carregado!</p>`;
    setTimeout(()=> startAnalysis(), 800);
}
function skipUpload(){ startAnalysis(); }

// ============================================================
// ANALYSIS — PSYCHOLOGICAL RHYTHM
// ============================================================
const STATUS_MSGS = [
    "Lendo padrões emocionais…",
    "Comparando frequência de resposta…",
    "Detectando variações de tom…",
    "Cruzando respostas do quiz com a conversa…",
    "Possível padrão evasivo encontrado…",
    "Analisando comportamento emocional…",
    "Validando inconsistências nos dados…",
    "Gerando relatório confidencial…"
];
const LOG_LINES = [
    "Iniciando módulo de análise comportamental...",
    "Carregando base de padrões psicológicos...",
    "Calibrando vetores de resposta...",
    "⚠ Inconsistência emocional detectada",
    "Analisando frequência e tom…",
    "Mapeando mudanças de comportamento…",
    "⚠ Mudança de comportamento encontrada",
    "Cruzando com 14.000 casos…",
    "⚠ Frequência evasiva acima do normal",
    "Compilando relatório…",
    "Gerando score de inconsistência…",
    "Relatório pronto. Liberação pendente."
];
const ALERTS = [
    "INCONSISTÊNCIA EMOCIONAL DETECTADA",
    "MUDANÇA DE COMPORTAMENTO ENCONTRADA",
    "FREQUÊNCIA EVASIVA ACIMA DO NORMAL"
];

let simRunning = false;

function startAnalysis(){
    if(simRunning) return;
    simRunning = true;
    fadeSwitch('upload-screen','analysis-screen');

    const bar = document.getElementById('prog-fill');
    const pctEl = document.getElementById('prog-pct');
    const timeEl = document.getElementById('prog-time');
    const statusEl = document.getElementById('status-line');
    const logBox = document.getElementById('log-box');
    const alertEl = document.getElementById('alert-box');
    const alertText = document.getElementById('alert-text');
    const mainTitle = document.getElementById('analysis-title');

    if(mainTitle && userData.name) mainTitle.textContent = `Iniciando análise comportamental, ${userData.name}…`;

    // Inject partner name into log line
    const partnerLogIdx = LOG_LINES.findIndex(l => l.includes('Analisando'));
    // Add partner-specific log
    if(userData.partner && partnerLogIdx >= 0) {
        LOG_LINES.splice(partnerLogIdx + 1, 0, `Analisando comportamento de ${userData.partner}…`);
    }

    const DURATION = 28000;
    const start = Date.now();

    // Psychological curve: 0-22% fast, 22-58% slow, 58-89% very slow, 89-100% fast
    function curve(t){
        if(t<0.14) return t/0.14*22;
        if(t<0.52) return 22+(t-0.14)/0.38*36;
        if(t<0.87) return 58+(t-0.52)/0.35*31;
        return 89+(t-0.87)/0.13*11;
    }

    const pInt = setInterval(()=>{
        const el = (Date.now()-start)/DURATION;
        const p = Math.min(curve(el), 100);
        if(bar) bar.style.width = p+'%';
        if(pctEl) pctEl.textContent = Math.floor(p)+'%';
        if(p>=100) clearInterval(pInt);
    }, 80);

    let rem = 28;
    const tInt = setInterval(()=>{
        rem = Math.max(0, rem-1);
        if(timeEl) timeEl.textContent = rem;
        if(rem<=0) clearInterval(tInt);
    }, 1000);

    let si=0;
    const sInt = setInterval(()=>{
        si++;
        if(si<STATUS_MSGS.length && statusEl){
            statusEl.style.opacity='0';
            setTimeout(()=>{ statusEl.textContent=STATUS_MSGS[si]; statusEl.style.opacity='1'; }, 350);
        } else clearInterval(sInt);
    }, 3000);

    let li=0;
    const lInt = setInterval(()=>{
        if(!logBox || li>=LOG_LINES.length){ clearInterval(lInt); return; }
        const line = LOG_LINES[li];
        const isA = line.startsWith('⚠');
        const displayLine = isA ? line.substring(1).trim() : line;
        const div = document.createElement('div');
        div.className = 'log-line'+(isA?' alert':'');
        div.innerHTML = `<span class="log-icon">${isA?'⚠':'▶'}</span><span>${displayLine}</span>`;
        logBox.appendChild(div);
        logBox.scrollTop = logBox.scrollHeight;
        li++;
    }, 2000);

    function flash(msg){
        if(!alertEl||!alertText) return;
        alertText.textContent = msg;
        alertEl.classList.remove('hidden');
        alertEl.classList.add('show');
        setTimeout(()=>{ alertEl.classList.remove('show'); alertEl.classList.add('hidden'); }, 3200);
    }
    setTimeout(()=> flash(ALERTS[0]), 5500);
    setTimeout(()=> flash(ALERTS[1]), 13000);
    setTimeout(()=> flash(ALERTS[2]), 21000);

    setTimeout(()=>{
        clearInterval(pInt); clearInterval(tInt); clearInterval(sInt); clearInterval(lInt);
        if(bar) bar.style.width='100%';
        if(pctEl) pctEl.textContent='100%';
        fadeSwitch('analysis-screen','result-screen');
        setTimeout(showResult, 200);
    }, DURATION);
}

// ============================================================
// RESULT BUILDER — LOCKED REPORT PREVIEW
// ============================================================
function getRiskLevel(s){
    if(s<=10) return {label:'MODERADO', color:'#60a5fa'};
    if(s<=20) return {label:'ALTO', color:'#fb923c'};
    return {label:'CRÍTICO', color:'#ef4444'};
}

function showResult(){
    const saved = sessionStorage.getItem('quizAnswers');
    const sa = saved ? JSON.parse(saved) : answers;
    const ss = sessionStorage.getItem('quizScore');
    const es = ss ? parseInt(ss) : score;
    const su = sessionStorage.getItem('userData');
    const ud = su ? JSON.parse(su) : userData;
    const r = getRiskLevel(es);
    const pName = ud.partner || localStorage.getItem('partnerName') || 'essa pessoa';
    const uName = ud.name || '';

    const container = document.getElementById('result-content');
    if(!container) return;

    container.innerHTML = `
        <div class="result-shell">

            <!-- Private File Header -->
            <div class="private-file-header">
                <div class="pf-row">
                    <span class="pf-label">Arquivo privado</span>
                    <span class="pf-value">${pName}</span>
                </div>
                <div class="pf-row">
                    <span class="pf-label">Status</span>
                    <span class="pf-value pf-green">análise concluída</span>
                </div>
                <div class="pf-row">
                    <span class="pf-label">Conclusão</span>
                    <span class="pf-value pf-red">🔒 bloqueada</span>
                </div>
            </div>

            <div class="result-status">
                <span class="status-dot-result"></span>
                RELATÓRIO GERADO — ACESSO RESTRITO
            </div>

            <h1 class="result-headline">Encontramos sinais relevantes no comportamento de <span class="partner-highlight">${pName}</span>.</h1>

            <p class="result-sub">
                Alguns trechos encontrados sobre <strong>${pName}</strong> começaram a chamar atenção durante a análise. A continuação da leitura foi bloqueada nesta prévia.
            </p>

            <div class="risk-panel-new">
                <span class="risk-panel-title">Nível de atenção detectado</span>
                <strong class="risk-panel-level" style="color:${r.color}; text-shadow: 0 0 24px ${r.color}55;">${r.label}</strong>
                <p class="risk-panel-desc">O sistema encontrou sinais relevantes no padrão informado sobre ${pName}.</p>
            </div>

            <!-- Fragments Label -->
            <div class="fragments-label">
                <span class="frag-lock-icon">🔒</span>
                Trechos extraídos da análise gerada para: <strong>${pName}</strong>
            </div>

            <!-- Fragment 1 -->
            <div class="report-fragment">
                <div class="frag-label">TRECHO 01 — mudança que você percebeu</div>
                <p class="frag-visible">Sobre <strong>${pName}</strong>, a análise encontrou um detalhe incômodo: a mudança não aparece só no que ele(a) fala, mas no jeito que começou a…</p>
                <div class="frag-blurred">
                    <p><span class="b-text">responder menos, explicar menos e adotar uma </span><span class="frag-escaped">mudança de postura</span><span class="b-text"> evidente —</span></p>
                    <p><span class="b-text">agindo como se você estivesse pedindo demais por coisas que antes eram naturais.</span></p>
                    <p><span class="b-text">O comportamento passou a incluir </span><span class="frag-escaped">respostas mais curtas</span><span class="b-text">, menor iniciativa e uma postura defensiva crescente.</span></p>
                    <p><span class="b-text">Esse padrão não é isolado. Ele aparece de forma consistente no histórico analisado.</span></p>
                </div>
                <div class="frag-overlay"></div>
            </div>

            <!-- Fragment 2 -->
            <div class="report-fragment">
                <div class="frag-label">TRECHO 02 — celular e proteção</div>
                <p class="frag-visible">No comportamento de <strong>${pName}</strong>, o celular aparece como um ponto sensível quando deixa de ser apenas rotina e começa a virar…</p>
                <div class="frag-blurred">
                    <p><span class="b-text">um território protegido. O sinal mais evidente são as </span><span class="frag-escaped">respostas vagas</span><span class="b-text"> sobre o aparelho —</span></p>
                    <p><span class="b-text">tela virada com frequência, aparelho sempre por perto, reação diferente quando alguém se aproxima.</span></p>
                    <p><span class="b-text">Esse comportamento de </span><span class="frag-escaped">proteção ativa do dispositivo</span><span class="b-text"> foi identificado como um dos sinais de maior peso na análise.</span></p>
                    <p><span class="b-text">A leitura completa deste trecho contém os padrões específicos detectados.</span></p>
                </div>
                <div class="frag-overlay"></div>
            </div>

            <!-- Fragment 3 -->
            <div class="report-fragment frag-red-accent">
                <div class="frag-label">TRECHO 03 — inversão de culpa</div>
                <p class="frag-visible">Um dos sinais mais fortes aparece quando você tenta entender o que mudou e <strong>${pName}</strong> faz a conversa parecer sobre a sua insegurança, não sobre…</p>
                <div class="frag-blurred frag-blurred--red">
                    <p><span class="b-text">as atitudes e a </span><span class="frag-escaped">evasão emocional</span><span class="b-text"> que começaram a te deixar em alerta.</span></p>
                    <p><span class="b-text">Esse mecanismo de </span><span class="frag-escaped">inversão de culpa</span><span class="b-text"> é um dos padrões mais difíceis de identificar sem análise externa.</span></p>
                    <p><span class="b-text">A pessoa que usa essa estratégia raramente percebe que está fazendo isso. O efeito é que você passa a questionar</span></p>
                    <p><span class="b-text">a própria percepção, deixando de confiar nos sinais que já estava sentindo há semanas.</span></p>
                </div>
                <div class="frag-overlay frag-overlay--red"></div>
            </div>

            <!-- Warning after Fragment 3 -->
            <div class="sensitivity-warning">
                ⚠️ Trecho parcialmente ocultado devido à sensibilidade da conclusão encontrada.
            </div>

            <!-- Fragment 4 -->
            <div class="report-fragment">
                <div class="frag-label">TRECHO 04 — sumiços e rotina</div>
                <p class="frag-visible">A rotina de <strong>${pName}</strong> chama atenção quando pequenos sumiços, horários confusos ou respostas vagas começam a se repetir justamente nos momentos em que…</p>
                <div class="frag-blurred">
                    <p><span class="b-text">antes existia mais presença, agora substituída por uma </span><span class="frag-escaped">frieza progressiva</span><span class="b-text"> e menos espontaneidade.</span></p>
                    <p><span class="b-text">Os horários de </span><span class="frag-escaped">indisponibilidade recorrente</span><span class="b-text"> coincidem com momentos que antes eram de contato frequente.</span></p>
                    <p><span class="b-text">A ausência de explicação voluntária para essas mudanças é, por si só, um sinal relevante dentro da análise comportamental.</span></p>
                    <p><span class="b-text">Esse trecho inclui os horários e padrões específicos que cruzaram com outros dados coletados.</span></p>
                </div>
                <div class="frag-overlay"></div>
            </div>

            <!-- Fragment 5 — Final conclusion -->
            <div class="report-fragment report-fragment--final">
                <div class="frag-label frag-label--final">TRECHO 05 — conclusão final</div>
                <p class="frag-visible">A conclusão final sobre <strong>${pName}</strong> já foi montada e cruza celular, frieza, rotina e reação defensiva para responder se você está vendo…</p>
                <div class="frag-blurred frag-blurred--dense">
                    <p><span class="b-text">um padrão real de </span><span class="frag-escaped">ocultação</span><span class="b-text"> ou um </span><span class="frag-escaped">afastamento emocional</span><span class="b-text"> progressivo.</span></p>
                    <div class="redacted-block">
                        <span>██████████████████████████████</span>
                        <span>████ <em>afastamento emocional</em> ████████</span>
                        <span>██████████████████████████████</span>
                        <span>████ <em>ocultação progressiva</em> █████</span>
                        <span>██████████████████████████████</span>
                    </div>
                </div>
                <div class="frag-overlay frag-overlay--final"></div>
            </div>

            <!-- Pill fora do overlay no card 05 -->
            <div class="final-unlock-bar">
                <span class="frag-unlock-pill frag-unlock-pill--final">🔓 Ver conclusão completa sobre ${pName}</span>
            </div>

            <!-- FOMO -->
            <p class="session-warning">⚠️ Este relatório foi gerado apenas para esta sessão. Se você sair agora, os trechos ocultos e a conclusão sobre <strong>${pName}</strong> deixam de ficar disponíveis.</p>

            <!-- Social Proof -->
            <p class="social-proof-micro">Pessoas que chegaram nessa etapa hoje desbloquearam o relatório justamente para confirmar se a dúvida era paranoia ou sinal real.</p>

            <!-- CTA -->
            <a href="https://pay.kirvano.com/d4552972-643a-4b72-a6a9-15415200c0a3" onclick="sessionStorage.setItem('clickedCheckout','true');" class="cta-btn pulse-glow full" id="final-cta">
                DESBLOQUEAR RELATÓRIO SOBRE ${pName.toUpperCase()} ➜
            </a>

            <p class="cta-microcopy">Ver trechos ocultos, sinais encontrados e conclusão final.</p>
            <p class="price-micro">Liberação imediata por R$29,90</p>

        </div>
    `;

    // Animate fragments stagger
    setTimeout(()=>{
        document.querySelectorAll('.report-fragment').forEach((f,i)=>{
            setTimeout(()=> f.classList.add('visible'), i * 150);
        });
    }, 300);
}

// ============================================================
// UTILITY: FADE SWITCH SCREENS
// ============================================================
function fadeSwitch(hideId, showId){
    const h = document.getElementById(hideId);
    const s = document.getElementById(showId);
    if(h){ h.style.opacity='0'; h.style.transition='opacity 0.4s'; setTimeout(()=> h.classList.add('hidden'), 400); }
    if(s){
        setTimeout(()=>{
            s.classList.remove('hidden');
            s.style.opacity='0'; s.style.transition='opacity 0.4s';
            setTimeout(()=> s.style.opacity='1', 30);
            if(showId==='upload-screen') initUploadScreen();
        }, 450);
    }
}

// ============================================================
// STATE PERSISTENCE
// ============================================================
window.addEventListener('pageshow', ()=>{
    if(sessionStorage.getItem('fakeReportState')==='true'){
        const ss = sessionStorage.getItem('quizScore');
        if(ss) score = parseInt(ss);
        const su = sessionStorage.getItem('userData');
        if(su) try{ userData=JSON.parse(su); }catch(e){}

        // Hide everything except result
        ['id-screen','quiz-screen','upload-screen','analysis-screen'].forEach(id=>{
            const el = document.getElementById(id);
            if(el) el.classList.add('hidden');
        });
        const rs = document.getElementById('result-screen');
        if(rs){ rs.classList.remove('hidden'); rs.style.opacity='1'; }
        showResult();
    }
    if(sessionStorage.getItem('clickedCheckout')==='true'){
        sessionStorage.removeItem('clickedCheckout');
        setTimeout(()=>{
            const p = document.getElementById('return-popup');
            if(p){ p.classList.remove('hidden'); p.style.display='flex'; }
        }, 500);
    }
});

function closeReturn(){
    const p = document.getElementById('return-popup');
    if(p){ p.classList.add('hidden'); p.style.display='none'; }
    const btn = document.getElementById('final-cta');
    if(btn) btn.scrollIntoView({behavior:'smooth', block:'center'});
}

// ============================================================
// STATS COUNTER AND SCROLL REVEAL ANIMATION
// ============================================================
(function(){
    const cards = document.querySelectorAll('.scroll-reveal');
    if(cards.length === 0) return;

    function animateNumber(el, start, end, duration, isPercentage = false) {
        let startTime = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            el.textContent = isPercentage ? `${value}%` : `+${value.toLocaleString('pt-BR')}`;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                el.textContent = isPercentage ? `${end}%` : `+${end.toLocaleString('pt-BR')}`;
            }
        }
        window.requestAnimationFrame(step);
    }

    const obs = new IntersectionObserver((entries, observer) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const card = e.target;
                card.classList.add('revealed');
                
                const numEl = card.querySelector('.large-stat-num');
                if (numEl && numEl.id) {
                    const target = parseInt(numEl.getAttribute('data-target'));
                    const isPct = numEl.id === 'pct-confirm';
                    setTimeout(() => {
                        animateNumber(numEl, 0, target, 1500, isPct);
                    }, 200);
                }
                observer.unobserve(card);
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(c => obs.observe(c));
})();
