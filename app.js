(() => {
  const PLAN = {
    A:{name:'Séance A',focus:'Fondations',exercises:[
      ['squat','Squat',3,8,'Quadriceps • fessiers • gainage','Descendez sous contrôle, genoux dans l’axe des pieds, tronc gainé.','🦵'],
      ['bench','Développé couché haltères',3,10,'Pectoraux • triceps • épaules','Omoplates stables, poignets neutres, mouvement contrôlé.','🏋️'],
      ['row','Rowing assis à la poulie',3,10,'Dos • trapèzes moyens • deltoïdes postérieurs','Poitrine ouverte, épaules basses, tirez les coudes vers l’arrière.','💪'],
      ['rdl','Romanian Deadlift',3,8,'Ischio-jambiers • fessiers','Hanches en arrière, dos neutre, charge proche du corps.','🏋️‍♂️'],
      ['facepull','Face Pull',3,15,'Deltoïdes postérieurs • trapèzes','Tirez vers le visage, coudes hauts, sans élan.','🎯'],
      ['pallof','Pallof Press',3,12,'Gainage anti-rotation','Résistez à la rotation et gardez le bassin stable.','🧱']
    ]},
    B:{name:'Séance B',focus:'Dos • jambes • posture',exercises:[
      ['legpress','Presse à cuisses',3,10,'Quadriceps • fessiers','Pieds stables, amplitude confortable, ne verrouillez pas brutalement les genoux.','🦵'],
      ['pulldown','Tirage vertical poitrine',3,10,'Dorsaux • biceps','Tirez les coudes vers le bas, poitrine ouverte.','⬇️'],
      ['incline','Développé incliné haltères',3,10,'Haut des pectoraux • épaules • triceps','Contrôlez la descente et gardez les épaules stables.','🏋️'],
      ['bulgarian','Bulgarian Split Squat',3,8,'Jambes • fessiers • stabilité','Descendez verticalement, poussez avec le pied avant.','🦵'],
      ['lateral','Élévations latérales',3,15,'Deltoïdes latéraux','Charge légère, coudes souples, sans balancer.','🙆'],
      ['reversefly','Reverse Fly',3,15,'Deltoïdes postérieurs','Buste stable, ouvrez les bras sans hausser les épaules.','🪽'],
      ['deadbug','Dead Bug',3,10,'Core • contrôle du bassin','Bas du dos stable, mouvements lents et alternés.','🧘']
    ]},
    C:{name:'Séance C',focus:'Full body • hypertrophie',exercises:[
      ['hack','Hack Squat / Goblet Squat',3,10,'Quadriceps • fessiers','Amplitude contrôlée, tronc gainé.','🦵'],
      ['hipthrust','Hip Thrust',3,10,'Fessiers • chaîne postérieure','Rentrez légèrement le bassin en haut, sans hyperextension lombaire.','🍑'],
      ['onerow','Rowing unilatéral haltère',3,10,'Dos • stabilité','Tirez le coude vers la hanche, gardez le buste stable.','💪'],
      ['shoulder','Développé épaules haltères',3,10,'Deltoïdes • triceps','Abdos gainés, trajectoire contrôlée.','🏋️'],
      ['legcurl','Leg Curl',3,12,'Ischio-jambiers','Contrôlez les deux phases du mouvement.','🦵'],
      ['arms','Curl biceps + extension triceps',2,12,'Bras','Amplitude contrôlée, pas d’élan.','💪'],
      ['plank','Plank',3,45,'Core','Corps aligné, respiration régulière, ne creusez pas le bas du dos.','🧱']
    ]}
  };
  const KEY='fitcoach:v1';
  const getLast=(name)=>{for(let i=state.history.length-1;i>=0;i--){const e=(state.history[i].exercises||[]).find(x=>x.name===name);if(e)return e;}return null;};
  const recommend=(previous,target)=>{if(!previous)return 'Commencez léger et gardez environ 3 RIR pour apprendre le mouvement.'; const reps=Number(previous.reps)||0, kg=Number(previous.kg)||0; if(reps>=target && Number(previous.rir||2)>=2)return 'Cible proposée : '+(kg?kg+' kg ':'')+'× '+target+' reps. Si vous atteignez toutes les séries avec RIR ≥ 2, augmentez légèrement la prochaine fois.'; return 'Objectif : reproduire ou dépasser '+(kg?kg+' kg × ':'')+Math.max(1,reps)+' reps avec une technique propre.';};
  const weeklyCount=()=>{const d=new Date(),day=d.getDay()||7; const m=new Date(d);m.setDate(d.getDate()-day+1);m.setHours(0,0,0,0);return state.history.filter(h=>new Date(h.date)>=m).length;};
  const state=JSON.parse(localStorage.getItem(KEY)||'null')||{history:[],weight:78,goal:3};
  const app=document.getElementById('app');
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const fmtDate=d=>new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(d));
  const fmtMin=s=>{const m=Math.floor(s/60),sec=s%60; return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')};
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let route={page:'home',session:null,index:0,sets:[]};
  let workoutStart=0,timer=null,remaining=0;

  function layout(content){
    app.innerHTML=`
      <div class="shell">
        <header class="top"><div><div class="brand">FitCoach <span>3×</span></div><div class="sub">Votre coach de musculation</div></div>
        <button class="icon" data-nav="history">📊</button></header>
        <main>${content}</main>
        <nav class="nav">
          <button class="${route.page==='home'?'active':''}" data-nav="home">🏠<small>Accueil</small></button>
          <button class="${route.page==='workout'?'active':''}" data-nav="workout">🏋️<small>Séance</small></button>
          <button class="${route.page==='progress'?'active':''}" data-nav="progress">📈<small>Progression</small></button>
        </nav>
      </div>`;
  }

  function home(){
    const week=new Date(); const day=week.getDay(); const monday=new Date(week); monday.setDate(week.getDate()-(day===0?6:day-1)); monday.setHours(0,0,0,0);
    const done=state.history.filter(h=>new Date(h.date)>=monday).length;
    const mins=state.history.reduce((a,h)=>a+(h.duration||0),0);
    const streak=calcStreak();
    layout(`
      <section class="hero"><div class="eyebrow">OBJECTIF · 3 SÉANCES / SEMAINE</div><h1>Construisez un corps plus fort.<br><span>Une séance à la fois.</span></h1><p>Programme full-body orienté muscle, posture et régularité.</p><button class="primary" data-action="choose">Commencer une séance →</button></section>
      <div class="grid stats"><div><b>${done}/3</b><small>séances cette semaine</small></div><div><b>${Math.round(mins/60*10)/10} h</b><small>temps cumulé</small></div><div><b>🔥 ${streak}</b><small>semaines régulières</small></div></div>
      <section class="coach-card"><div><b>🎯 Coach du jour</b><p>${done>=3?'Objectif hebdomadaire atteint. Récupérez et revenez fort la semaine prochaine.':`Encore ${3-done} séance${3-done>1?'s':''} cette semaine. La régularité est votre priorité.`}</p></div><span>${Math.round(done/3*100)}%</span></section>
      <section><div class="section-title"><h2>Votre semaine</h2><span>${done>=3?'Objectif atteint 🎉':'Encore '+Math.max(0,3-done)+' à faire'}</span></div>
      <div class="week">${['L','M','M','J','V','S','D'].map((d,i)=>`<div class="${i < done?'done':''}"><span>${d}</span><i>${i<done?'✓':''}</i></div>`).join('')}</div></section>
      <section><div class="section-title"><h2>Les séances</h2></div><div class="cards">${Object.entries(PLAN).map(([k,p])=>`<button class="session-card" data-session="${k}"><strong>${p.name}</strong><span>${p.focus}</span><em>${p.exercises.length} exercices · 60–75 min</em><b>›</b></button>`).join('')}</div></section>
    `);
  }

  function choose(){
    layout(`<section class="hero compact"><div class="eyebrow">CHOISIR</div><h1>Quelle séance<br><span>aujourd’hui ?</span></h1></section><div class="cards"> ${Object.entries(PLAN).map(([k,p])=>`<button class="session-card big" data-session="${k}"><div class="session-num">${k}</div><strong>${p.name}</strong><span>${p.focus}</span><em>${p.exercises.length} exercices</em><b>Commencer →</b></button>`).join('')}</div>`);
  }

  function workout(){
    const p=PLAN[route.session]; if(!p){choose();return;}
    const ex=p.exercises[route.index];
    const previous=getLast(ex[1]);
    const saved=route.sets.filter(s=>s.exerciseId===ex[0]);
    const total=p.exercises.length;
    layout(`<div class="workout-head"><button class="back" data-nav="home">←</button><div><b>${p.name}</b><small>${route.index+1}/${total}</small></div><span>${Math.round((route.index)/total*100)}%</span></div>
      <div class="progress"><i style="width:${Math.round((route.index+1)/total*100)}%"></i></div>
      <section class="exercise">
        <div class="illustration"><img src="assets/illustrations/${ex[0]}.svg" alt="Illustration ${ex[1]}" loading="eager"></div><div class="tag">EXERCICE ${route.index+1}</div><h1>${ex[1]}</h1><p class="muscles">${ex[3]}</p>
        <div class="cue"><b>Technique</b><span>${ex[4]}</span></div><div class="coach-tip"><b>🎯 Suggestion du coach</b><span>${recommend(previous,Number(ex[3])||10)}</span></div>
        <div class="prescription"><strong>${ex[2]} × ${ex[3]}</strong><span>Repos recommandé · 90 s</span>${previous?`<small>Dernière fois : ${previous.kg} kg × ${previous.reps} reps</small>`:'<small>Première séance enregistrée</small>'}</div>
        <div class="setlist">${Array.from({length:ex[2]},(_,i)=>{const s=saved[i]; return `<div class="set-row"><span>Série ${i+1}</span><input inputmode="decimal" placeholder="kg" value="${s?.kg??''}" data-kg="${i}"><input inputmode="numeric" placeholder="reps" value="${s?.reps??ex[3]}" data-reps="${i}"><input class="rir" inputmode="numeric" placeholder="RIR" value="${s?.rir??2}" data-rir="${i}"><button class="${s?.done?'checked':''}" data-set="${i}">${s?.done?'✓':'OK'}</button></div>`}).join('')}</div>
        <div class="actions"><button class="secondary" data-action="rest">⏱ Repos 90 s</button><button class="primary" data-action="next">${route.index===total-1?'Terminer la séance':'Exercice suivant →'}</button></div>
      </section>`);
  }

  function progress(){
    const totalVol=state.history.reduce((sum,h)=>sum+(h.volume||0),0);
    const best={}; state.history.flatMap(h=>h.exercises||[]).forEach(e=>{if(!best[e.name]||e.kg>best[e.name].kg)best[e.name]={kg:e.kg,reps:e.reps};});
    const rows=Object.entries(best).slice(0,8);
    const badges=[]; if(state.history.length>=1)badges.push('🏁 Première séance'); if(state.history.length>=10)badges.push('💪 10 séances'); if(totalVol>=10000)badges.push('🏋️ 10 000 kg'); if(calcStreak()>=4)badges.push('🔥 4 semaines');
    layout(`<section class="hero compact"><div class="eyebrow">PROGRESSION</div><h1>Chaque séance<br><span>compte.</span></h1></section>
      <div class="grid stats three"><div><b>${state.history.length}</b><small>séances</small></div><div><b>${Math.round(totalVol)}</b><small>kg déplacés</small></div><div><b>${fmtMin(state.history.reduce((a,h)=>a+h.duration,0))}</b><small>temps total</small></div></div><section><div class="section-title"><h2>Volume récent</h2><span>8 dernières séances</span></div><div class="bars">${state.history.slice(-8).map(h=>{const recent=state.history.slice(-8);const max=Math.max(1,...recent.map(x=>x.volume||0));return '<div><i style="height:'+Math.max(8,Math.round((h.volume||0)/max*100))+'%"></i><small>'+Math.round((h.volume||0)/100)/10+'k</small></div>'}).join('')||'<div class="empty">Vos données apparaîtront ici après vos séances.</div>'}</div></section>
      <section><div class="section-title"><h2>Vos badges</h2></div><div class="badges">${badges.map(b=>`<span>${b}</span>`).join('')||'<span>Votre premier badge est à une séance d’ici 🏁</span>'}</div></section><section><div class="section-title"><h2>Meilleures charges</h2></div><div class="table">${rows.map(([n,v])=>`<div><span>${esc(n)}</span><b>${v.kg} kg × ${v.reps}</b></div>`).join('')||'<div class="empty">Complétez votre première séance pour voir vos records.</div>'}</div></section>
      <section><div class="section-title"><h2>Historique</h2></div><div class="history">${state.history.slice().reverse().slice(0,10).map(h=>`<article><div><b>${h.name}</b><small>${fmtDate(h.date)} · ${Math.round(h.duration/60)} min</small></div><strong>${Math.round(h.volume)} kg</strong></article>`).join('')||'<div class="empty">Aucun entraînement enregistré.</div>'}</div></section>`);
  }

  function history(){ progress(); }

  function calcStreak(){
    if(!state.history.length)return 0;
    const weeks=new Set(state.history.map(h=>{const d=new Date(h.date), one=new Date(d); const day=d.getDay()||7; one.setDate(d.getDate()-day+1); one.setHours(0,0,0,0); return one.toISOString().slice(0,10)}));
    let cur=new Date(); const day=cur.getDay()||7; cur.setDate(cur.getDate()-day+1); cur.setHours(0,0,0,0); let n=0;
    while(weeks.has(cur.toISOString().slice(0,10))){n++;cur.setDate(cur.getDate()-7)} return n;
  }

  function startSession(k){route={page:'workout',session:k,index:0,sets:[]};workoutStart=Date.now();workout();}

  function completeSession(){
    const p=PLAN[route.session];
    const exercises=[]; let volume=0;
    route.sets.filter(s=>s.done).forEach(s=>{const e=p.exercises.find(x=>x[0]===s.exerciseId); const v=(Number(s.kg)||0)*(Number(s.reps)||0); volume+=v; exercises.push({name:e[1],kg:Number(s.kg)||0,reps:Number(s.reps)||0});});
    const duration=Math.max(1,Math.round((Date.now()-workoutStart)/1000));
    state.history.push({date:new Date().toISOString(),name:p.name,duration,volume,exercises});save();
    route.page='home';route.session=null;route.index=0;route.sets=[];
    layout(`<section class="done-screen"><div class="trophy">🏆</div><div class="eyebrow">SÉANCE TERMINÉE</div><h1>Excellent travail<br><span>Continuez ainsi.</span></h1><div class="done-grid"><div><b>${Math.round(duration/60)} min</b><small>durée</small></div><div><b>${Math.round(volume)} kg</b><small>volume</small></div><div><b>${exercises.length}</b><small>séries validées</small></div></div><p>La régularité bat la perfection. Revenez à votre prochaine séance.</p><button class="primary" data-nav="progress">Voir ma progression →</button></section>`);
  }

  document.addEventListener('click',e=>{
    const n=e.target.closest('[data-nav]'); if(n){route.page=n.dataset.nav; route.session=null; route.index=0; route.sets=[]; ({home,workout,progress,history}[route.page]||home)(); return;}
    const ss=e.target.closest('[data-session]'); if(ss){startSession(ss.dataset.session);return;}
    const chooseBtn=e.target.closest('[data-action="choose"]'); if(chooseBtn){route.page='home';choose();return;}
    const next=e.target.closest('[data-action="next"]'); if(next){ if(route.index===PLAN[route.session].exercises.length-1)completeSession(); else {route.index++;workout();} return;}
    const rest=e.target.closest('[data-action="rest"]'); if(rest) startTimer(90);
    const set=e.target.closest('[data-set]'); if(set){const row=set.closest('.set-row'), ex=PLAN[route.session].exercises[route.index]; const kg=row.querySelector('[data-kg]').value, reps=row.querySelector('[data-reps]').value; const idx=Number(set.dataset.set); const prev=route.sets.find(s=>s.exerciseId===ex[0]&&s.index===idx); const rir=row.querySelector('[data-rir]').value; const rec={exerciseId:ex[0],index:idx,kg,reps,rir,done:true}; if(prev) Object.assign(prev,rec); else route.sets.push(rec); set.classList.add('checked');set.textContent='✓';}
  });
  document.addEventListener('input',e=>{if(e.target.matches('[data-kg],[data-reps],[data-rir]')){const ex=PLAN[route.session].exercises[route.index],idx=Number(e.target.dataset.kg??e.target.dataset.reps??e.target.dataset.rir);let r=route.sets.find(s=>s.exerciseId===ex[0]&&s.index===idx);if(!r){r={exerciseId:ex[0],index:idx,kg:'',reps:''};route.sets.push(r)};if(e.target.dataset.kg!==undefined)r.kg=e.target.value;else if(e.target.dataset.reps!==undefined)r.reps=e.target.value;else r.rir=e.target.value;}});
  function startTimer(s){remaining=s; clearInterval(timer); const toast=document.createElement('div'); toast.className='timer'; toast.innerHTML='<b>Repos</b><strong id="timerValue">'+fmtMin(remaining)+'</strong><button id="stopTimer">Fermer</button>';document.body.appendChild(toast);document.getElementById('stopTimer').onclick=()=>{clearInterval(timer);toast.remove()};timer=setInterval(()=>{remaining--; const v=document.getElementById('timerValue'); if(v)v.textContent=fmtMin(Math.max(0,remaining)); if(remaining<=0){clearInterval(timer);navigator.vibrate?.([150,80,150]);}},1000);}

  home();
})();