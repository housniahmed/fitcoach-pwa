(() => {
  const PLAN={
    A:{name:'Séance A',focus:'Fondations',exercises:[
      ['squat','Squat',3,8,'Quadriceps • fessiers • gainage','Descendez sous contrôle, genoux dans l’axe des pieds, tronc gainé.'],
      ['bench','Développé couché haltères',3,10,'Pectoraux • triceps • épaules','Omoplates stables, poignets neutres, mouvement contrôlé.'],
      ['row','Rowing assis à la poulie',3,10,'Dos • trapèzes moyens • deltoïdes postérieurs','Poitrine ouverte, épaules basses, tirez les coudes vers l’arrière.'],
      ['rdl','Romanian Deadlift',3,8,'Ischio-jambiers • fessiers','Hanches en arrière, dos neutre, charge proche du corps.'],
      ['facepull','Face Pull',3,15,'Deltoïdes postérieurs • trapèzes','Tirez vers le visage, coudes hauts, sans élan.'],
      ['pallof','Pallof Press',3,12,'Gainage anti-rotation','Résistez à la rotation et gardez le bassin stable.']
    ]},
    B:{name:'Séance B',focus:'Dos • jambes • posture',exercises:[
      ['legpress','Presse à cuisses',3,10,'Quadriceps • fessiers','Pieds stables, amplitude confortable, ne verrouillez pas brutalement les genoux.'],
      ['pulldown','Tirage vertical poitrine',3,10,'Dorsaux • biceps','Tirez les coudes vers le bas, poitrine ouverte.'],
      ['incline','Développé incliné haltères',3,10,'Haut des pectoraux • épaules • triceps','Contrôlez la descente et gardez les épaules stables.'],
      ['bulgarian','Bulgarian Split Squat',3,8,'Jambes • fessiers • stabilité','Descendez verticalement, poussez avec le pied avant.'],
      ['lateral','Élévations latérales',3,15,'Deltoïdes latéraux','Charge légère, coudes souples, sans balancer.'],
      ['reversefly','Reverse Fly',3,15,'Deltoïdes postérieurs','Buste stable, ouvrez les bras sans hausser les épaules.'],
      ['deadbug','Dead Bug',3,10,'Core • contrôle du bassin','Bas du dos stable, mouvements lents et alternés.']
    ]},
    C:{name:'Séance C',focus:'Full body • hypertrophie',exercises:[
      ['hack','Hack Squat / Goblet Squat',3,10,'Quadriceps • fessiers','Amplitude contrôlée, tronc gainé.'],
      ['hipthrust','Hip Thrust',3,10,'Fessiers • chaîne postérieure','Rentrez légèrement le bassin en haut, sans hyperextension lombaire.'],
      ['onerow','Rowing unilatéral haltère',3,10,'Dos • stabilité','Tirez le coude vers la hanche, gardez le buste stable.'],
      ['shoulder','Développé épaules haltères',3,10,'Deltoïdes • triceps','Abdos gainés, trajectoire contrôlée.'],
      ['legcurl','Leg Curl',3,12,'Ischio-jambiers','Contrôlez les deux phases du mouvement.'],
      ['arms','Curl biceps + extension triceps',2,12,'Bras','Amplitude contrôlée, pas d’élan.'],
      ['plank','Plank',3,45,'Core','Corps aligné, respiration régulière, ne creusez pas le bas du dos.']
    ]}
  };
  const RANGES={squat:[6,10],bench:[8,12],row:[8,12],rdl:[8,10],facepull:[12,15],pallof:[10,12],legpress:[8,12],pulldown:[8,12],incline:[8,12],bulgarian:[8,10],lateral:[12,15],reversefly:[12,15],deadbug:[8,12],hack:[8,12],hipthrust:[8,12],onerow:[8,12],shoulder:[8,10],legcurl:[10,15],arms:[10,15],plank:[30,60]};
  const KEY='fitcoach:v1',DRAFT='fitcoach:draft:v1';
  const state=JSON.parse(localStorage.getItem(KEY)||'{}');
  state.history=Array.isArray(state.history)?state.history:[];
  state.weights=Array.isArray(state.weights)?state.weights:[];
  let route={page:'home',session:null,index:0,sets:[]},start=0,timerId=null,remaining=0;
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const step=w=>Number(w)>=20?2.5:Number(w)>=10?1.25:0.5;
  const round=w=>Math.round(Number(w)*100)/100;
  const nextSession=()=>{const n=state.history.at(-1)?.name;return n==='Séance A'?'B':n==='Séance B'?'C':'A'};
  const lastExercise=name=>{for(let i=state.history.length-1;i>=0;i--){const e=(state.history[i].exercises||[]).find(x=>x.name===name);if(e)return e}return null};
  const lastSets=name=>{const e=lastExercise(name);return e?.sets?.length?e.sets:[]};
  const target=(name,index,range,current)=>{
    const prev=lastSets(name),done=current.filter(x=>x.done);
    let kg=Number(prev[index]?.kg||prev.at(-1)?.kg||0),reps=range[0],rir=2;
    const p=done.at(-1);
    if(p){kg=Number(p.kg)||kg;if(Number(p.rir)<2)rir=2;else if(Number(p.reps)>=range[1])kg=round(kg+step(kg));}
    return {kg,reps,rir};
  };
  const advice=(s,range)=>{
    const reps=Number(s.reps)||0,rir=Number(s.rir);
    if(!reps)return ['neutral','Entrez vos reps puis validez la série.'];
    if(Number.isFinite(rir)&&rir<2)return ['warn','Garde la charge. Récupère bien et privilégie la technique.'];
    if(reps>=range[1])return ['good','Très bien. Petit palier possible à la prochaine série.'];
    return ['good','Bonne série. Garde la charge et vise +1 rep si la technique reste propre.'];
  };
  const fatigue=sets=>{const d=sets.filter(x=>x.done&&Number(x.reps));if(!d.length)return 0;const effort=d.reduce((a,x)=>a+(Number.isFinite(Number(x.rir))?Math.max(0,3-Number(x.rir)):0),0)/d.length;const drop=d.length>1?Math.max(0,1-Number(d.at(-1).reps)/Number(d[0].reps)):0;return Math.round(Math.min(100,effort/3*70+drop*30))};
  const layout=html=>{document.getElementById('app').innerHTML=`<div class="shell"><header class="top"><div><div class="brand">FitCoach <span>3×</span></div><div class="sub">Coach pratique · musculation</div></div><button class="icon" data-nav="progress">📈</button></header><main>${html}</main><nav class="nav"><button class="${route.page==='home'?'active':''}" data-nav="home">🏠<small>Aujourd'hui</small></button><button class="${route.page==='workout'?'active':''}" data-nav="workout">🏋️<small>Séance</small></button><button class="${route.page==='progress'?'active':''}" data-nav="progress">📈<small>Progrès</small></button></nav></div>`};
  function home(){
    const d=new Date(),day=d.getDay()||7,m=new Date(d);m.setDate(d.getDate()-day+1);m.setHours(0,0,0,0);
    const week=state.history.filter(h=>new Date(h.date)>=m).length,next=nextSession(),p=PLAN[next],draft=JSON.parse(localStorage.getItem(DRAFT)||'{}'),dk=Object.keys(draft)[0];
    layout(`<section class="practical-hero"><div class="eyebrow">FITCOACH · 3× / SEMAINE</div><h1>${dk?'Reprendre ma séance':'Ma séance du jour'}</h1><p>${dk?'Votre séance interrompue est prête.':'Simple : une séance, des séries, une recommandation.'}</p><button class="primary" data-session="${dk||next}">${dk?'Reprendre →':'Commencer →'}</button></section>
    <div class="practical-stats"><div><b>${week}/3</b><small>cette semaine</small></div><div><b>${state.history.length}</b><small>séances</small></div><div><b>${state.history.at(-1)?Math.round((state.history.at(-1).duration||0)/60):0} min</b><small>dernière séance</small></div></div>
    <section class="today-card"><div class="section-title"><h2>🎯 Aujourd'hui</h2><span>${p.name}</span></div><b>${p.focus}</b><p>${p.exercises.length} exercices · ${p.exercises.reduce((a,e)=>a+e[2],0)} séries</p><button class="secondary full-btn" data-session="${next}">Démarrer ${p.name}</button></section>
    <section><div class="section-title"><h2>Cette semaine</h2><span>${week>=3?'Objectif atteint ✓':`${3-week} restante${3-week>1?'s':''}`}</span></div><div class="week">${['L','M','M','J','V','S','D'].map((x,i)=>`<div class="${state.history.some(h=>new Date(h.date).toDateString()===new Date(m.getTime()+i*86400000).toDateString())?'done':''}"><span>${x}</span><i>✓</i></div>`).join('')}</div></section>
    <section><div class="section-title"><h2>Mes séances</h2><span>A · B · C</span></div><div class="cards">${Object.entries(PLAN).map(([k,x])=>`<button class="session-card" data-session="${k}"><strong>${x.name}</strong><span>${x.focus}</span><em>${x.exercises.length} exercices</em><b>›</b></button>`).join('')}</div></section>`);
  }
  function workout(){
    const p=PLAN[route.session];if(!p)return home();
    const ex=p.exercises[route.index],range=RANGES[ex[0]]||[ex[3],ex[3]],current=route.sets.filter(x=>x.exerciseId===ex[0]),prev=lastExercise(ex[1]),total=p.exercises.length;
    const first=target(ex[1],0,range,current),setCount=ex[2],unit=ex[0]==='plank'?'sec':'reps';
    const rows=Array.from({length:setCount},(_,i)=>{const s=current[i],t=target(ex[1],i,range,current),kg=s?.kg??(t.kg||''),reps=s?.reps??t.reps,rir=s?.rir??t.rir,a=s?.done?advice(s,range):null;return `<div class="set-row practical-set ${s?.done?'set-complete':''}"><div class="set-label"><b>Série ${i+1}</b><small>Cible · ${t.kg?t.kg+' kg':'à définir'} · ${t.reps} ${unit} · RIR ${t.rir}</small></div><input inputmode="decimal" placeholder="kg" value="${kg}" data-kg="${i}"><input inputmode="numeric" placeholder="${unit}" value="${reps}" data-reps="${i}"><input class="rir" inputmode="numeric" placeholder="RIR" value="${rir}" data-rir="${i}"><button class="${s?.done?'checked':''}" data-set="${i}">${s?.done?'✓':'OK'}</button>${a?`<div class="set-feedback ${a[0]}"><b>${a[0]==='warn'?'⚠️':'✓'} ${a[0]==='warn'?'Effort élevé':'Série validée'}</b><span>${a[1]}</span></div>`:''}</div>`}).join('');
    layout(`<div class="workout-head"><button class="back" data-nav="home">←</button><div><b>${p.name}</b><small>${route.index+1}/${total}</small></div><span>${Math.round((route.index)/total*100)}%</span></div><div class="progress"><i style="width:${Math.round((route.index+1)/total*100)}%"></i></div>
    <section class="exercise practical-exercise"><div class="illustration"><img src="assets/illustrations/${ex[0]}.svg" alt="${esc(ex[1])}" loading="eager"></div><div class="tag">EXERCICE ${route.index+1} / ${total}</div><h1>${esc(ex[1])}</h1><p class="muscles">${ex[4]}</p>
    <div class="practical-target"><div><span>Aujourd'hui</span><b>${first.kg?first.kg+' kg':'Charge à définir'} · ${range[0]}–${range[1]} ${unit}</b><small>RIR cible ${first.rir} · repos 90 s</small></div><strong>${setCount} séries</strong></div>
    <div class="previous-performance"><span>Dernière fois</span><b>${prev?(prev.kg?prev.kg+' kg × ':'')+(prev.reps||0)+' '+unit+' · RIR '+(prev.rir||'—'):'Première référence à construire'}</b></div>
    <div class="cue practical-cue"><b>💡 Technique</b><span>${ex[5]}</span></div><div class="setlist">${rows}</div>
    <div class="simple-coach"><b>Coach</b><span>Après chaque série : si elle est facile, ajoutez 1 rep ou un petit palier. Si RIR < 2, gardez la charge.</span></div>
    <div class="actions"><button class="secondary" data-action="rest">⏱ Repos 90 s</button><button class="primary" data-action="next">${route.index===total-1?'Terminer':'Exercice suivant →'}</button></div></section>`);
  }
  function progress(){
    const sets=state.history.flatMap(h=>(h.exercises||[]).flatMap(e=>e.sets?.length?e.sets:[e])),best={};
    sets.forEach(x=>{const n=x.name||'',kg=Number(x.kg)||0,reps=Number(x.reps)||0;if(!best[n]||kg>best[n].kg||(kg===best[n].kg&&reps>best[n].reps))best[n]={kg,reps}});
    const last=state.history.slice(-5).reverse(),vol=state.history.reduce((a,h)=>a+(Number(h.volume)||0),0),nxt=nextSession();
    layout(`<section class="practical-hero compact"><div class="eyebrow">FITCOACH · PROGRÈS</div><h1>Mes progrès</h1><p>Ce qu'il faut savoir pour votre prochaine séance.</p></section><div class="practical-stats"><div><b>${state.history.length}</b><small>séances</small></div><div><b>${Math.round(vol)} kg</b><small>volume cumulé</small></div><div><b>${state.weight||'—'}</b><small>poids actuel</small></div></div>
    <section class="simple-progress"><div class="section-title"><h2>Meilleures charges</h2><span>${Object.keys(best).length}</span></div>${Object.keys(best).length?Object.entries(best).map(([n,x])=>`<div class="progress-row"><span>${esc(n)}</span><b>${x.kg?x.kg+' kg':'—'} × ${x.reps}</b></div>`).join(''):'<p>Votre progression apparaîtra ici.</p>'}</section>
    <section class="simple-progress"><div class="section-title"><h2>Historique</h2><span>5 dernières</span></div>${last.length?last.map(h=>`<div class="history-row"><div><b>${esc(h.name)}</b><small>${new Date(h.date).toLocaleDateString('fr-FR')}</small></div><strong>${Math.round((h.duration||0)/60)} min</strong><span>${Math.round(h.volume||0)} kg</span></div>`).join(''):'<p>Aucune séance terminée.</p>'}</section><section class="next-card practical-next">Prochaine séance : <b>${PLAN[nxt].name}</b><button data-session="${nxt}">Démarrer →</button></section>`);
  }
  function startSession(k){
    const drafts=JSON.parse(localStorage.getItem(DRAFT)||'{}'),d=drafts[k];
    route={page:'workout',session:k,index:d?Number(d.index)||0:0,sets:d?.sets||[]};start=d?.start||Date.now();
    if(d){delete drafts[k];localStorage.setItem(DRAFT,JSON.stringify(drafts));}
    workout();
  }
  function saveDraft(){if(!route.session)return;const d=JSON.parse(localStorage.getItem(DRAFT)||'{}');d[route.session]={index:route.index,sets:route.sets,start,savedAt:Date.now()};localStorage.setItem(DRAFT,JSON.stringify(d));}
  function completeSession(){
    const p=PLAN[route.session],now=new Date().toISOString(),done=route.sets.filter(x=>x.done),duration=Math.max(1,Math.round((Date.now()-start)/1000));
    const exercises=p.exercises.map(e=>{const ss=done.filter(s=>s.exerciseId===e[0]).map(s=>({kg:Number(s.kg)||0,reps:Number(s.reps)||0,rir:Number(s.rir)||0,set:s.index+1}));return ss.length?{name:e[1],kg:ss.at(-1).kg,reps:ss.at(-1).reps,rir:ss.at(-1).rir,sets:ss}:null}).filter(Boolean);
    const volume=done.reduce((a,s)=>a+(Number(s.kg)||0)*(Number(s.reps)||0),0);
    state.history.push({date:now,name:p.name,duration,volume,sessionRpe:Math.round((10-(done.reduce((a,s)=>a+(Number(s.rir)||0),0)/Math.max(1,done.length)))*10)/10,fatigue:fatigue(route.sets),exercises});save();localStorage.removeItem(DRAFT);
    const nxt=nextSession();route={page:'home',session:null,index:0,sets:[]};
    layout(`<section class="done-screen practical-done"><div class="trophy">✓</div><div class="eyebrow">SÉANCE TERMINÉE</div><h1>Bravo.<br><span>Travail terminé.</span></h1><div class="done-grid"><div><b>${Math.round(duration/60)} min</b><small>durée</small></div><div><b>${Math.round(volume)} kg</b><small>volume</small></div><div><b>${done.length}</b><small>séries</small></div></div><section class="next-advice"><b>💡 La prochaine fois</b><p>Gardez vos charges actuelles. Quand vous atteignez le haut de la fourchette avec RIR ≥ 2, ajoutez un petit palier.</p></section><button class="primary" data-session="${nxt}">Prochaine séance · ${PLAN[nxt].name} →</button><button class="secondary full-btn" data-nav="progress">Voir mes progrès</button></section>`);
  }
  function startTimer(seconds){clearInterval(timerId);remaining=seconds;const tick=()=>{remaining--;document.querySelectorAll('[data-timer]').forEach(x=>x.textContent=remaining>0?Math.ceil(remaining)+' s':'Repos terminé ✓');if(remaining<=0)clearInterval(timer)};tick();timerId=setInterval(tick,1000)}
  document.addEventListener('click',e=>{
    const n=e.target.closest('[data-nav]');if(n){route.page=n.dataset.nav;route.session=null;route.index=0;route.sets=[];({home,workout,progress}[route.page]||home)();return}
    const ss=e.target.closest('[data-session]');if(ss){startSession(ss.dataset.session);return}
    const rest=e.target.closest('[data-action="rest"]');if(rest){startTimer(90);rest.textContent='⏱ Repos · <span data-timer>90 s</span>';return}
    const next=e.target.closest('[data-action="next"]');if(next){if(route.index===PLAN[route.session].exercises.length-1)completeSession();else{route.index++;workout()}return}
    const set=e.target.closest('[data-set]');if(set){
      const row=set.closest('.set-row'),ex=PLAN[route.session].exercises[route.index],idx=Number(set.dataset.set),kg=row.querySelector('[data-kg]').value,reps=row.querySelector('[data-reps]').value,rir=row.querySelector('[data-rir]').value;
      if(!reps){row.querySelector('[data-reps]').focus();return}
      let r=route.sets.find(x=>x.exerciseId===ex[0]&&x.index===idx);if(!r){r={exerciseId:ex[0],index:idx};route.sets.push(r)}Object.assign(r,{kg,reps,rir,done:true});saveDraft();
      workout();setTimeout(()=>{const el=document.querySelectorAll('.set-row')[idx];if(el)el.scrollIntoView({behavior:'smooth',block:'center'})},30);
      if(Number(rir)<2)startTimer(90);
    }
  });
  document.addEventListener('input',e=>{if(e.target.matches('[data-kg],[data-reps],[data-rir]')){const ex=PLAN[route.session]?.exercises[route.index];if(!ex)return;const idx=Number(e.target.dataset.kg??e.target.dataset.reps??e.target.dataset.rir);let r=route.sets.find(x=>x.exerciseId===ex[0]&&x.index===idx);if(!r){r={exerciseId:ex[0],index:idx};route.sets.push(r)}if(e.target.dataset.kg!==undefined)r.kg=e.target.value;if(e.target.dataset.reps!==undefined)r.reps=e.target.value;if(e.target.dataset.rir!==undefined)r.rir=e.target.value;saveDraft()}});
  home();
})();