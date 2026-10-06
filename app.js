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
  const DRAFT='fitcoach:draft:v1';
  const RANGES={squat:[6,10],bench:[8,12],row:[8,12],rdl:[8,10],facepull:[12,15],pallof:[10,12],legpress:[8,12],pulldown:[8,12],incline:[8,12],bulgarian:[8,10],lateral:[12,15],reversefly:[12,15],deadbug:[8,12],hack:[8,12],hipthrust:[8,12],onerow:[8,12],shoulder:[8,10],legcurl:[10,15],arms:[10,15],plank:[30,60]};
  const nextSession=()=>{const last=state.history.at(-1)?.name;return last==='Séance A'?'B':last==='Séance B'?'C':'A'};
  const weights=()=>state.weights||[];
  const getLast=(name)=>{for(let i=state.history.length-1;i>=0;i--){const e=(state.history[i].exercises||[]).find(x=>x.name===name);if(e)return e;}return null;};
  const getLastSets=(name)=>{for(let i=state.history.length-1;i>=0;i--){const h=state.history[i];const e=(h.exercises||[]).find(x=>x.name===name);if(e)return e.sets?.length?e.sets:[e];}return [];};
  const loadStep=(load)=>{load=Number(load)||0;return load>=20?2.5:load>=10?1.25:0.5;};
  const roundLoad=(load)=>Math.round((Number(load)||0)*100)/100;
  const targetForSet=(name,setIndex,range,previousSets,currentSets)=>{
    const completed=currentSets.filter(s=>s.done&&Number(s.reps)>0);
    const previous=previousSets.filter(s=>Number(s.reps)>0);
    let base=previous.length?Number(previous[Math.min(setIndex,previous.length-1)].kg)||0:0;
    if(!base&&previous.length)base=Number(previous[previous.length-1].kg)||0;
    if(completed.length){
      const last=completed.at(-1),lastKg=Number(last.kg)||base,reps=Number(last.reps)||range[0],rir=Number(last.rir);
      if(rir<2)base=lastKg; else if(reps>=range[1]&&rir>=2)base=roundLoad(lastKg+loadStep(lastKg)); else base=lastKg;
    }
    const prior=completed[setIndex-1];
    if(prior){
      const pk=Number(prior.kg)||base,pr=Number(prior.reps)||range[0],pir=Number(prior.rir);
      if(pir<2)base=pk; else if(pr>=range[1]&&pir>=2)base=roundLoad(pk+loadStep(pk)); else base=pk;
    }
    return {kg:base,reps:range[0],rir:2};
  };
  const evaluateSet=(set,range)=>{
    const reps=Number(set.reps)||0,rir=Number(set.rir);
    if(!reps)return {tone:'neutral',title:'Saisissez votre performance',text:'Entrez les reps et le RIR pour que le coach adapte la prochaine série.'};
    if(Number.isFinite(rir)&&rir<2)return {tone:'warn',title:'⚠️ Effort élevé',text:'RIR < 2 : gardez cette charge pour la prochaine série et privilégiez une technique propre.'};
    if(reps>=range[1]&&(!Number.isFinite(rir)||rir>=2))return {tone:'good',title:'✓ Série validée',text:'Haut de fourchette atteint avec une marge suffisante : +1 palier possible à la prochaine série.'};
    return {tone:'good',title:'✓ Bonne série',text:'Gardez la charge et essayez d’ajouter 1 répétition sur la prochaine série.'};
  };
  const fatigueScore=(sets)=>{
    const done=sets.filter(s=>s.done&&Number(s.reps)>0); if(!done.length)return 0;
    const effort=done.map(s=>{const r=Number(s.rir);return Number.isFinite(r)?Math.max(0,Math.min(100,(3-r)*30)):0;});
    const drop=done.length>=2&&Number(done[0].reps)>0?Math.max(0,Math.min(100,(1-Number(done.at(-1).reps)/Number(done[0].reps))*100)):0;
    return Math.round(Math.min(100,effort.reduce((a,b)=>a+b,0)/effort.length*.65+drop*.35));
  };
  const liveState=(sets,range)=>{
    const done=sets.filter(s=>s.done&&Number(s.reps)>0),fatigue=fatigueScore(sets);
    if(!done.length)return {label:'Prêt',tone:'neutral',text:'Démarrez avec une marge confortable. Le coach observe vos premières séries.'};
    const last=done.at(-1),rir=Number(last.rir),reps=Number(last.reps)||0;
    if(rir<1||fatigue>=75)return {label:'⚠️ Fatigue élevée',tone:'warn',text:'Conservez la charge ou arrêtez la série si la technique se dégrade. La priorité est la qualité.'};
    if(fatigue>=50||rir<2)return {label:'🟡 Fatigue modérée',tone:'warn',text:'Pas de progression de charge maintenant. Prenez le repos complet et maintenez une technique stricte.'};
    if(reps>=range[1]&&rir>=2)return {label:'🟢 Performance forte',tone:'good',text:'Zone favorable : utilisez le palier prévu à la prochaine série.'};
    return {label:'🟢 Rythme maîtrisé',tone:'good',text:'Continuez sur la même charge et cherchez une répétition propre supplémentaire.'};
  };
  const sessionRpe=(sets)=>{
    const done=sets.filter(s=>s.done&&Number(s.rir)>=0); if(!done.length)return 0;
    const avgRir=done.reduce((a,s)=>a+Number(s.rir),0)/done.length;
    return Math.max(1,Math.min(10,Math.round((10-avgRir)*10)/10));
  };
  const recoveryScore=()=>{const recent=state.history.slice(-3);if(!recent.length)return {score:75,label:'Prêt à construire',tone:'good',action:'Entraînez-vous normalement.',detail:'Pas encore assez de données : le coach établit votre référence.'};const fatigue=recent.reduce((a,h)=>a+(Number(h.fatigue)||0),0)/recent.length;const rpe=recent.reduce((a,h)=>a+(Number(h.sessionRpe)||0),0)/recent.length;const gap=recent.length>=2?(new Date(recent.at(-1).date)-new Date(recent.at(-2).date))/86400000:3;const check=state.readiness||{energy:3,sleep:3,soreness:3};const readiness=(Number(check.energy)||3)*20+(Number(check.sleep)||3)*20+(6-(Number(check.soreness)||3))*8;const score=Math.max(0,Math.min(100,Math.round(100-fatigue*.45-(rpe>8?(rpe-8)*8:0)+readiness*.15+(gap<1?-10:gap>=2?5:0))));if(score<45||fatigue>=70)return {score,label:'🔴 Récupération prioritaire',tone:'warn',action:'Réduisez la charge ou le volume aujourd’hui.',detail:'Les dernières données suggèrent une récupération incomplète. Le coach privilégie la qualité plutôt que la performance.'};if(score<65||fatigue>=50)return {score,label:'🟡 Maintenir',tone:'warn',action:'Gardez les charges prévues, sans chercher de palier supplémentaire.',detail:'Vous pouvez vous entraîner, mais sans forcer la progression.'};return {score,label:'🟢 Prêt à progresser',tone:'good',action:'Suivez la progression prévue.',detail:'Les signaux disponibles sont compatibles avec une séance normale.'};};
  const recoveryCheckin=()=>state.readiness||{energy:3,sleep:3,soreness:3};
  const adaptiveDecision=()=>{
    const recent=state.history.slice(-3);
    const recovery=recoveryScore();
    const highFatigue=recent.length>=3&&recent.every(h=>(Number(h.fatigue)||0)>=65);
    const highRpe=recent.length>=3&&recent.filter(h=>(Number(h.sessionRpe)||0)>=8).length>=2;
    if(highFatigue||highRpe)return {mode:'deload',label:'🔴 Deload recommandé',tone:'warn',factor:.65,detail:'Fatigue élevée répétée : réduisez temporairement le volume et gardez une marge confortable.'};
    if(recovery.score<45)return {mode:'reduced',label:'🟠 Volume réduit',tone:'warn',factor:.75,detail:'Récupération insuffisante : le coach retire environ 25% du volume prévu.'};
    if(recovery.score<65)return {mode:'maintain',label:'🟡 Volume maintenu',tone:'warn',factor:1,detail:'Récupération moyenne : conservez le volume sans chercher à ajouter du travail.'};
    return {mode:'normal',label:'🟢 Volume normal',tone:'good',factor:1,detail:'Récupération favorable : suivez le volume prévu et la progression habituelle.'};
  };
  const plannedSets=(exercise)=>{
    const decision=adaptiveDecision();
    const base=Number(exercise[2])||1;
    if(decision.mode==='normal'||decision.mode==='maintain')return base;
    return Math.max(1,Math.round(base*decision.factor));
  };
  const exerciseHistory=(name)=>state.history.flatMap(h=>(h.exercises||[]).filter(e=>e.name===name).map(e=>({...e,date:h.date,session:h.name}))).filter(e=>e.sets?.length||Number(e.reps)>0);
  const exerciseProfile=(name,range)=>{
    const history=exerciseHistory(name).slice(-6);
    if(!history.length)return {status:'new',label:'🆕 Référence à construire',tone:'neutral',detail:'Aucune tendance fiable : le coach établit votre première référence.',gain:0};
    const first=history[0],last=history.at(-1);
    const firstKg=Math.max(...(first.sets||[{kg:first.kg}]).map(s=>Number(s.kg)||0));
    const lastKg=Math.max(...(last.sets||[{kg:last.kg}]).map(s=>Number(s.kg)||0));
    const firstReps=Math.max(...(first.sets||[{reps:first.reps}]).map(s=>Number(s.reps)||0));
    const lastReps=Math.max(...(last.sets||[{reps:last.reps}]).map(s=>Number(s.reps)||0));
    const gain=firstKg>0?Math.round((lastKg-firstKg)/firstKg*100):lastReps-firstReps;
    const plateau=history.length>=3&&history.slice(-3).every(h=>{const sets=h.sets||[];const maxKg=Math.max(...sets.map(s=>Number(s.kg)||0),Number(h.kg)||0);const maxReps=Math.max(...sets.map(s=>Number(s.reps)||0),Number(h.reps)||0);return maxKg<=lastKg&&maxReps<=lastReps;});
    if(plateau)return {status:'plateau',label:'🟠 Plateau détecté',tone:'warn',detail:'Performance stable sur plusieurs expositions : cherchez d’abord des répétitions propres.',gain};
    if(gain>0||lastReps>firstReps)return {status:'progress',label:'🟢 Progression',tone:'good',detail:'Votre performance monte : conservez la double progression.',gain};
    return {status:'stable',label:'🟡 Stable',tone:'warn',detail:'Performance stable : cherchez une répétition propre supplémentaire.',gain};
  };
  const adaptiveTarget=(name,setIndex,range,previousSets,currentSets)=>{
    const base=targetForSet(name,setIndex,range,previousSets,currentSets);
    if(adaptiveDecision().mode==='deload')return {...base,reps:range[0],rir:3};
    return base;
  };
  const coachDecision=(name,range)=>{
    const profile=exerciseProfile(name,range);
    if(profile.status==='plateau')return {title:profile.label,text:'Ajoutez d’abord 1 répétition avec la même charge avant toute hausse de poids.',tone:'warn'};
    if(profile.status==='progress')return {title:'📈 Progression confirmée',text:'La performance évolue : augmentez seulement en haut de fourchette avec RIR suffisant.',tone:'good'};
    return {title:'🎯 Construire la performance',text:'Priorité aux répétitions propres avec environ 2 RIR.',tone:'good'};
  };

  const recommend=(previousSets,target,range)=>{if(!previousSets.length)return 'Commencez léger et gardez environ 3 RIR. Priorité à la technique.';const valid=previousSets.filter(s=>Number(s.reps)>0);if(!valid.length)return 'Commencez léger et construisez une première référence.';const allTop=valid.length>=3&&valid.every(s=>Number(s.reps)>=range[1]);const allSafe=valid.every(s=>Number(s.rir)>=2);const avgKg=valid.reduce((a,s)=>a+(Number(s.kg)||0),0)/valid.length;const avgRir=valid.reduce((a,s)=>a+(Number(s.rir)||0),0)/valid.length;const load=avgKg?Math.round(avgKg*10)/10:0;if(allTop&&allSafe&&load){const step=load>=20?2.5:load>=10?1.25:0.5;return `Progression : ${load+step} kg × ${range[0]}–${range[1]} reps. La dernière séance était complète avec environ ${Math.round(avgRir*10)/10} RIR moyen.`;}if(valid.some(s=>Number(s.rir)<2)){return `Conservez ${load?load+' kg':'la même charge'} et visez ${range[0]}–${range[1]} reps. Ne montez pas la charge tant que le RIR moyen reste sous 2.`;}const best=Math.max(...valid.map(s=>Number(s.reps)||0));return `Conservez ${load?load+' kg':'la même charge'} et essayez d'atteindre ${Math.min(range[1],best+1)} reps sur les séries avec une technique propre.`;};
  const weeklyCount=()=>{const d=new Date(),day=d.getDay()||7; const m=new Date(d);m.setDate(d.getDate()-day+1);m.setHours(0,0,0,0);return state.history.filter(h=>new Date(h.date)>=m).length;};
  let state;try{state=JSON.parse(localStorage.getItem(KEY)||'null')}catch{} state=state||{history:[],weight:78,goal:3};state.history=Array.isArray(state.history)?state.history:[];state.weights=Array.isArray(state.weights)?state.weights:[];
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
    const recovery=recoveryScore(); const check=recoveryCheckin();
    layout(`
      <section class="hero"><div class="eyebrow">OBJECTIF · 3 SÉANCES / SEMAINE</div><h1>Construisez un corps plus fort.<br><span>Une séance à la fois.</span></h1><p>Programme full-body orienté muscle, posture et régularité.</p><button class="primary" data-action="choose">Commencer une séance →</button>${Object.keys(JSON.parse(localStorage.getItem(DRAFT)||'{}')).length?'<p class="resume-note">⏸ Une séance interrompue est disponible : choisissez sa séance pour la reprendre.</p>':''}</section>
      <div class="grid stats"><div><b>${done}/3</b><small>séances cette semaine</small></div><div><b>${Math.round(mins/60*10)/10} h</b><small>temps cumulé</small></div><div><b>🔥 ${streak}</b><small>semaines régulières</small></div></div>
      <section class="coach-card"><div><b>🎯 Coach du jour</b><p>${done>=3?'Objectif hebdomadaire atteint. Récupérez et revenez fort la semaine prochaine.':`Encore ${Math.max(0,3-done)} séance${3-done>1?'s':''} cette semaine. La régularité est votre priorité.`}</p></div><span>${Math.round(done/3*100)}%</span></section>
      <section class="recovery-card ${recovery.tone}"><div><div class="eyebrow">🧠 RECOVERY INTELLIGENCE · V6.2</div><h2>${recovery.label}</h2><p>${recovery.detail}</p><b>${recovery.action}</b></div><span>${recovery.score}<small>/100</small></span></section>
      <section class="checkin"><div class="section-title"><h2>Check-in avant séance</h2><span>30 secondes</span></div><div class="checkin-grid"><label>Énergie<select id="energyInput"><option value="1" ${check.energy==1?"selected":""}>1 · très basse</option><option value="2" ${check.energy==2?"selected":""}>2</option><option value="3" ${check.energy==3?"selected":""}>3 · normale</option><option value="4" ${check.energy==4?"selected":""}>4</option><option value="5" ${check.energy==5?"selected":""}>5 · excellente</option></select></label><label>Sommeil<select id="sleepInput"><option value="1" ${check.sleep==1?"selected":""}>1 · mauvais</option><option value="2" ${check.sleep==2?"selected":""}>2</option><option value="3" ${check.sleep==3?"selected":""}>3 · correct</option><option value="4" ${check.sleep==4?"selected":""}>4</option><option value="5" ${check.sleep==5?"selected":""}>5 · excellent</option></select></label><label>Courbatures<select id="sorenessInput"><option value="1" ${check.soreness==1?"selected":""}>1 · fortes</option><option value="2" ${check.soreness==2?"selected":""}>2</option><option value="3" ${check.soreness==3?"selected":""}>3 · modérées</option><option value="4" ${check.soreness==4?"selected":""}>4</option><option value="5" ${check.soreness==5?"selected":""}>5 · aucune</option></select></label></div><small class="disclaimer">Score indicatif basé sur vos données d’entraînement et votre auto-évaluation, pas une mesure médicale.</small></section>
      <section><div class="section-title"><h2>Votre semaine</h2><span>${done>=3?'Objectif atteint 🎉':'Encore '+Math.max(0,3-done)+' à faire'}</span></div>
      <div class="week">${['L','M','M','J','V','S','D'].map((d,i)=>`<div class="${state.history.some(h=>new Date(h.date).toDateString()===new Date(monday.getTime()+i*86400000).toDateString())?'done':''}"><span>${d}</span><i>${state.history.some(h=>new Date(h.date).toDateString()===new Date(monday.getTime()+i*86400000).toDateString())?'✓':''}</i></div>`).join('')}</div></section>
      <section class="next-card">Prochaine séance suggérée : <b>${PLAN[nextSession()].name} — ${PLAN[nextSession()].focus}</b><button data-session="${nextSession()}">Démarrer →</button></section><section><div class="section-title"><h2>Les séances</h2></div><div class="cards">${Object.entries(PLAN).map(([k,p])=>`<button class="session-card" data-session="${k}"><strong>${p.name}</strong><span>${p.focus}</span><em>${p.exercises.length} exercices · volume adaptatif</em><b>›</b></button>`).join('')}</div></section>
    `);
  }

  function choose(){
    layout(`<section class="hero compact"><div class="eyebrow">CHOISIR</div><h1>Quelle séance<br><span>aujourd’hui ?</span></h1></section><div class="cards"> ${Object.entries(PLAN).map(([k,p])=>`<button class="session-card big" data-session="${k}"><div class="session-num">${k}</div><strong>${p.name}</strong><span>${p.focus}</span><em>${p.exercises.length} exercices</em><b>Commencer →</b></button>`).join('')}</div>`);
  }

  function workout(){
    const p=PLAN[route.session]; if(!p){choose();return;}
    const ex=p.exercises[route.index],previous=getLast(ex[1]),previousSets=getLastSets(ex[1]);
    const range=RANGES[ex[0]]||[ex[3],ex[3]],saved=route.sets.filter(s=>s.exerciseId===ex[0]),total=p.exercises.length; const decision=adaptiveDecision(); const setCount=plannedSets(ex);
    const preview=adaptiveTarget(ex[1],saved.length,range,previousSets,saved),targetLoad=preview.kg?preview.kg+' kg':'Charge à définir',unit=ex[0]==='plank'?'secondes':'reps'; const coach=coachDecision(ex[1],range); const live=liveState(saved,range),fatigue=fatigueScore(saved);
    const previousLine=previous?'<small>Dernière séance : '+previous.kg+' kg × '+previous.reps+' reps · RIR '+(previous.rir||'—')+'</small>':'<small>Première séance enregistrée : construisez votre référence.</small>';
    const rows=Array.from({length:setCount},(_,i)=>{
      const s=saved[i],t=adaptiveTarget(ex[1],i,range,previousSets,saved),kg=s?.kg??(t.kg||''),reps=s?.reps??t.reps,rir=s?.rir??t.rir,feedback=s?.done?evaluateSet(s,range):null;
      return '<div class="set-row '+(s?.done?'set-complete':'')+'"><span>Série '+(i+1)+'<small class="set-target">Cible : '+(t.kg?t.kg+' kg':'à définir')+' · '+t.reps+' reps · RIR '+t.rir+'</small></span><input inputmode="decimal" placeholder="kg" value="'+kg+'" data-kg="'+i+'"><input inputmode="numeric" placeholder="reps" value="'+reps+'" data-reps="'+i+'"><input class="rir" inputmode="numeric" placeholder="RIR" value="'+rir+'" data-rir="'+i+'"><button class="'+(s?.done?'checked':'')+'" data-set="'+i+'">'+(s?.done?'✓':'OK')+'</button>'+(feedback?'<div class="set-feedback '+feedback.tone+'"><b>'+feedback.title+'</b><span>'+feedback.text+'</span></div>':'')+'</div>';
    }).join('');
    layout('<div class="workout-head"><button class="back" data-nav="home">←</button><div><b>'+p.name+'</b><small>'+route.index+1+'/'+total+'</small></div><span>'+Math.round((route.index)/total*100)+'%</span></div>'+
      '<div class="progress"><i style="width:'+Math.round((route.index+1)/total*100)+'%"></i></div>'+
      '<section class="exercise"><div class="illustration"><img src="assets/illustrations/'+ex[0]+'.svg" alt="Illustration '+ex[1]+'" loading="eager"></div>'+
      '<div class="tag">EXERCICE '+(route.index+1)+' · SMART MODE</div><h1>'+ex[1]+'</h1><p class="muscles">'+ex[4]+'</p>'+
      '<div class="cue"><b>Technique</b><span>'+ex[5]+'</span></div>'+
      '<div class="coach-tip smart-tip"><b>🤖 Coach V6.1 · Live Coach</b><span>'+targetLoad+' × '+range[0]+'–'+range[1]+' '+unit+' · RIR cible '+preview.rir+'</span><small>La cible s’adapte après chaque série selon vos reps et votre RIR.</small></div><div class="live-status '+live.tone+'"><b>'+live.label+'</b><span>'+live.text+'</span><em>Fatigue estimée · '+fatigue+'%</em></div>'+
      '<div class="prescription"><strong>'+setCount+' × '+range[0]+'–'+range[1]+' '+unit+'</strong><span>Repos recommandé · 90 s · RIR cible 2</span>'+previousLine+'</div><div class="volume-advice '+decision.tone+'"><b>'+decision.label+'</b><span>'+decision.detail+'</span></div><div class="coach-decision '+coach.tone+'"><b>'+coach.title+'</b><span>'+coach.text+'</span></div>'+
      '<div class="setlist">'+rows+'</div><div class="actions"><button class="secondary" data-action="rest">⏱ Repos 90 s</button><button class="primary" data-action="next">'+(route.index===total-1?'Terminer la séance':'Exercice suivant →')+'</button></div></section>');
  }
  function progress(){
    const totalVol=state.history.reduce((sum,h)=>sum+(h.volume||0),0);
    const totalTime=state.history.reduce((a,h)=>a+(h.duration||0),0);
    const allSets=state.history.flatMap(h=>(h.exercises||[]).flatMap(e=>e.sets?.length?e.sets:[e]));
    const best={};
    allSets.forEach(e=>{const name=e.name||'';const kg=Number(e.kg)||0;const reps=Number(e.reps)||0;if(!best[name]||kg>best[name].kg||(kg===best[name].kg&&reps>best[name].reps))best[name]={kg,reps};});
    const rows=Object.entries(best).slice(0,8);
    const recent=state.history.slice(-8);const maxVol=Math.max(1,...recent.map(h=>h.volume||0));
    const w=weights();
    const calendar=Array.from({length:28},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-27+i);const count=state.history.filter(h=>new Date(h.date).toDateString()===d.toDateString()).length;return `<div class="calday ${count?'trained':''}" title="${fmtDate(d)} · ${count} séance(s)">${d.getDate()}</div>`}).join('');
    const exerciseNames=[...new Set(state.history.flatMap(h=>(h.exercises||[]).map(e=>e.name)))];
    const trendData=exerciseNames.length?exerciseNames.map(n=>{const sets=allSets.filter(e=>e.name===n);const first=sets[0],last=sets.at(-1);const gain=first&&last&&Number(first.kg)>0?Math.round((Number(last.kg)-Number(first.kg))/Number(first.kg)*100):0;return {n,last, gain};}).sort((a,b)=>b.gain-a.gain):[];
    const progressing=trendData.filter(x=>x.gain>0).length, stagnant=trendData.filter(x=>x.gain===0).length, declining=trendData.filter(x=>x.gain<0).length;
    const consistency=Math.min(100,Math.round(state.history.length/Math.max(1,Math.ceil((Date.now()-new Date(state.history[0]?.date||Date.now()))/(7*86400000)))*100/3));
    const badges=[];if(state.history.length>=1)badges.push('🏁 Première séance');if(state.history.length>=10)badges.push('💪 10 séances');if(totalVol>=10000)badges.push('🏋️ 10 000 kg');if(calcStreak()>=4)badges.push('🔥 4 semaines');if(progressing>=3)badges.push('📈 En progression');
    const next=PLAN[nextSession()]; const recovery=recoveryScore(); const decision=adaptiveDecision(); const adaptiveProfiles=Object.entries(RANGES).map(([id,r])=>{const ex=Object.values(PLAN).flatMap(p=>p.exercises).find(x=>x[0]===id);return ex?{name:ex[1],profile:exerciseProfile(ex[1],r)}:null}).filter(Boolean); const plateauCount=adaptiveProfiles.filter(x=>x.profile.status==='plateau').length;
    layout(`<section class="hero compact"><div class="eyebrow">FITCOACH V7 · ADAPTIVE COACH ENGINE</div><h1>Votre progression<br><span>en un coup d’œil.</span></h1><p>Le Live Coach ajuste vos cibles en temps réel, estime la fatigue et transforme chaque séance en nouvelle donnée de progression.</p><section class="recovery-mini ${recovery.tone}"><b>${recovery.label}</b><span>${recovery.score}/100 · ${recovery.action}</span></section><section class="adaptive-mini ${decision.tone} "><b>${decision.label}</b><span>${decision.detail}</span></section></section>
      <section class="coach-dashboard"><div><div class="eyebrow">🎯 RECOMMANDATION</div><h2>${next.name}</h2><p>${next.focus}</p></div><button data-session="${nextSession()}">Démarrer →</button></section>
      <div class="grid stats"><div><b>${state.history.length}</b><small>séances</small></div><div><b>${Math.round(totalVol/100)/10}k</b><small>kg volume</small></div><div><b>${fmtMin(totalTime)}</b><small>temps total</small></div></div>
      <section><div class="section-title"><h2>Adaptive Coach · V7</h2><span>${plateauCount} plateau${plateauCount>1?"s":""}</span></div><div class="adaptive-summary"><div><b>🤖</b><span>Profils analysés</span><strong>${adaptiveProfiles.length}</strong></div><div><b>📈</b><span>En progression</span><strong>${progressing}</strong></div><div><b>🟠</b><span>Plateaux</span><strong>${plateauCount}</strong></div></div></section>
      <section><div class="section-title"><h2>État de progression</h2><span>${progressing} en hausse</span></div><div class="status-grid"><div><b>📈 ${progressing}</b><small>progressent</small></div><div><b>⏸ ${stagnant}</b><small>stables</small></div><div><b>📉 ${declining}</b><small>à surveiller</small></div></div></section>
      <section><div class="section-title"><h2>Volume des séances</h2><span>8 dernières</span></div><div class="bars">${recent.map(h=>`<div><i style="height:${Math.max(8,Math.round((h.volume||0)/maxVol*100))}%"></i><small>${Math.round((h.volume||0)/100)/10}k</small></div>`).join('')||'<div class="empty">Vos données apparaîtront après votre première séance.</div>'}</div></section>
      <section><div class="section-title"><h2>Régularité · 28 jours</h2><span>🔥 ${calcStreak()} sem.</span></div><div class="calendar">${calendar}</div></section>
      <section><div class="section-title"><h2>Poids corporel</h2><span>${w.length?'Dernière mesure : '+w.at(-1).kg+' kg':'Aucune mesure'}</span></div><form id="weightForm" class="weight-form"><label for="weightInput">Poids</label><input id="weightInput" type="number" min="20" max="350" step="0.1" value="${state.weight||78}" required><span>kg</span><button type="submit">Enregistrer</button></form><div class="weight-history">${w.slice(-8).map(v=>`<span>${fmtDate(v.date)} : <b>${v.kg} kg</b></span>`).join('')||'<small>Enregistrez votre première mesure.</small>'}</div></section>
      <section><div class="section-title"><h2>Performance par exercice</h2></div><select id="exerciseSelect" class="exercise-select"><option value="">Choisir un exercice</option>${exerciseNames.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('')}</select><div id="exerciseTrend" class="trend">Sélectionnez un exercice pour afficher son évolution.</div></section>
      <section><div class="section-title"><h2>Records personnels</h2><span>meilleure charge</span></div><div class="table">${rows.map(([n,v])=>`<div><span>${esc(n)}</span><b>${v.kg} kg × ${v.reps}</b></div>`).join('')||'<div class="empty">Vos records apparaîtront ici.</div>'}</div></section>
      <section><div class="section-title"><h2>Badges</h2></div><div class="badges">${badges.map(b=>`<span>${b}</span>`).join('')||'<span>Votre premier badge est à une séance d’ici 🏁</span>'}</div></section>
      <section><div class="section-title"><h2>Historique récent</h2></div><div class="history">${state.history.slice().reverse().slice(0,10).map(h=>`<article><div><b>${h.name}</b><small>${fmtDate(h.date)} · ${Math.round((h.duration||0)/60)} min</small></div><strong>${Math.round(h.volume||0)} kg</strong></article>`).join('')||'<div class="empty">Aucun entraînement enregistré.</div>'}</div></section>`);
  }

  function history(){ progress(); }

  function calcStreak(){
    if(!state.history.length)return 0;
    const weeks=new Set(state.history.map(h=>{const d=new Date(h.date), one=new Date(d); const day=d.getDay()||7; one.setDate(d.getDate()-day+1); one.setHours(0,0,0,0); return one.toISOString().slice(0,10)}));
    let cur=new Date(); const day=cur.getDay()||7; cur.setDate(cur.getDate()-day+1); cur.setHours(0,0,0,0); let n=0;
    while(weeks.has(cur.toISOString().slice(0,10))){n++;cur.setDate(cur.getDate()-7)} return n;
  }

  function startSession(k){const drafts=JSON.parse(localStorage.getItem(DRAFT)||'{}');const d=drafts[k];if(d){route={page:'workout',session:k,index:Number(d.index)||0,sets:d.sets||[]};workoutStart=Number(d.start)||Date.now();delete drafts[k];localStorage.setItem(DRAFT,JSON.stringify(drafts));}else{route={page:'workout',session:k,index:0,sets:[]};workoutStart=Date.now();}workout();}

  function completeSession(){
    const p=PLAN[route.session];
    const exercises=[]; let volume=0;
    route.sets.filter(s=>s.done).forEach(s=>{const e=p.exercises.find(x=>x[0]===s.exerciseId); const v=(Number(s.kg)||0)*(Number(s.reps)||0); volume+=v; exercises.push({name:e[1],kg:Number(s.kg)||0,reps:Number(s.reps)||0,rir:Number(s.rir)||0,set:s.index+1});});
    const duration=Math.max(1,Math.round((Date.now()-workoutStart)/1000)); const sessionRpeValue=sessionRpe(route.sets),sessionFatigue=fatigueScore(route.sets);
    state.history.push({date:new Date().toISOString(),name:p.name,duration,volume,sessionRpe:sessionRpeValue,fatigue:sessionFatigue,exercises: p.exercises.map(e=>{const sets=route.sets.filter(s=>s.exerciseId===e[0]&&s.done).map(s=>({kg:Number(s.kg)||0,reps:Number(s.reps)||0,rir:Number(s.rir)||0,set:s.index+1}));return {name:e[1],kg:sets.length?sets[sets.length-1].kg:0,reps:sets.length?sets[sets.length-1].reps:0,rir:sets.length?sets[sets.length-1].rir:0,sets};}).filter(e=>e.sets.length)});state.coachDecisions=Array.isArray(state.coachDecisions)?state.coachDecisions:[];p.exercises.forEach(e=>{const r=RANGES[e[0]]||[e[3],e[3]],intel=exerciseIntelligence(e[1],r),rec=progressionRecommendation(e[1],r);state.coachDecisions.push({date:new Date().toISOString(),exercise:e[1],action:rec.action,confidence:intel.confidence,e1rm:intel.e1rm,reason:intel.reason});});state.coachDecisions=state.coachDecisions.slice(-100);save();localStorage.removeItem(DRAFT);
    route.page='home';route.session=null;route.index=0;route.sets=[];
    layout(`<section class="done-screen"><div class="trophy">🏆</div><div class="eyebrow">SÉANCE TERMINÉE</div><h1>Excellent travail<br><span>Continuez ainsi.</span></h1><div class="done-grid"><div><b>${Math.round(duration/60)} min</b><small>durée</small></div><div><b>${Math.round(volume)} kg</b><small>volume</small></div><div><b>${exercises.length}</b><small>séries validées</small></div><div><b>${sessionRpeValue}/10</b><small>RPE</small></div><div><b>${sessionFatigue}%</b><small>fatigue</small></div></div><p>La régularité bat la perfection. Le volume de votre prochaine séance sera ajusté selon votre récupération.</p><button class="primary" data-nav="progress">Voir ma progression →</button></section>`);
  }

  document.addEventListener('change',e=>{if(['energyInput','sleepInput','sorenessInput'].includes(e.target.id)){state.readiness={energy:Number(document.getElementById('energyInput').value),sleep:Number(document.getElementById('sleepInput').value),soreness:Number(document.getElementById('sorenessInput').value)};save();home();}});
  document.addEventListener('submit',e=>{if(e.target.id==='weightForm'){e.preventDefault();const kg=Number(document.getElementById('weightInput').value);if(!Number.isFinite(kg)||kg<20||kg>350)return;state.weight=kg;state.weights.push({date:new Date().toISOString(),kg});save();progress();}});
  document.addEventListener('change',e=>{if(e.target.id==='exerciseSelect'){const name=e.target.value;const data=state.history.flatMap(h=>(h.exercises||[]).filter(x=>x.name===name).map(x=>({...x,date:h.date})));const el=document.getElementById('exerciseTrend');if(el)el.innerHTML=data.length?data.slice(-12).map(x=>`<div><span>${fmtDate(x.date)}</span><b>${Number(x.kg)||0} kg × ${Number(x.reps)||0} reps</b></div>`).join(''):'Aucune donnée.';}});
  document.addEventListener('click',e=>{
    const n=e.target.closest('[data-nav]'); if(n){route.page=n.dataset.nav; route.session=null; route.index=0; route.sets=[]; ({home,workout,progress,history}[route.page]||home)(); return;}
    const ss=e.target.closest('[data-session]'); if(ss){startSession(ss.dataset.session);return;}
    const chooseBtn=e.target.closest('[data-action="choose"]'); if(chooseBtn){route.page='home';choose();return;}
    const next=e.target.closest('[data-action="next"]'); if(next){ if(route.index===PLAN[route.session].exercises.length-1)completeSession(); else {route.index++;workout();} return;}
    const rest=e.target.closest('[data-action="rest"]'); if(rest) startTimer(90);
    const set=e.target.closest('[data-set]'); if(set){
      const row=set.closest('.set-row'),ex=PLAN[route.session].exercises[route.index],range=RANGES[ex[0]]||[ex[3],ex[3]],kg=row.querySelector('[data-kg]').value,reps=row.querySelector('[data-reps]').value,rir=row.querySelector('[data-rir]').value,idx=Number(set.dataset.set);
      if(!reps){row.querySelector('[data-reps]').focus();return;}
      const prev=route.sets.find(s=>s.exerciseId===ex[0]&&s.index===idx),rec={exerciseId:ex[0],index:idx,kg,reps,rir,done:true};
      if(prev)Object.assign(prev,rec);else route.sets.push(rec);set.classList.add('checked');set.textContent='✓';saveDraft();
      const f=evaluateSet(rec,range);let box=row.querySelector('.set-feedback');if(box)box.remove();box=document.createElement('div');box.className='set-feedback '+f.tone;box.innerHTML='<b>'+f.title+'</b><span>'+f.text+'</span>';row.appendChild(box);
      const nextRow=row.nextElementSibling;if(nextRow){
        const nextIndex=idx+1,nextTarget=targetForSet(ex[1],nextIndex,range,getLastSets(ex[1]),route.sets),targetEl=nextRow.querySelector('.set-target'),kgInput=nextRow.querySelector('[data-kg]');
        if(targetEl)targetEl.textContent='Cible : '+(nextTarget.kg?nextTarget.kg+' kg':'à définir')+' · '+nextTarget.reps+' reps · RIR '+nextTarget.rir;
        if(kgInput&&!kgInput.value&&nextTarget.kg)kgInput.value=nextTarget.kg;
      }
      if(Number(rir)<2)startTimer(90);
    }
  });
  document.addEventListener('input',e=>{if(e.target.matches('[data-kg],[data-reps],[data-rir]')){const ex=PLAN[route.session].exercises[route.index],idx=Number(e.target.dataset.kg??e.target.dataset.reps??e.target.dataset.rir);let r=route.sets.find(s=>s.exerciseId===ex[0]&&s.index===idx);if(!r){r={exerciseId:ex[0],index:idx,kg:'',reps:''};route.sets.push(r)};if(e.target.dataset.kg!==undefined)r.kg=e.target.value;else if(e.target.dataset.reps!==undefined)r.reps=e.target.value;else r.rir=e.target.value;saveDraft();}});
  function saveDraft(){if(!route.session)return;const drafts=JSON.parse(localStorage.getItem(DRAFT)||'{}');drafts[route.session]={index:route.index,sets:route.sets,start:workoutStart,savedAt:Date.now()};localStorage.setItem(DRAFT,JSON.stringify(drafts));}
  function resumeAvailable(k){const d=JSON.parse(localStorage.getItem(DRAFT)||'{}')[k];return !!d;}
  function startTimer(s){remaining=s; clearInterval(timer); const toast=document.createElement('div'); toast.className='timer'; toast.innerHTML='<b>Repos</b><strong id="timerValue">'+fmtMin(remaining)+'</strong><button id="stopTimer">Fermer</button>';document.body.appendChild(toast);document.getElementById('stopTimer').onclick=()=>{clearInterval(timer);toast.remove()};timer=setInterval(()=>{remaining--; const v=document.getElementById('timerValue'); if(v)v.textContent=fmtMin(Math.max(0,remaining)); if(remaining<=0){clearInterval(timer);navigator.vibrate?.([150,80,150]);}},1000);}

  home();
})();