(() => {
  'use strict';

  const KEY = 'tact.microcraft.history.v1';
  const labels = ['17','23','31','42','58','64','71','86'];
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];

  const svg = {
    search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="5.8"/><path d="M15.2 15.2 20 20"/></svg>',
    plus:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    bell:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9a5 5 0 0 1 10 0c0 5 2 5 2 7H5c0-2 2-2 2-7Z"/><path d="M10 19h4"/></svg>',
    tune:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>'
  };

  const groups = () => `<span class="sidebar-group"><span class="sidebar-heading">Workspace</span>${rows([['Inbox','12',1],['Roadmap','4'],['Reviews','7']])}</span><span class="sidebar-group"><span class="sidebar-heading">Projects</span>${rows([['Aurora','3'],['Atlas','8'],['Mercury','2']])}</span>`;
  const rows = data => data.map(([name,n,sel]) => `<span class="sidebar-row${sel?' selected':''}"><span class="sidebar-dot"></span><span>${name}</span><span class="meta">${n}</span></span>`).join('');
  const sidebar = style => `<span class="mock-window" style="${style}"><span class="mock-sidebar">${groups()}</span><span class="mock-main"><h4>Project Aurora</h4><p>Ship the onboarding rewrite by Friday.</p><span class="mock-card"></span><span class="mock-card"></span></span></span>`;
  const toolbar = style => `<span class="toolbar-sheet" style="${style}"><span class="toolbar-line"><span class="tool">${svg.plus}</span><span class="tool target">${svg.search}</span><span class="tool">${svg.bell}</span><span class="tool">${svg.tune}</span></span><span class="toolbar-caption">Four controls share one 16 px asset box.</span></span>`;
  const type = style => `<span class="type-sheet" style="${style}"><h3>Project Aurora</h3><p class="type-meta">UPDATED 4 MINUTES AGO · 12 OPEN ISSUES</p><p class="type-body">Ship the onboarding rewrite by Friday. Keep the review path short and the evidence easy to inspect.</p><span class="type-kicker">Owner · Leo</span></span>`;
  const hierarchy = style => `<span class="hierarchy-sheet" style="${style}"><span class="hierarchy-top"><h3>Today</h3><span class="mini-action">New issue</span></span>${[['Onboarding rewrite','Updated 4m ago','12',1],['Keyboard pass','Updated 18m ago','4'],['Empty state copy','Updated 1h ago','3']].map(([a,b,c,s])=>`<span class="hierarchy-row${s?' selected':''}"><strong>${a}</strong><small>${b}</small><span>${c}</span></span>`).join('')}</span>`;
  const contrast = style => `<span class="contrast-sheet" style="${style}"><h3>Release checklist</h3><p class="secondary">Secondary guidance should stay legible without competing with the title.</p>${[['Build verified','2m'],['Screens reviewed','18m'],['Copy approved','1h']].map(([a,b])=>`<span class="contrast-line">${a}<span>${b}</span></span>`).join('')}</span>`;
  const material = style => `<span class="material-stage" style="${style}"><span class="material-background"><h3>Recent runs</h3>${[['onboarding','42s'],['billing','1m 12s'],['search','37s'],['editor','58s']].map(([a,b])=>`<span class="table-line"><b>${a}</b><span>${b}</span><span>pass</span></span>`).join('')}</span><span class="material-popover"><strong>Run filters</strong><p>Only show runs that changed state since your last review.</p></span></span>`;
  const motion = style => `<span class="motion-stage" style="${style}"><span class="motion-trigger"></span><span class="motion-popover"><strong>Filter runs</strong><span></span><span></span><span></span></span></span>`;

  const drills = [
    d('type-tracking','typography','Tracking pressure in small metadata','Which title block keeps the metadata cohesive while leaving the heading in charge?','The content, size, weight, line height, and color are identical.',['tracking pressure','type-role collision','apparent hierarchy'],'The metadata opens enough to fragment into separate characters and adds chatter beneath the title.','The weaker version gives a small secondary role too much horizontal presence.',['-0.002em','0.022em','0.055em'],v=>type(`--meta-tracking:${v}`),v=>[['Metadata tracking',pair(v)],['Everything else','identical']]),
    d('spacing-groups','spacing','Internal / external spacing ratio','Which sidebar reads as two clear groups without another separator?','Only the gap between semantic groups changes.',['internal / external ratio','gap grammar','grouping efficiency'],'The external interval collapses toward the row cadence, so two sections read as one stack.','The stronger version uses space to create a second rhythm for section boundaries.',['18px','12px','7px'],v=>sidebar(`--group-gap:${v};--row-height:30px`),v=>[['Between-group gap',pair(v)],['Row height','30px']]),
    d('alignment-glyph','alignment','Optical vertical alignment','Which toolbar feels like one control family?','One search glyph is vertically displaced in the weaker version.',['optical alignment','centerline drift','cumulative drift'],'One familiar glyph sits low enough to break the shared centerline while every button box remains aligned.','The boxes align geometrically; the mark does not. A one-pixel error becomes visible through repetition.',['0px','1px','2px'],v=>toolbar(`--glyph-offset:${v};--target-stroke:1.55`),v=>[['Search glyph Y offset',pair(v)],['Button box','34px'],['Glyph box','16px']]),
    d('hierarchy-selection','hierarchy','Selection-state emphasis','Which issue list keeps selection obvious without stealing the first glance from the title?','Only selected-row fill opacity changes.',['emphasis budget','focal pull','semantic tier'],'The selected row spends too much contrast on a routine state and competes with page-level content.','Selection needs a sufficient state delta; extra fill becomes focal pull.',['.07','.13','.22'],v=>hierarchy(`--selection-alpha:${v}`),v=>[['Selected fill alpha',pair(v)],['Geometry','identical']]),
    d('contrast-secondary','contrast','Secondary-text luminance tier','Which contrast ladder keeps guidance readable while preserving a clear first and second tier?','Only the secondary paragraph color changes.',['contrast ladder','luminance hierarchy','competing primaries'],'Secondary copy becomes bright enough to approach the title and row labels, flattening the hierarchy.','The semantic role stayed secondary while luminance moved upward. The stronger version preserves readability and order.',['#8f969f','#aab0b8','#c4c9cf'],v=>contrast(`--secondary-tone:${v}`),v=>[['Secondary text',pair(v)],['Primary title','#f0f2f4']]),
    d('material-border','material','Popover edge contrast','Which popover separates from the dense background without turning its border into decoration?','Fill, blur, shadow, geometry, and foreground contrast are identical.',['layer separation','depth cue stack','edge priority'],'The brighter border becomes a third loud depth cue on top of fill and shadow.','Fill and shadow already separate the plane; the louder border redirects attention to the container edge.',['.12','.24','.42'],v=>material(`--popover-border:${v}`),v=>[['Border alpha',pair(v)],['Fill','rgba(35,40,46,.92)'],['Blur','10px']]),
    d('icon-weight','iconography','Optical stroke weight','Which toolbar keeps four different silhouettes at one apparent emphasis level?','Only the search glyph stroke width changes.',['optical weight','stroke density','family coherence'],'One glyph carries more dark mass and starts to read like a primary action.','Equal asset boxes do not create equal apparent weight.',['1.55','1.85','2.25'],v=>toolbar(`--glyph-offset:0px;--target-stroke:${v}`),v=>[['Search stroke width',pair(v)],['Sibling stroke','1.55'],['Asset box','16px']]),
    d('density-cadence','density','Sidebar row cadence','Which sidebar shows more useful state while still reading as deliberate and calm?','Information, type, alignment, group spacing, and contrast are identical.',['row cadence','scan compression','decision-relevant density'],'The roomier cadence spends vertical space without adding a semantic break and weakens the repeated beat.','The compact cadence keeps the same anchors and grouping while more state participates in one glance.',['30px','34px','40px'],v=>sidebar(`--row-height:${v};--group-gap:18px`),v=>[['Row height',pair(v)],['Between-group gap','18px']]),
    d('motion-duration','motion','Travel duration','Which popover feels crisper for a control used many times per hour?','Distance, easing, opacity, scale, and visual design are identical. Press Space to replay.',['travel duration','settle time','perceived mass'],'The longer entrance keeps settling after the destination is understood, giving a small popover excess mass.','The stronger timing reaches rest while the trigger and destination still feel tightly connected.',['160ms','260ms','360ms'],v=>motion(`--motion-duration:${v};--motion-easing:cubic-bezier(.2,.8,.2,1)`),v=>[['Duration',pair(v)],['Travel','18px'],['Easing','cubic-bezier(.2,.8,.2,1)']],true),
    d('motion-easing','motion','Easing profile / tail','Which identical 200 ms entrance spends less time visually finishing after the popover is understood?','Duration and travel are identical. Only easing changes. Press Space to replay.',['easing profile','easing tail','attention handoff'],'The symmetric curve delays initial response and spends more attention on a ceremonious finish.','The stronger curve moves decisively early and decelerates into rest.',['cubic-bezier(.2,.8,.2,1)','ease-in-out','cubic-bezier(.65,0,.35,1)'],v=>motion(`--motion-duration:200ms;--motion-easing:${v}`),v=>[['Easing',pair(v)],['Duration','200ms'],['Travel','18px']],true)
  ];

  function d(id,category,variable,prompt,instruction,vocab,defect,diagnosis,vals,render,values,motion=false){return{id,category,variable,prompt,instruction,vocab,defect,diagnosis,vals,render,values,motion};}
  function pair(v){ return `${v.good} ↔ ${v.bad}`; }
  function level(drill){ return {good:drill.vals[0],bad:state.difficulty==='subtle'?drill.vals[1]:drill.vals[2]}; }

  const el = Object.fromEntries(['monthLabel','attemptCount','accuracyValue','missedSummary','categoryFilter','blindMode','replayButton','resetButton','challengeCategory','difficultyLabel','challengePrompt','challengeInstruction','leftVariant','rightVariant','leftLabel','rightLabel','leftSurface','rightSurface','choiceSummary','diagnosisInput','unnamedButton','revealButton','revealPanel','resultHeading','resultBadge','variableName','valueTable','defectText','diagnosisText','vocabularyTags','savedDiagnosis','repeatButton','nextButton'].map(id=>[id,q(`#${id}`)]));

  const state = {drill:null,difficulty:'subtle',goodSide:'left',choice:null,revealed:false,history:load(),last:null};
  function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[];}catch{return[];}}
  function save(){localStorage.setItem(KEY,JSON.stringify(state.history.slice(-500)));}
  function month(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;}
  function difficulty(){return q('input[name="difficulty"]:checked')?.value||'subtle';}

  function stats(){
    const now=month(), a=state.history.filter(x=>x.month===now), correct=a.filter(x=>x.correct).length, buckets={};
    a.forEach(x=>{buckets[x.category]??={n:0,m:0};buckets[x.category].n++;if(!x.correct)buckets[x.category].m++;});
    const weak=Object.entries(buckets).filter(([,v])=>v.m).sort((a,b)=>b[1].m/b[1].n-a[1].m/a[1].n).slice(0,2).map(([k])=>k);
    el.monthLabel.textContent=new Intl.DateTimeFormat(undefined,{month:'short',year:'numeric'}).format(new Date());
    el.attemptCount.textContent=a.length;
    el.accuracyValue.textContent=a.length?`${Math.round(correct/a.length*100)}%`:'—';
    el.missedSummary.textContent=weak.length?`revisit ${weak.join(', ')}`:a.length?'no misses logged':'no history yet';
  }

  function pickDrill(force=null){
    const filter=force||el.categoryFilter.value, pool=drills.filter(x=>filter==='all'||x.category===filter), choices=pool.length>1?pool.filter(x=>x.id!==state.last):pool;
    return choices[Math.floor(Math.random()*choices.length)]||drills[0];
  }

  function trial(force=null){
    state.difficulty=difficulty(); state.drill=pickDrill(force); state.last=state.drill.id; state.goodSide=Math.random()<.5?'left':'right'; state.choice=null; state.revealed=false;
    const v=level(state.drill), left=state.goodSide==='left'?v.good:v.bad, right=state.goodSide==='right'?v.good:v.bad, labs=[...labels].sort(()=>Math.random()-.5).slice(0,2);
    el.leftLabel.textContent=labs[0]; el.rightLabel.textContent=labs[1]; el.leftSurface.innerHTML=state.drill.render(left); el.rightSurface.innerHTML=state.drill.render(right);
    el.challengePrompt.textContent=state.drill.prompt; el.challengeInstruction.textContent=state.drill.instruction; el.difficultyLabel.textContent=`${state.difficulty[0].toUpperCase()+state.difficulty.slice(1)} delta`;
    el.challengeCategory.textContent=el.blindMode.checked?'Blind pair':`${state.drill.category} · ${state.drill.variable}`; el.replayButton.hidden=!state.drill.motion;
    [el.leftVariant,el.rightVariant].forEach(x=>x.classList.remove('selected','revealed','correct','defect')); el.choiceSummary.textContent='Make a blind pick to continue.'; el.diagnosisInput.value=''; el.diagnosisInput.disabled=true; el.unnamedButton.disabled=true; el.revealButton.disabled=true; el.revealPanel.hidden=true;
    if(state.drill.motion)setTimeout(replay,90);
  }

  function choose(side){
    if(state.revealed)return; state.choice=side; el.leftVariant.classList.toggle('selected',side==='left'); el.rightVariant.classList.toggle('selected',side==='right');
    el.choiceSummary.textContent=`You picked ${side==='left'?el.leftLabel.textContent:el.rightLabel.textContent}. Name the lever before revealing it.`; el.diagnosisInput.disabled=false; el.unnamedButton.disabled=false; el.revealButton.disabled=false; el.diagnosisInput.focus({preventScroll:true});
  }

  function reveal(unnamed=false){
    if(!state.choice||state.revealed)return; state.revealed=true; const good=state.choice===state.goodSide, d=state.drill, v=level(d), note=unnamed?'Felt the difference; could not name the variable before reveal.':(el.diagnosisInput.value.trim()||'No diagnosis written.');
    state.history.push({ts:new Date().toISOString(),month:month(),challenge:d.id,category:d.category,difficulty:state.difficulty,correct:good,diagnosis:note}); save(); stats();
    el.challengeCategory.textContent=`${d.category} · ${d.variable}`; el.resultHeading.textContent=good?'Your pick matched the calibration target.':'The other version is the calibration target.'; el.resultBadge.textContent=good?'caught it':'missed'; el.resultBadge.className=`result-badge ${good?'correct':'incorrect'}`; el.variableName.textContent=d.variable; el.defectText.textContent=d.defect; el.diagnosisText.textContent=d.diagnosis; el.savedDiagnosis.textContent=note; el.valueTable.innerHTML=d.values(v).map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join(''); el.vocabularyTags.innerHTML=d.vocab.map(x=>`<span>${x}</span>`).join(''); el.revealPanel.hidden=false;
    (state.goodSide==='left'?el.leftVariant:el.rightVariant).classList.add('revealed','correct'); (state.goodSide==='left'?el.rightVariant:el.leftVariant).classList.add('revealed','defect'); el.diagnosisInput.disabled=true; el.unnamedButton.disabled=true; el.revealButton.disabled=true; el.revealPanel.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function replay(){ if(!state.drill?.motion)return; qa('.motion-stage').forEach(x=>{x.classList.remove('playing');void x.offsetWidth;x.classList.add('playing');}); }
  const typing=t=>t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement||t instanceof HTMLSelectElement;

  el.leftVariant.onclick=()=>choose('left'); el.rightVariant.onclick=()=>choose('right');
  el.leftVariant.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();choose('left');}};
  el.rightVariant.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();choose('right');}};
  el.revealButton.onclick=()=>reveal(); el.unnamedButton.onclick=()=>reveal(true); el.nextButton.onclick=()=>trial(); el.repeatButton.onclick=()=>trial(state.drill.category); el.replayButton.onclick=replay; el.categoryFilter.onchange=()=>trial();
  el.blindMode.onchange=()=>{if(!state.revealed)el.challengeCategory.textContent=el.blindMode.checked?'Blind pair':`${state.drill.category} · ${state.drill.variable}`;};
  qa('input[name="difficulty"]').forEach(x=>x.onchange=()=>trial());
  el.resetButton.onclick=()=>{if(confirm('Clear all local microcraft calibration history on this browser?')){state.history=[];save();stats();}};
  addEventListener('keydown',e=>{
    if(e.code==='Space'&&!typing(e.target)&&state.drill?.motion){e.preventDefault();replay();return;}
    if(typing(e.target)){if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)&&state.choice&&!state.revealed)reveal();return;}
    if(e.key==='1')choose('left'); if(e.key==='2')choose('right'); if(e.key==='Enter'&&state.choice&&!state.revealed)reveal(); if((e.key==='n'||e.key==='N')&&state.revealed)trial();
  });

  stats(); trial();
})();
