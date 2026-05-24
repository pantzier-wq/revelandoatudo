/* =========================================================================
   Detecta A.I - Functional Algorithm Analyzer
   ========================================================================= */

// 1. Initial State & Setup

function logout() {
    localStorage.removeItem('detecta_auth');
    localStorage.removeItem('detecta_active_email');
    window.location.href = 'register.html';
}

function getActiveEmail() {
    return localStorage.getItem('detecta_active_email');
}

function getUserData() {
    const email = getActiveEmail();
    if(!email) return null;
    let users = JSON.parse(localStorage.getItem('detecta_registered_users') || '{}');
    return users[email] || null;
}

function saveUserData(userData) {
    const email = getActiveEmail();
    if(!email) return;
    let users = JSON.parse(localStorage.getItem('detecta_registered_users') || '{}');
    users[email] = userData;
    localStorage.setItem('detecta_registered_users', JSON.stringify(users));
}

/* ══════════════════════════════════════════════════════════
   CREDITS SYSTEM
   Storage key: detecta_analysis_credits  →  { email: N }
   Exposed globally so register.html / admin can call:
     addCredits(email, amount)
══════════════════════════════════════════════════════════ */
function getCredits(email) {
    email = email || getActiveEmail() || 'default';
    const map = JSON.parse(localStorage.getItem('detecta_analysis_credits') || '{}');
    return (typeof map[email] === 'number') ? map[email] : null;
}

function setCredits(email, amount) {
    email = email || getActiveEmail() || 'default';
    amount = Math.max(0, Math.floor(amount));         // never negative, always integer
    const map = JSON.parse(localStorage.getItem('detecta_analysis_credits') || '{}');
    map[email] = amount;
    localStorage.setItem('detecta_analysis_credits', JSON.stringify(map));
    refreshCreditUI();
}

function addCredits(email, amount) {
    email  = email  || getActiveEmail() || 'default';
    amount = Math.max(0, Math.floor(amount));
    const current = getCredits(email) || 0;
    setCredits(email, current + amount);
}

function consumeCredit(email) {
    email = email || getActiveEmail() || 'default';
    const current = getCredits(email) || 0;
    if (current <= 0) return false;     // cannot consume
    setCredits(email, current - 1);
    return true;
}

/** Give 1 credit to new accounts (called once on first visit) */
function initCredits(email) {
    email = email || getActiveEmail() || 'default';
    if (getCredits(email) === null) {   // null = never set → brand new account
        setCredits(email, 1);
    }
}

function refreshCreditUI() {
    const email   = getActiveEmail() || 'default';
    const isVip   = hasPurchase('detecta_vip') || hasPurchase('detecta_ob_all');
    const credits = isVip ? Infinity : (getCredits(email) || 0);

    const countEl   = document.getElementById('creditCount');
    const statusEl  = document.getElementById('creditStatus');
    const cardEl    = document.getElementById('creditCard');
    const blockEl   = document.getElementById('uploadCreditBlock');
    const zone      = document.getElementById('dashboardUploadZone');
    const legacyMsg = document.getElementById('uploadRestrictionMsg');

    if (!countEl) return;   // UI not present

    if (isVip) {
        countEl.textContent  = 'Ilimitadas';
        if (statusEl) statusEl.textContent = 'Acesso VIP Ilimitado ativado.';
        if (cardEl)   cardEl.classList.remove('credit-danger');
        if (blockEl)  blockEl.classList.add('hidden');
        if (zone)     zone.classList.remove('zone-blocked');
        if (legacyMsg) legacyMsg.classList.add('hidden');
        return;
    }

    const label = credits === 1 ? '1 crédito restante' : `${credits} créditos restantes`;
    countEl.textContent = credits > 0 ? label : '0 créditos restantes';

    if (credits === 0) {
        if (statusEl) statusEl.innerHTML = 'Você utilizou sua análise disponível.<br><span style="color:#94a3b8;font-size:0.82rem;">Adicione créditos extras para realizar novas análises.</span>';
        if (cardEl)   cardEl.classList.add('credit-danger');
        if (blockEl)  blockEl.classList.remove('hidden');
        if (zone)     zone.classList.add('zone-blocked');
        if (legacyMsg) legacyMsg.classList.add('hidden');
    } else if (credits === 1) {
        if (statusEl) statusEl.textContent = 'Você está utilizando sua última análise disponível.';
        if (cardEl)   cardEl.classList.remove('credit-danger');
        if (blockEl)  blockEl.classList.add('hidden');
        if (zone)     zone.classList.remove('zone-blocked');
        if (legacyMsg) legacyMsg.classList.add('hidden');
    } else {
        if (statusEl) statusEl.textContent = '';
        if (cardEl)   cardEl.classList.remove('credit-danger');
        if (blockEl)  blockEl.classList.add('hidden');
        if (zone)     zone.classList.remove('zone-blocked');
        if (legacyMsg) legacyMsg.classList.add('hidden');
    }
}

function hasPurchase(itemId) {
    const user = getUserData();
    if(user && user.purchases) {
        return user.purchases[itemId] === true;
    }
    return false; // Global fallback REMOVED for strict multi-user isolation
}

function savePurchase(itemId) {
    const user = getUserData();
    if(user) {
        if(!user.purchases) user.purchases = {};
        user.purchases[itemId] = true;
        saveUserData(user);
    } 
    // Global setItem removed. Purchase is bound precisely to this email.
}

document.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem('detecta_auth') !== 'true') {
        window.location.href = 'register.html';
        return;
    }

    // Process unlocked Orderbumps
    const orderbumps = ['detecta_vip', 'detecta_ob_apego', 'detecta_ob_micro', 'detecta_ob_ocultos', 'detecta_ob_horarios', 'detecta_ob_mentiras', 'detecta_ob_all'];
    orderbumps.forEach(ob => {
        if(hasPurchase(ob)) {
            const elId = ob.replace('detecta_ob_', 'bump-').replace('detecta_vip', 'bump-vip');
            const el = document.getElementById(elId);
            if(el) {
                el.classList.remove('locked');
                el.classList.add('unlocked');
                const btn = el.querySelector('button');
                if(btn) {
                    btn.textContent = ob === 'detecta_ob_all' ? "MÓDULOS ATIVADOS" : "✅ Ativado";
                    btn.disabled = true;
                    btn.classList.add('btn-disabled');
                    btn.style.background = 'rgba(16,185,129,0.2)';
                    if(ob === 'detecta_vip') btn.style.color = '#10b981';
                }
                const lock = el.querySelector('.lock-overlay');
                if(lock) lock.remove();
            }
        }
    });
});

// 2. Drag and Drop Handling
const dashDropzone = document.getElementById('dashboardUploadZone');
const dashFileInput = document.getElementById('dashFileInput');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
    dashDropzone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); });
});

['dragenter', 'dragover'].forEach(evt => {
    dashDropzone.addEventListener(evt, () => dashDropzone.style.borderColor = 'var(--accent-red)');
});

['dragleave', 'drop'].forEach(evt => {
    dashDropzone.addEventListener(evt, () => dashDropzone.style.borderColor = 'rgba(138,43,226,0.4)');
});

dashDropzone.addEventListener('drop', (e) => {
    handleDashFile(e.dataTransfer.files);
});

dashFileInput.addEventListener('change', function() {
    handleDashFile(this.files);
});

function checkUploadLimitAndOpen() {
    const isVip    = hasPurchase('detecta_vip') || hasPurchase('detecta_ob_all');
    const email    = getActiveEmail() || 'default';
    const credits  = getCredits(email) || 0;

    if (!isVip && credits <= 0) {
        refreshCreditUI();   // make sure blocked state is shown
        return;
    }

    document.getElementById('dashFileInput').click();
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

function refundCreditIfBasic() {
    const isVip = hasPurchase('detecta_vip') || hasPurchase('detecta_ob_all');
    const email = getActiveEmail() || 'default';
    if (!isVip) {
        addCredits(email, 1);
    }
}

function handleDashFile(files) {
    if (files.length === 0) return;

    const file = files[0];
    
    // TASK 1.1: Limite de tamanho estrito no frontend (20MB)
    if (file.size > MAX_FILE_SIZE) {
        alert('O arquivo é muito grande. O limite máximo é de 20MB. Certifique-se de exportar a conversa sem arquivos de mídia.');
        return;
    }

    const nameLower = file.name.toLowerCase();
    const isTxt = nameLower.endsWith('.txt');
    const isZip = nameLower.endsWith('.zip');

    if (!isTxt && !isZip) {
        alert('Por favor, selecione um arquivo .txt ou .zip original do WhatsApp.');
        return;
    }

    // TASK 1.2 e 1.3: Verificação de Segurança (Magic Bytes e tipo real)
    validateFileSecurity(file, isZip, (isValid, errorMessage) => {
        if (!isValid) {
            alert(errorMessage || 'Arquivo inválido ou corrompido. Tentativa de upload bloqueada.');
            return;
        }

        const isVip   = hasPurchase('detecta_vip') || hasPurchase('detecta_ob_all');
        const email   = getActiveEmail() || 'default';
        const credits = getCredits(email) || 0;

        if (!isVip && credits <= 0) {
            refreshCreditUI();
            return;
        }

        // Consume 1 credit before starting (VIP users are unaffected)
        if (!isVip) {
            const ok = consumeCredit(email);
            if (!ok) { refreshCreditUI(); return; }
        }

        if (isZip) {
            readZipAndAnalyze(file);
        } else {
            readFileAndAnalyze(file);
        }
    });
}

function validateFileSecurity(file, isZip, callback) {
    // TASK 1.2: Validar MIME type real relatado pelo navegador (camada extra)
    if (isZip && file.type && !file.type.includes('zip') && !file.type.includes('application/x-zip-compressed') && !file.type.includes('application/zip')) {
        console.warn("MIME type suspeito para ZIP:", file.type);
    }

    // TASK 1.3: Checagem de Magic Bytes / File Signature
    const reader = new FileReader();
    const blob = file.slice(0, 512); // Lê apenas os primeiros 512 bytes
    
    reader.onloadend = function(e) {
        if (e.target.readyState !== FileReader.DONE) {
            return callback(false, 'Erro ao tentar ler o arquivo base.');
        }

        const uint8 = new Uint8Array(e.target.result);
        if (uint8.length === 0) {
            return callback(false, 'O arquivo está vazio.');
        }
        
        if (isZip) {
            // ZIP Magic Bytes: 50 4B 03 04 (PK\x03\x04)
            if (uint8.length >= 4 && uint8[0] === 0x50 && uint8[1] === 0x4B && uint8[2] === 0x03 && uint8[3] === 0x04) {
                callback(true);
            } else {
                callback(false, 'Assinatura de arquivo inválida. O arquivo não é um ZIP verdadeiro (spoofing detectado).');
            }
        } else {
            // TXT Magic Bytes / Validação de texto: 
            // Garante que não contém null bytes (0x00), que são comuns em binários (.exe, .dll, etc)
            let hasNullByte = false;
            for (let i = 0; i < uint8.length; i++) {
                if (uint8[i] === 0x00) {
                    hasNullByte = true;
                    break;
                }
            }

            if (hasNullByte) {
                callback(false, 'Formato binário bloqueado por segurança. Envie apenas o arquivo .txt de texto puro exportado do WhatsApp.');
                return;
            }

            callback(true);
        }
    };
    
    reader.onerror = () => callback(false, 'Falha de segurança ao acessar os bytes do arquivo.');
    reader.readAsArrayBuffer(blob);
}

function readFileAndAnalyze(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '').length;
        triggerDashboardAnalysisSimulation(text, lines);
    };
    reader.onerror = function() {
        refundCreditIfBasic();
        alert("Erro ao processar o arquivo de texto.");
    };
    reader.readAsText(file, 'utf-8');
}

function readZipAndAnalyze(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        JSZip.loadAsync(e.target.result).then(function(zip) {
            const txtFileName = Object.keys(zip.files).find(name => name.endsWith('.txt'));
            if(txtFileName) {
                zip.files[txtFileName].async('string').then(function(text) {
                    // Proteção extra: se o TXT extraído for imenso
                    if (text.length > MAX_FILE_SIZE) {
                        refundCreditIfBasic();
                        alert('O texto extraído do ZIP excede o limite de 20MB. Análise bloqueada.');
                        return;
                    }
                    const lines = text.split('\n').filter(line => line.trim() !== '').length;
                    triggerDashboardAnalysisSimulation(text, lines);
                }).catch(() => {
                    refundCreditIfBasic();
                    alert("Falha ao ler o conteúdo do texto de dentro do ZIP.");
                });
            } else {
                refundCreditIfBasic();
                alert("O arquivo ZIP não contém texto legível (.txt) exportado do WhatsApp.");
            }
        }).catch(() => {
            refundCreditIfBasic();
            alert("Erro ao ler o arquivo ZIP. Ele pode estar corrompido. Tente enviar o .txt diretamente.");
        });
    };
    reader.onerror = function() {
        refundCreditIfBasic();
        alert("Falha de I/O ao carregar o arquivo ZIP.");
    };
    reader.readAsArrayBuffer(file);
}

function triggerDashboardAnalysisSimulation(text, lines) {
    const modal = document.getElementById('dashAnalyzeModal');
    const msg = document.getElementById('dashStatusMsg');
    const pBar = document.getElementById('dashProgressBar');
    if(!modal) return processTextAndRenderStatus(text, lines);

    modal.classList.remove('hidden');
    pBar.style.width = '0%';
    
    let prog = 0;
    const interval = setInterval(() => {
        prog += Math.random() * 20;
        if(prog > 100) prog = 100;
        pBar.style.width = prog + '%';
        
        let displayLines = Math.floor((prog / 100) * lines);
        if(msg) msg.innerHTML = `Lendo linhas de texto: <span style="color:#fff; font-weight:bold;">${displayLines.toLocaleString()}</span> identificadas`;
        
        if(prog === 100) {
            clearInterval(interval);
            if(msg) msg.innerHTML = "Processando Matriz Psicológica...";
            setTimeout(() => {
                modal.classList.add('hidden');
                processTextAndRenderStatus(text, lines);
            }, 1200);
        }
    }, 450);
}

// 3. Fake Store / Upsell logic
function simulatePurchase(btn, orderbumpId) {
    if(btn.disabled) return;
    btn.textContent = "Processando...";
    setTimeout(() => {
        window.alert("Redirecionando para o Checkout (Kiwify/PerfectPay)...");
        // Pretend purchase was successful for demo
        if(orderbumpId === 'detecta_ob_all') {
            const allBumps = ['detecta_vip', 'detecta_ob_apego', 'detecta_ob_micro', 'detecta_ob_ocultos', 'detecta_ob_horarios', 'detecta_ob_mentiras', 'detecta_ob_all'];
            allBumps.forEach(b => savePurchase(b));
        } else if (orderbumpId === 'detecta_vip') {
            savePurchase('detecta_vip');
        }
        window.location.reload();
    }, 800);
}

// 4. Word Dictionaries for NLP Simulation
const dictGaslighting = ["louca", "exagerada", "inventando", "surtando", "confuso", "nada a ver", "imaginando", "viajando", "paranoia", "coisa da sua cabeça"];
const dictEvasive = ["não sei", "ocupado", "muito ocupado", "tarde demais", "amanhã vejo", "depois vejo", "correria", "sem tempo", "trabalhando", "dor de cabeça"];
const dictDefensive = ["mas você", "sempre eu", "nunca", "também", "problema seu", "sua culpa"];
const dictRomantic = ["amor", "vida", "bebê", "bb", "saudade", "beijo", "te amo", "lindo", "linda", "paixão", "coração"];
const dictProfessional = ["chefe", "planilha", "reunião", "boleto", "projeto", "cliente", "trabalho", "escola", "faculdade", "professor"];
const dictLies = ["imprevisto", "fiquei sem bateria", "dormi do nada", "apagou do nada", "passei mal", "não vi sua mensagem", "celular descarregou", "sem sinal"];
const dictSecrets = ["apaga", "não conta", "segredo", "meu amigo", "minha amiga", "deleta", "vou lá", "depois explico", "ninguém pode saber"];
const dictMicro = ["era brincadeira", "só zoeira", "tão sensível", "não aguenta", "calma", "tá estressada", "exagerada", "oficazinha"];

function parseWhatsAppChat(text) {
    const lines = text.split('\n');
    const messages = [];
    const pattern = /^\[?(\d{2}\/\d{2}\/\d{2,4})[, ]+(\d{2}:\d{2})(:\d{2})?\]?[ -]+([^:]+):\s*(.*)$/;
    let senders = new Set();
    
    for(let line of lines) {
        let match = line.match(pattern);
        if(match) {
            let sender = match[4].trim();
            if (sender.toLowerCase().includes("mensagem") || sender.includes("criptografia")) continue;
            
            let dateStr = match[1];
            let timeStr = match[2];
            let msgText = match[5].trim();
            
            senders.add(sender);
            
            let parts = dateStr.split('/');
            let year = parts[2].length === 2 ? "20" + parts[2] : parts[2];
            let dateObj = new Date(`${year}-${parts[1]}-${parts[0]}T${timeStr}:00`);
            let day = dateObj.getDay(); 
            let isWeekend = (day === 0 || day === 6 || (day === 5 && parseInt(timeStr.split(':')[0]) >= 20));
            
            messages.push({
                date: dateStr,
                time: timeStr,
                sender: sender,
                rawMsg: msgText,
                isWeekend: isWeekend,
                timestamp: dateObj.getTime() || 0
            });
        }
    }
    
    let senderArr = Array.from(senders);
    let anonMap = {};
    if(senderArr.length > 0) anonMap[senderArr[0]] = "Pessoa A";
    if(senderArr.length > 1) anonMap[senderArr[1]] = "Pessoa B";
    
    messages.forEach(m => m.anonSender = anonMap[m.sender] || "Pessoa X");
    return messages;
}

function findMatches(messages, dictionary) {
    let matches = [];
    messages.forEach(m => {
        let lowerMsg = m.rawMsg.toLowerCase();
        let found = dictionary.find(word => lowerMsg.includes(word.toLowerCase()));
        if(found) {
            matches.push({ word: found, msgData: m });
        }
    });
    return matches;
}

function formatQuotes(matchArr, max = 3) {
    if(matchArr.length === 0) return "";
    let sliced = matchArr.slice(0, max);
    return sliced.map(m => `<br><span style="color:#94a3b8; font-size:0.85rem;">[${m.msgData.date} ${m.msgData.time}] —</span> "${m.msgData.rawMsg}"`).join('');
}

// =======================================================
// CAMADA DE ANÁLISE PROFUNDA — Momentos Analisados
// =======================================================

const momentLabelPool = [
    "Trecho Interpretado",
    "Ponto Sensível Detectado",
    "Leitura Contextual",
    "Ocorrência Detectada"
];

function extractMoments(messages, gasData, evaData, defData, secData, microData, lieData) {
    const moments = [];
    const usedKeys = new Set();

    function pickMsg(matches) {
        for (let m of matches) {
            const key = `${m.msgData.date}_${m.msgData.time}_${m.msgData.sender}`;
            if (!usedKeys.has(key) && m.msgData.rawMsg.length > 8 && m.msgData.rawMsg.length < 280) {
                usedKeys.add(key);
                return m.msgData;
            }
        }
        return null;
    }

    // 1. Inversão de percepção (Gaslighting)
    if (gasData.length > 0) {
        const msg = pickMsg(gasData);
        if (msg) moments.push({
            theme: "Inversão da Percepção Emocional",
            quote: msg.rawMsg,
            meta: `${msg.date} às ${msg.time} — ${msg.anonSender}`,
            perception: `A IA percebeu que, neste trecho, o conteúdo emocional da pergunta ou afirmação original não foi diretamente respondido. Em vez de oferecer clareza, a mensagem parece redirecionar o foco para a reação ou postura de quem questiona — tratando a dúvida como exagero, sensibilidade excessiva ou erro de interpretação. Esse padrão cria um efeito de desestabilização gradual: quem questiona passa a questionar a si mesmo antes de questionar a situação.`,
            impact: `Quando a dúvida é tratada como defeito de quem duvida, o efeito acumulado é o silêncio. Não porque não há razão para questionar — mas porque questionar passou a ter um custo emocional maior do que aceitar em silêncio.`
        });
    }

    // 2. Evasividade e postergação emocional
    if (evaData.length > 0) {
        const msg = pickMsg(evaData);
        if (msg) moments.push({
            theme: "Afastamento e Postergação Emocional",
            quote: msg.rawMsg,
            meta: `${msg.date} às ${msg.time} — ${msg.anonSender}`,
            perception: `A IA percebeu que este trecho é representativo de um padrão mais amplo identificado na conversa: em momentos onde uma resposta direta era esperada, o que aparece é um argumento de indisponibilidade. Isoladamente, essa resposta seria compreensível. O que a análise avalia é sua frequência e contexto — quando a indisponibilidade se torna o padrão de resposta para situações emocionalmente exigentes, ela passa a funcionar como uma forma de manter distância sem precisar declará-la.`,
            impact: `A postergação recorrente de respostas emocionalmente esperadas cria uma assimetria silenciosa: uma pessoa aguardando, outra se ausentando sem custo emocional aparente — e sem que isso seja nunca diretamente endereçado na conversa.`
        });
    }

    // 3. Defensividade e desvio de responsabilidade
    if (defData.length > 0) {
        const msg = pickMsg(defData);
        if (msg) moments.push({
            theme: "Desvio Defensivo de Responsabilidade",
            quote: msg.rawMsg,
            meta: `${msg.date} às ${msg.time} — ${msg.anonSender}`,
            perception: `Neste trecho, a resposta apresentada não responde ao conteúdo emocional da situação — ela o evita. O foco da conversa é deslocado para a conduta de quem iniciou o diálogo, transformando uma tentativa de comunicação em uma contestação de postura. A análise identifica esse comportamento como um mecanismo de proteção emocional que evita vulnerabilidade através do redirecionamento: em vez de responder ao que foi colocado, o movimento defensivo coloca o outro lado em posição de se justificar.`,
            impact: `O efeito acumulado desse padrão é que quem tenta se comunicar começa a sentir que a responsabilidade pelo desentendimento é sempre redirecionada. A sensação resultante costuma ser: independente do que eu diga ou de como eu diga, a culpa sempre volta para mim.`
        });
    }

    // 4. Linguagem de ocultação
    if (secData.length > 0) {
        const msg = pickMsg(secData);
        if (msg) moments.push({
            theme: "Linguagem de Ocultação Contextual",
            quote: msg.rawMsg,
            meta: `${msg.date} às ${msg.time} — ${msg.anonSender}`,
            perception: `A IA detectou, neste trecho, o uso de linguagem associada à gestão seletiva de informação. Expressões que sugerem um contexto paralelo — pedidos de sigilo, referências vagas a terceiros, ou acordos implícitos de não compartilhamento — foram identificadas. A análise não afirma o que está sendo ocultado, mas registra que parte das interações parece ser administrada de forma seletiva, fora do espaço compartilhado da relação analisada.`,
            impact: `A percepção de que parte da realidade está sendo gerenciada fora do campo de visão cria uma desconfiança difusa e difícil de nomear — exatamente porque não há algo específico a confrontar, apenas uma sensação persistente de que nem tudo está sendo dito.`
        });
    }

    // 5. Justificativas com padrão repetitivo
    if (moments.length < 5 && lieData.length >= 2) {
        const msg = pickMsg(lieData);
        if (msg) moments.push({
            theme: "Justificativa com Padrão Repetitivo",
            quote: msg.rawMsg,
            meta: `${msg.date} às ${msg.time} — ${msg.anonSender}`,
            perception: `A IA identificou o uso repetido de justificativas com estrutura narrativa semelhante ao longo da conversa. Explicações baseadas em imprevistos técnicos ou fisiológicos aparecem de forma recorrente como resposta para ausências ou silêncios. A análise avalia não cada ocorrência isoladamente, mas a frequência com que esse repertório específico é acionado. A repetição de um mesmo padrão narrativo em contextos variados sugere que ele funciona como estratégia de gestão de situação, e não como relato espontâneo.`,
            impact: `O impacto emocional não está em acreditar ou não em cada justificativa individual — está no acúmulo. Quando a mesma categoria de explicação aparece de forma sistemática, ela deixa de parecer relato e começa a parecer recurso. E o que não pode ser verificado nunca é completamente resolvido.`
        });
    }

    // 6. Minimização emocional velada
    if (moments.length < 5 && microData.length > 0) {
        const msg = pickMsg(microData);
        if (msg) moments.push({
            theme: "Minimização Emocional Velada",
            quote: msg.rawMsg,
            meta: `${msg.date} às ${msg.time} — ${msg.anonSender}`,
            perception: `Neste trecho, a IA percebeu o uso de linguagem que minimiza a reação emocional da outra pessoa. Mesmo apresentada como brincadeira ou comentário casual, a mensagem enquadra a sensibilidade como exagero ou falta de senso de humor. Individualmente, esse tipo de expressão parece inofensivo. O que a análise avalia é seu efeito acumulado: quando a experiência emocional de alguém é sistematicamente tratada como excesso, a pessoa aprende a calibrar o que pode ou não expressar — não por escolha, mas por condicionamento gradual.`,
            impact: `O efeito mais profundo da minimização emocional recorrente não é a ofensa pontual — é o silenciamento gradual. A pessoa aprende a não expressar o que sente para evitar ser novamente enquadrada como sensível demais ou exagerada.`
        });
    }

    return moments.slice(0, 5);
}

function buildTimelineInterpretation(messages) {
    if (messages.length < 15) return null;

    const third = Math.floor(messages.length / 3);
    const phase1 = messages.slice(0, third);
    const phase2 = messages.slice(third, third * 2);
    const phase3 = messages.slice(third * 2);

    function countRisk(msgs) {
        return findMatches(msgs, dictEvasive).length +
               findMatches(msgs, dictDefensive).length +
               findMatches(msgs, dictGaslighting).length;
    }
    function countAffection(msgs) {
        return findMatches(msgs, dictRomantic).length;
    }

    const r1 = countRisk(phase1), a1 = countAffection(phase1);
    const r2 = countRisk(phase2);
    const r3 = countRisk(phase3);
    let segments = [];

    if (a1 > r1 && a1 > 0) {
        segments.push(`Na abertura da conversa, a análise detecta maior espontaneidade emocional e uma frequência mais alta de linguagem afetiva. As trocas dessa fase apresentam características de engajamento ativo e disponibilidade emocional relativa entre os participantes.`);
    } else if (r1 > 0) {
        segments.push(`Já nos registros iniciais da conversa, a análise identificou marcadores comportamentais que indicam algum nível de tensão ou distanciamento emocional. Essa presença precoce sugere que o padrão detectado não é recente nesta dinâmica.`);
    } else {
        segments.push(`Os registros iniciais da conversa apresentam uma dinâmica comunicacional sem marcadores críticos proeminentes, com trocas relativamente estáveis entre os participantes.`);
    }

    if (r2 > r1) {
        segments.push(`Conforme a conversa avança, a análise detecta uma mudança gradual de postura: respostas mais breves, menor espontaneidade afetiva e uma frequência crescente de padrões de desvio ou postergação emocional. Esse tipo de transição raramente é abrupta — ela acontece como uma erosão gradual do engajamento, muitas vezes imperceptível no calor das trocas.`);
    } else {
        segments.push(`No período intermediário, o padrão comunicacional apresenta relativa continuidade, sem alterações bruscas de tom que sinalizem uma ruptura clara na dinâmica.`);
    }

    if (r3 > r1 && r3 > r2) {
        segments.push(`Nos registros mais recentes, a análise detecta o ponto de maior concentração de padrões de distanciamento. A frequência de comportamentos evasivos, defensivos ou emocionalmente desviados atinge seu nível mais alto no período final — o que indica que o padrão não apenas se manteve, mas apresentou aumento de intensidade ao longo do tempo analisado.`);
    } else if (r3 < r1 && r3 < r2) {
        segments.push(`Os registros mais recentes apresentam uma redução nos marcadores de risco em relação a períodos anteriores, o que pode indicar uma tentativa de reaproximação emocional ou mudança de postura no período final analisado. A análise registra essa variação sem determinar sua motivação.`);
    } else {
        segments.push(`Os registros mais recentes não apontam para uma mudança expressiva em relação ao padrão geral da conversa. O comportamento detectado mantém-se consistente ao longo de todo o período analisado.`);
    }

    return segments.join(' ');
}

function buildMomentosHTML(moments) {
    if (!moments || moments.length === 0) {
        return `<div class="moments-section"><h3 class="mt-4">3. Momentos Analisados</h3><p class="section-desc">Trechos reais da conversa interpretados comportamentalmente pela IA.</p><div class="moments-empty"><p>A IA não encontrou recorrência suficiente de padrões críticos para gerar interpretações contextuais profundas nesta conversa.</p></div></div>`;
    }
    const cards = moments.map((m, i) => {
        const label = momentLabelPool[i % momentLabelPool.length];
        return `<div class="moment-card"><div class="moment-header"><span class="moment-label-tag">${label}</span><span class="moment-theme-tag">${m.theme}</span></div><div class="moment-quote-block"><div class="moment-quote-eyebrow">Trecho da conversa</div><blockquote class="moment-blockquote">${m.quote}</blockquote><div class="moment-meta">${m.meta}</div></div><div class="moment-perception-block"><div class="moment-block-label">O que a IA percebeu</div><p class="moment-body-text">${m.perception}</p></div><div class="moment-impact-block"><div class="moment-block-label moment-impact-label">Impacto emocional identificado</div><p class="moment-body-text">${m.impact}</p></div></div>`;
    }).join('');
    return `<div class="moments-section"><h3 class="mt-4">3. Momentos Analisados</h3><p class="section-desc">Trechos reais da conversa interpretados comportamentalmente pela IA. Cada trecho foi selecionado por seu peso emocional e padrão comportamental detectado.</p><div class="moments-list">${cards}</div></div>`;
}

function buildTimelineHTML(text) {
    if (!text) return '';
    return `<div class="timeline-section mt-4"><div class="timeline-header"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg><span>Evolução Emocional da Conversa</span></div><p class="timeline-body">${text}</p></div>`;
}

function processTextAndRenderStatus(fullText, lineCount) {
    const messages = parseWhatsAppChat(fullText);
    const validLines = messages.length;
    
    // 1. Check Romantic Context
    const roman = findMatches(messages, dictRomantic);
    const prof = findMatches(messages, dictProfessional);
    
    if (roman.length === 0 && prof.length >= 3 && validLines > 30) {
        document.getElementById('repTotalMsgs').textContent = validLines.toLocaleString();
        document.getElementById('repRiskScore').textContent = 'Erro';
        document.getElementById('repDominantFactor').textContent = 'Análise Recusada';
        const gasEl = document.getElementById('gaslightingResults');
        gasEl.innerHTML = `⚠️ <strong>Análise Incompatível:</strong> O contexto detectado aponta para um relacionamento profissional ou amizade.`;
        gasEl.style.borderLeft = "4px solid var(--warning-yellow)";
        document.getElementById('gottmanResults').innerHTML = "";
        document.getElementById('repVeredict').innerHTML = "Abortamos o laudo de infidelidade, pois a conversa foge dos padrões de um relacionamento amoroso.";
        document.getElementById('reportWrapper').classList.remove('hidden');
        document.getElementById('store').classList.remove('hidden');
        return;
    }

    // 2. Perform granular Contextual Analysis
    let gasData = findMatches(messages, dictGaslighting);
    let evaData = findMatches(messages, dictEvasive);
    let defData = findMatches(messages, dictDefensive);
    // Pre-compute all dictionaries for deep analysis layer
    let secAll  = findMatches(messages, dictSecrets);
    let lieAll  = findMatches(messages, dictLies);
    let microAll = findMatches(messages, dictMicro);
    
    let totalRiskPoints = (gasData.length * 5) + (evaData.length * 2) + (defData.length * 2.5);
    let riskRatio = validLines > 0 ? (totalRiskPoints / validLines) * 100 : 0;
    
    // Calculate HONEST limits based on User request
    let riskScore = 0;
    if(totalRiskPoints === 0) {
        riskScore = 15 + Math.floor(Math.random() * 10); // 15-25% healthy
    } else {
        riskScore = 30 + (riskRatio * 5);
        if(riskScore > 95) riskScore = 95 - Math.floor(Math.random() * 5); // Max 90-95%
    }
    riskScore = Math.floor(riskScore);

    let dominant = "Neutro";
    let dominantVal = Math.max(gasData.length, evaData.length, defData.length);
    if(dominantVal === evaData.length && evaData.length > 0) dominant = "Frieza Tática (Evasão)";
    if(dominantVal === defData.length && defData.length > 0) dominant = "Ataque na Defensiva";
    if(dominantVal === gasData.length && gasData.length > 0) dominant = "Manipulação (Gaslighting)";
    if(totalRiskPoints === 0) dominant = "Comunicação Segura";

    // Update the DOM
    document.getElementById('repTotalMsgs').textContent = validLines.toLocaleString();
    document.getElementById('repRiskScore').textContent = riskScore + '%';
    document.getElementById('repDominantFactor').textContent = dominant;
    
    // Color code risk score
    const riskEl = document.getElementById('repRiskScore');
    riskEl.classList.remove('font-red');
    if(riskScore >= 56) {
        riskEl.style.color = 'var(--accent-red)';
    } else if (riskScore > 30) {
        riskEl.style.color = 'var(--warning-yellow)';
    } else {
        riskEl.style.color = 'var(--success-green)';
    }

    // Update Gaslighting Box with Sincere Data
    const gasEl = document.getElementById('gaslightingResults');
    if(gasData.length > 0) {
        gasEl.innerHTML = `⚠️ <strong>Risco Psicológico Detectado:</strong><br>Encontramos <strong>${gasData.length}</strong> evidências reais de distorção de realidade ou minimização de sentimentos. A prova exata extraída:${formatQuotes(gasData, 2)}`;
        gasEl.style.borderLeft = "4px solid var(--accent-red)";
    } else {
        gasEl.innerHTML = `✅ <strong>Comunicação Limpa:</strong><br>Revisamos as ${validLines} mensagens processadas e não encontramos nenhum padrão focado em desvalidar você por meio de Gaslighting.`;
        gasEl.style.borderLeft = "4px solid var(--success-green)";
    }

    // Update Gottman
    const gottmanEl = document.getElementById('gottmanResults');
    gottmanEl.innerHTML = "";
    if(defData.length > 0) {
        gottmanEl.innerHTML += `<li><strong>Ataque Defensivo Mapeado (${defData.length}x):</strong> Contra-ataques confirmados onde a pessoa projeta a culpa de volta em você invés de resolver o problema: ${formatQuotes(defData, 2)}</li>`;
    }
    if(evaData.length > 0) {
        gottmanEl.innerHTML += `<li><strong>Afastamento Tático de Tempo (${evaData.length}x):</strong> A pessoa foge e cria vácuos para evitar o compromisso emocional. Extraído do histórico: ${formatQuotes(evaData, 2)}</li>`;
    }
    if(defData.length === 0 && evaData.length === 0) {
        gottmanEl.innerHTML = `<li style="border-left-color: var(--success-green);"><strong>Estabilidade de Diálogo:</strong> Não foram detectadas manobras punitivas ou de frieza profunda. O casal apresenta um fluxo de conversa natural sem sinais ocultos de defesa.</li>`;
    }

    // Process Orderbumps DYNAMICALLY
    if(hasPurchase('detecta_ob_apego')) {
        if(evaData.length >= 3) {
            gottmanEl.innerHTML += `<li style="border-left-color: #a855f7;">✨ [Módulo Extra]: <strong>Apego Evitativo</strong> - Padrão consistente de afastamento confirmado. Após momentos comuns, houve retenção emocional estruturada (detectado >3 recuos). Evidência do puxa-empurra identificada no chat temporal.</li>`;
        } else {
            gottmanEl.innerHTML += `<li style="border-left-color: #a855f7;">✨ [Módulo Extra]: <strong>Apego Evitativo</strong> - A inteligência avaliou o histórico de idas e vindas e não constatou puxa-empurra psicológico grave e estruturado.</li>`;
        }
    }
    if(hasPurchase('detecta_ob_micro')) {
        let microData = findMatches(messages, dictMicro);
        if(microData.length > 0) {
            gottmanEl.innerHTML += `<li style="border-left-color: #a855f7;">✨ [Módulo Extra]: <strong>Micro-Agressões</strong> - Veneno verbal detectado sob disfarce de brincadeira: ${formatQuotes(microData, 1)}</li>`;
        } else {
            gottmanEl.innerHTML += `<li style="border-left-color: #a855f7;">✨ [Módulo Extra]: <strong>Micro-Agressões</strong> - Nenhuma agressão passiva ou minagem de autoestima ("só brincadeira") encontrada nas métricas.</li>`;
        }
    }
    if(hasPurchase('detecta_ob_ocultos')) {
        let secData = findMatches(messages, dictSecrets);
        if(secData.length > 0) {
            gottmanEl.innerHTML += `<li style="border-left-color: #eab308;">🔍 [Módulo Extra]: <strong>Contatos Ocultos</strong> - O log interceptou linguajar de terceiro plano não identificado diretamente: ${formatQuotes(secData, 1)}</li>`;
        } else {
            gottmanEl.innerHTML += `<li style="border-left-color: #eab308;">🔍 [Módulo Extra]: <strong>Contatos Ocultos</strong> - Verificamos as métricas de conversação e não foi identificada menção secreta ou "código" apontando terceiros ocultos.</li>`;
        }
    }
    if(hasPurchase('detecta_ob_horarios')) {
        let weekendGaps = messages.filter(m => m.isWeekend && evaData.find(e => e.msgData === m));
        if(weekendGaps.length >= 2) {
            gottmanEl.innerHTML += `<li style="border-left-color: #eab308;">🕒 [Módulo Extra]: <strong>Horários Tóxicos</strong> - Silêncio estratégico identificado nos finais de semana de ${weekendGaps[0].msgData.date}, indicando desligamento da relação nos momentos sociais chaves.</li>`;
        } else {
            gottmanEl.innerHTML += `<li style="border-left-color: #eab308;">🕒 [Módulo Extra]: <strong>Horários Tóxicos</strong> - O bot cruzou as datas e não encontrou "janelas de vácuo abissais" concentradas apenas durante as noites livres de Final de Semana.</li>`;
        }
    }
    if(hasPurchase('detecta_ob_mentiras')) {
        let lieData = findMatches(messages, dictLies);
        if(lieData.length >= 3) {
            gottmanEl.innerHTML += `<li style="border-left-color: #eab308;">🤖 [Módulo Extra]: <strong>Mentiras Prontas</strong> - Anomalia Estatística: A mesma desculpa de roteiro foi usada seguidamente (${lieData.length} vezes): ${formatQuotes(lieData, 2)}</li>`;
        } else {
            gottmanEl.innerHTML += `<li style="border-left-color: #eab308;">🤖 [Módulo Extra]: <strong>Mentiras Prontas</strong> - Não houve repetição massiva e suspeita de desculpas "prontas" (exemplo: cair sinal seguidamente). Frequência normal e esporádica calculada.</li>`;
        }
    }

    // ── Inject Momentos Analisados + Timeline before verdict ──
    const conclusionBox = document.querySelector('.conclusion-box');
    if (conclusionBox) {
        const prev = document.querySelector('.moments-section');
        if (prev) prev.remove();
        const prevTl = document.querySelector('.timeline-section');
        if (prevTl) prevTl.remove();

        const moments = extractMoments(messages, gasData, evaData, defData, secAll, microAll, lieAll);
        const timelineText = buildTimelineInterpretation(messages);
        conclusionBox.insertAdjacentHTML('beforebegin', buildMomentosHTML(moments));
        conclusionBox.insertAdjacentHTML('beforebegin', buildTimelineHTML(timelineText));
    }

    // Final deep narrative verdict
    const verEl = document.getElementById('repVeredict');
    const gasP  = gasData.length > 0  ? `A análise de distorção de percepção identificou <strong>${gasData.length} momento(s)</strong> onde a resposta emocional parece priorizar a desestabilização de quem questiona ao invés do esclarecimento direto. Esse padrão, quando recorrente, tem efeito cumulativo sobre a segurança emocional de quem está no lado receptor.<br><br>` : '';
    const evaP  = evaData.length > 0  ? `Foram identificados <strong>${evaData.length} padrão(ões) de postergação ou evasão emocional</strong> — momentos onde uma resposta direta era possível e esperada, mas foi substituída por desvio, indisponibilidade ou ausência não justificada.<br><br>` : '';
    const defP  = defData.length > 0  ? `O mecanismo de desvio defensivo aparece <strong>${defData.length} vez(es)</strong> como resposta a tentativas de diálogo, indicando uma postura que prioriza não ser responsabilizado ao invés de resolver a tensão emocional existente.<br><br>` : '';
    
    if(riskScore >= 80) {
        verEl.innerHTML = `A análise da conversa processada resultou em um score de <strong>${riskScore}%</strong> de risco — um valor que não emerge de um episódio isolado, mas da soma e repetição estruturada de comportamentos emocionalmente desalinhados ao longo de toda a extensão do histórico analisado.<br><br>O que a IA identificou não foi apenas a presença de padrões de distanciamento, mas sua recorrência: o mesmo tipo de desvio emocional reemergindo em contextos diferentes, com respostas de estrutura narrativa semelhante. Essa repetição distingue um comportamento situacional de um comportamento estabelecido e consistente ao longo do tempo.<br><br>${gasP}${evaP}${defP}<strong>A combinação, intensidade e recorrência desses fatores, analisada no contexto da evolução temporal da conversa, aponta para uma dinâmica onde o desequilíbrio emocional não é acidental. O sistema identifica uma concentração elevada de sinais comportamentais de risco neste arquivo.</strong>`;
    } else if (riskScore > 55) {
        verEl.innerHTML = `A análise processou <strong>${validLines} mensagens</strong> e chegou a um score de <strong>${riskScore}%</strong> de risco — um valor construído a partir da identificação de múltiplos padrões comportamentais que, quando analisados em conjunto, compõem uma dinâmica emocionalmente desequilibrada.<br><br>A IA não identifica um comportamento isolado de risco, mas uma combinação de padrões que se repetem em diferentes momentos e contextos da conversa. Essa recorrência é o elemento central da análise: o que aparece uma vez pode ser situacional. O que aparece repetidamente em estruturas semelhantes indica uma postura comportamental consistente.<br><br>${evaP}${gasP}${defP}<strong>A análise indica a existência de um padrão comportamental estruturado que merece atenção contínua. Os sinais detectados não são conclusivos de forma isolada — mas sua consistência ao longo da conversa é o que eleva o score a esse patamar e justifica observação ativa.</strong>`;
    } else if (riskScore > 30) {
        verEl.innerHTML = `A análise processou <strong>${validLines} mensagens</strong> e resultou em um score de <strong>${riskScore}%</strong> de risco. Esse nível indica a presença de padrões comportamentais pontuais que chamam atenção, mas que não se repetem com frequência suficiente para configurar um padrão estruturado e conclusivo.<br><br>A IA identificou momentos de distanciamento emocional ou evasividade nesta conversa. No entanto, a frequência e distribuição desses momentos ao longo do histórico analisado não atingem o limiar de recorrência necessário para afirmar a existência de um comportamento deliberado e consistente.<br><br>É relevante considerar que distanciamentos pontuais podem ter múltiplas causas — pressão no trabalho, questões pessoais, estresse externo — que se manifestam temporariamente no padrão de comunicação sem necessariamente indicar intenção de desonestidade emocional.<br><br><strong>A análise recomenda atenção continuada ao padrão de comportamento ao longo do tempo. Não há evidências suficientes neste arquivo para afirmar um comportamento estruturalmente desonesto — mas há sinais que justificam observação.</strong>`;
    } else {
        verEl.innerHTML = `A análise processou <strong>${validLines} mensagens</strong> e resultou em um score de <strong>${riskScore}%</strong> de risco — um nível que indica ausência de padrões críticos recorrentes neste arquivo.<br><br>A IA revisou todos os marcadores comportamentais de evasividade, distorção de realidade, defensividade e ocultação, e não identificou recorrência estruturada desses padrões ao longo da conversa analisada.<br><br>É importante compreender o que o score baixo significa: ele não é uma garantia absoluta de que tudo está bem — ele indica que, no histórico textual desta conversa específica, os padrões linguísticos e comportamentais associados a dinâmicas de desonestidade emocional não aparecem com frequência ou intensidade suficiente para configurar um alerta.<br><br><strong>Esta análise não encontrou rastro digital consistente de manipulação, evasão estruturada ou ocultação neste arquivo. O padrão comunicacional desta conversa está dentro do esperado para uma dinâmica sem alertas críticos identificáveis.</strong>`;
    }
    
    // Save to History (Deep clone HTML)
    const wrap = document.getElementById('reportWrapper');
    const activeEmail = getActiveEmail() || 'default';
    let reports = JSON.parse(localStorage.getItem('detecta_reports_' + activeEmail) || '[]');
    
    reports.unshift({
        date: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR').substring(0,5),
        risk: riskScore,
        msgs: validLines.toLocaleString(),
        html: wrap.innerHTML
    });
    
    // Strict Cap: Only keep the latest 5 reports
    reports = reports.slice(0, 5);
    
    localStorage.setItem('detecta_reports_' + activeEmail, JSON.stringify(reports));
    
    // Increment global device usage to prevent "new account" spam
    let deviceCount = parseInt(localStorage.getItem('detecta_device_total_reports') || '0');
    localStorage.setItem('detecta_device_total_reports', deviceCount + 1);
    
    // Refresh History List
    loadReportsHistory();
    toggleView('report');
    
    // Refresh credit badge after saving report
    refreshCreditUI();
}

// Logic for switching Application Views
function toggleView(viewName) {
    const main = document.getElementById('dashMainView');
    const hist = document.getElementById('dashHistoryView');
    const rep = document.getElementById('dashReportView');
    
    if(!main || !hist || !rep) return;
    
    main.classList.add('hidden');
    hist.classList.add('hidden');
    rep.classList.add('hidden');
    
    if(viewName === 'main') {
        main.classList.remove('hidden');
        window.scrollTo({top: 0, behavior: 'smooth'});
    } else if (viewName === 'history') {
        hist.classList.remove('hidden');
        window.scrollTo({top: 0, behavior: 'smooth'});
    } else if (viewName === 'report') {
        rep.classList.remove('hidden');
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}

// Load user info onto dashboard
window.addEventListener('DOMContentLoaded', () => {
    const email      = getActiveEmail() || 'default';
    const storedName = localStorage.getItem('detecta_userName');
    const banner     = document.getElementById('dashWelcomeBanner');

    // Give 1 free credit to brand-new accounts
    initCredits(email);

    if (storedName) {
        if (banner) banner.classList.remove('hidden');
        const firstName = storedName.split(' ')[0];
        const placeholderNode = document.getElementById('userNameHeaderPlaceholder');
        if (placeholderNode) placeholderNode.textContent = firstName;
    } else {
        if (banner) banner.classList.remove('hidden');
    }

    // Load History & update credit badge
    loadReportsHistory();
    refreshCreditUI();
});

// History Logic
function loadReportsHistory() {
    const list = document.getElementById('reportsHistoryList');
    const emptyState = document.getElementById('emptyReportsState');
    const counterMsg = document.getElementById('historyCounterText');
    if(!list) return;
    
    const activeEmail = getActiveEmail() || 'default';
    let reports = JSON.parse(localStorage.getItem('detecta_reports_' + activeEmail) || '[]');
    
    if(counterMsg) {
        counterMsg.textContent = reports.length > 0 ? `Você possui ${reports.length} relatórios salvos.` : `Nenhum relatório salvo ainda.`;
    }

    if(reports.length === 0) {
        if(emptyState) emptyState.classList.remove('hidden');
        list.innerHTML = '';
        return;
    }
    
    if(emptyState) emptyState.classList.add('hidden');
    
    let html = '';
    reports.forEach((rep, idx) => {
        let borderColor = rep.risk > 75 ? 'var(--accent-red)' : (rep.risk > 40 ? 'var(--warning-yellow)' : 'var(--success-green)');
        html += `
        <div class="clean-box clickable" style="border-left: 4px solid ${borderColor}; display: flex; justify-content: space-between; align-items: center; padding: 1rem;" onclick="openPastReport(${idx})">
            <div>
                <h4 style="margin-bottom: 0.2rem; font-size: 1rem;">Análise Forense</h4>
                <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">${rep.date} • ${rep.msgs} msgs</p>
            </div>
            <div style="text-align: right;">
                <strong style="color: ${borderColor}; font-size: 1.2rem;">${rep.risk}%</strong>
                <div style="font-size: 0.70rem; color: #64748b; text-transform: uppercase;">Risco</div>
            </div>
        </div>
        `;
    });
    list.innerHTML = html;
}

function openPastReport(idx) {
    const activeEmail = getActiveEmail() || 'default';
    let reports = JSON.parse(localStorage.getItem('detecta_reports_' + activeEmail) || '[]');
    let rep = reports[idx];
    if(rep && rep.html) {
        const wrap = document.getElementById('reportWrapper');
        wrap.innerHTML = rep.html;
        toggleView('report');
    }
}

// 2. Drag and Drop Handling
