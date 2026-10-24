const lessons = [
 ['Atração Carnal','Percebe os mecanismos por trás da biologia feminina e usa os gatilhos certos para gerar uma atração forte e incontrolável em qualquer mulher.',0],
 ['O mito do “gajo porreiro”','Aprende porque é que as mulheres sentem repulsa pelos chamados “gajos porreiros” e o que precisas de fazer para não agir como eles.',18],
 ['O segredo da confiança','Vou revelar-te como podes transmitir uma enorme confiança mesmo quando estás tímido ou ansioso. <strong style="color:#fff">(Isto vale ouro!)</strong>',35],
 ['O imprevisível','Vou revelar-te os segredos dos sacanas para mexeres constantemente com a mente dela, deixando-a louca e viciada em ti!',51],
 ['Liderança','As mulheres adoram um líder e <strong style="color:#fff">existe uma forma certa</strong> de liderar uma mulher. Usa o que vais aprender aqui e ela seguirá o que quiseres.',67],
 ['Tensão sexual','Cria tensão sexual de forma muito rápida e fácil! Isto excita-as de uma maneira que nunca imaginaste ser possível.',84]
];
const crops=[[0,75,210,380],[515,465,178,375],[0,940,165,360],[430,1390,263,370],[0,1830,300,320]];
document.getElementById('lessons').innerHTML=lessons.map(([title,copy,y],i)=>`<article class="lesson">${i<5?`<div class="visual" aria-hidden="true" style="height:auto;aspect-ratio:${crops[i][2]}/${crops[i][3]};align-self:center"><img src="sacana/assets/Bloco-5-scaled.webp" alt="" loading="lazy" style="width:${693/crops[i][2]*100}%;left:-${crops[i][0]/crops[i][2]*100}%;top:0;transform:translateY(-${crops[i][1]/2560*100}%)"></div>`:`<div class="visual intimacy"><img src="sacana/assets/tensao-sexual.webp" alt="Casal abraçado" loading="lazy"></div>`}<div class="text"><h3>${i+1}. ${title}</h3><p>${copy}</p></div></article>`).join('');
const testimonialAssets = {1:'sacana/assets/DP1-pt-fornecido.png',2:'sacana/assets/DP2-pt-fornecido.png',3:'sacana/assets/DP3-pt-leonor-curto.png',4:'sacana/assets/DP4-pt.png',5:'sacana/assets/DP5-pt-anonimo.png',6:'sacana/assets/DP6-pt-anonimo.png'};
for (const [id, nums] of [['depoimentos',[1,2,3]],['depoimentos2',[4,5,6]]]) {
 const gallery = document.getElementById(id);
 gallery.classList.add('conversation-gallery');
 gallery.setAttribute('role','region');
 gallery.setAttribute('aria-label','Galeria de mensagens');
 gallery.innerHTML = `<div class="conversation-track" tabindex="0" aria-label="Arrasta para o lado para ver as mensagens">${nums.map((n,i)=>`<figure class="conversation-slide" aria-label="Mensagem ${i+1} de ${nums.length}"><img src="${testimonialAssets[n]}" alt="Conversa ${n} — ${testimonialAssets[n].includes('-pt')?'adaptação PT-PT para teste':'original em português do Brasil'}" loading="lazy" draggable="false"><figcaption>${testimonialAssets[n].includes('-pt')?'Adaptação PT-PT · versão de teste':'Original em português do Brasil'}</figcaption></figure>`).join('')}</div><div class="conversation-controls"><button type="button" class="conversation-prev" aria-label="Mensagem anterior">←</button><span class="conversation-position" aria-live="polite">1 / ${nums.length}</span><button type="button" class="conversation-next" aria-label="Mensagem seguinte">→</button></div><p class="conversation-hint">Arrasta para o lado para veres mais</p>`;
 const track = gallery.querySelector('.conversation-track');
 const position = gallery.querySelector('.conversation-position');
 const previous = gallery.querySelector('.conversation-prev');
 const next = gallery.querySelector('.conversation-next');
 let current = 0, startX = 0, startScroll = 0, dragging = false;
 const index = () => Math.round(track.scrollLeft / (track.firstElementChild.offsetWidth + 16));
 const update = () => { current = Math.min(nums.length-1, Math.max(0,index())); position.textContent = `${current+1} / ${nums.length}`; previous.disabled = current===0; next.disabled = current===nums.length-1; };
 const move = delta => { const target = Math.min(nums.length-1,Math.max(0,index()+delta)); const step = track.firstElementChild.offsetWidth+16; track.scrollTo({left:target*step,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); };
 previous.addEventListener('click',()=>move(-1)); next.addEventListener('click',()=>move(1));
 track.addEventListener('scroll',update,{passive:true});
 track.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}});
 track.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'||event.button!==0)return;dragging=true;startX=event.clientX;startScroll=track.scrollLeft;track.setPointerCapture(event.pointerId);track.classList.add('is-dragging');});
 track.addEventListener('pointermove',event=>{if(dragging)track.scrollLeft=startScroll-(event.clientX-startX);});
 const release=()=>{if(!dragging)return;dragging=false;track.classList.remove('is-dragging');const target=index();track.scrollTo({left:target*(track.firstElementChild.offsetWidth+16),behavior:'smooth'});};
 track.addEventListener('pointerup',release);track.addEventListener('pointercancel',release);
 update();
}
