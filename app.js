// ---------- Fehleranzeige ----------
(function(){
  const errBox = document.getElementById('err');
  if(!errBox) return;
  window.addEventListener('error', e => { errBox.textContent = 'Fehler: ' + e.message; });
  window.addEventListener('unhandledrejection', e => { errBox.textContent = 'Promise-Fehler: ' + e.reason; });
})();

// ---------- State ----------
const state = { A:[], B:[], tb:[], nights:[], timeline:[] };
const PREFILL_A = ["Calvin O.","Calvin S.","Jonny","Kevin Njie","Lennert","Nico","Olli","Rob","Sidar","Xander","Leandro"];
const PREFILL_B = ["Antonia","Ariel","Beverly","Elli","Hati","Henna","Joanna","Nelly","Sandra Janina","Viki"];
const NONE_LABEL = "— (ohne Partnerin)";

// ---------- Helpers ----------
const el=(t,a={},...c)=>{const e=document.createElement(t);
  for(const [k,v] of Object.entries(a)){ if(k==='class')e.className=v; else if(k==='html')e.innerHTML=v; else if(k.startsWith('on')&&typeof v==='function')e[k]=v; else e.setAttribute(k,v); }
  for(const x of c){ if(x==null) continue; e.appendChild(typeof x==='string'?document.createTextNode(x):x); }
  return e;
};
const optionsFor=(sel,arr)=>{ sel.innerHTML=''; arr.forEach(n=> sel.appendChild(el('option',{value:n},n))); };
const pushTimeline=(txt)=>{ state.timeline.unshift(new Date().toLocaleTimeString()+": "+txt); renderTimeline(); };
const warnBalance=()=>{
  const w=document.getElementById('warnBalance'); const a=state.A.length,b=state.B.length;
  if(a===b){ w.style.display='none'; return; }
  if(a===b+1){ w.style.display='block'; w.innerHTML=`Hinweis: <b>${a}</b> A vs. <b>${b}</b> B → genau <b>eine</b> A-Person bleibt ohne Partnerin.`; return; }
  w.style.display='block'; w.textContent=`Ungleiches Set (A: ${a}, B: ${b}). Unterstützt: A=B oder A=B+1.`;
};

// ---------- Teilnehmer ----------
function readNames(){
  state.A = Array.from(document.querySelectorAll('#listA input')).map(i=>i.value.trim()).filter(Boolean);
  state.B = Array.from(document.querySelectorAll('#listB input')).map(i=>i.value.trim()).filter(Boolean);
  updateSelectors(); warnBalance(); renderNights();
}
function addPerson(listId, preset=''){
  const row=el('div',{class:'card row'});
  const inp=el('input',{type:'text',value:preset,placeholder:listId==='listA'?'Name (A)':'Name (B)'});
  const del=el('button',{class:'danger small'},'Entfernen');
  del.onclick=()=>{ row.remove(); readNames(); };
  inp.oninput=readNames;
  row.append(inp,del);
  document.getElementById(listId).append(row);
}
function renderNames(A=[],B=[]){
  const La=document.getElementById('listA'), Lb=document.getElementById('listB');
  La.innerHTML=''; Lb.innerHTML=''; A.forEach(n=>addPerson('listA',n)); B.forEach(n=>addPerson('listB',n));
  readNames();
}
function updateSelectors(){
  const aSel=document.getElementById('tbA'), bSel=document.getElementById('tbB');
  if(aSel&&bSel){ optionsFor(aSel,state.A); optionsFor(bSel,state.B); }
}

// ---------- Matchbox ----------
function renderTBList(){
  const box=document.getElementById('tbList'); if(!box) return; box.innerHTML='';
  if(state.tb.length===0) box.append(el('div',{class:'muted small'},'Keine Einträge.'));
  state.tb.forEach((t,i)=>{
    const tag=t.type==='PM'?el('span',{class:'tag good'},'Perfect Match'):t.type==='NM'?el('span',{class:'tag bad'},'No Match'):el('span',{class:'tag neutral'},'Sold');
    const row=el('div',{class:'card row'}, el('div',{},`${t.a} × ${t.b}`), tag,
      el('button',{class:'small',onclick:()=>{state.tb.splice(i,1);renderTBList();pushTimeline('Matchbox entfernt');}},'Entfernen'));
    box.append(row);
  });
}

// ---------- Nights ----------
function enforceUniqueNight(night){
  const chosen=new Map();
  for(const [a,w] of Object.entries(night.pairs||{})){ if(w) chosen.set(w,a); }
  const allowEmpty=Math.max(0,state.A.length-state.B.length);
  let empties=Object.values(night.pairs||{}).filter(v=>!v).length;
  for(const [a,sel] of Object.entries(night.dom.selects)){
    for(const opt of sel.options){
      const v=opt.value;
      if(v===""){
        const isOwnEmpty=!night.pairs[a];
        opt.disabled=(empties>=allowEmpty)&&!isOwnEmpty;
      }else{
        const pickedByOther=chosen.has(v)&&chosen.get(v)!==a;
        opt.disabled=pickedByOther;
      }
    }
  }
}
function renderNights(){
  const box=document.getElementById('nights'); if(!box) return; box.innerHTML='';
  if(state.nights.length===0) box.append(el('div',{class:'muted small'},'Noch keine Nights.'));
  state.nights.forEach((night,idx)=>{
    const selects={};
    const table=el('table'), thead=el('thead',{}, el('tr',{}, el('th',{},'A'), el('th',{},'→ B'))), tbody=el('tbody');
    state.A.forEach(a=>{
      const s=el('select',{}); const opts=[...state.B,""]; optionsFor(s,opts); s.options[s.options.length-1].textContent=NONE_LABEL;
      s.value=night.pairs[a]??""; s.onchange=()=>{ night.pairs[a]=s.value; enforceUniqueNight(night); };
      selects[a]=s; tbody.append(el('tr',{}, el('td',{},a), el('td',{}, s)));
    });
    table.append(thead,tbody);
    const beams=el('input',{type:'number',min:'0',step:'1',value:night.beams??0});
    beams.oninput=()=> night.beams=parseInt(beams.value||'0',10);
    const del=el('button',{class:'danger small',onclick:()=>{state.nights.splice(idx,1);renderNights();pushTimeline('Night gelöscht');}},'Night löschen');
    const card=el('div',{class:'card stack'});
    card.append(el('div',{class:'row'}, el('strong',{},`Matching Night ${idx+1}`), el('span',{class:'pill'},'jede Frau max. einmal')),
                table, el('div',{class:'row'}, el('span',{},'Lichter:'), beams, del));
    box.append(card);
    night.dom={selects}; enforceUniqueNight(night);
  });
}
function renderTimeline(){
  const box=document.getElementById('timelineBox'); if(!box) return; box.innerHTML='';
  if(state.timeline.length===0){ box.append(el('div',{class:'muted small'},'Noch keine Aktionen.')); return; }
  state.timeline.forEach(t=> box.append(el('div',{class:'card small'}, t)));
}

// ---------- Solver ----------
function buildConstraints(){
  const m=state.A.length, n=state.B.length;
  if(m===0||n===0) return {ok:false, error:'Beide Gruppen dürfen nicht leer sein.'};
  if(!(m===n||m===n+1)) return {ok:false, error:`Unterstützt: A=B oder A=B+1 (aktuell ${m} vs. ${n}).`};

  const idxA=Object.fromEntries(state.A.map((x,i)=>[x,i]));
  const idxB=Object.fromEntries(state.B.map((x,i)=>[x,i]));
  const NONE=n;
  const forced=Array(m).fill(-1);
  const forbidden=Array.from({length:m},()=>new Set());

  // Matchbox
  for(const t of state.tb){
    if(!(t.a in idxA)) continue;
    const i=idxA[t.a];
    if(t.b in idxB){
      const j=idxB[t.b];
      if(t.type==='PM'){
        if(forced[i]!==-1 && forced[i]!==j) return {ok:false, error:`Widerspruch PM: ${t.a}×${t.b}`};
        forced[i]=j;
      } else if(t.type==='NM'){
        forbidden[i].add(j);
      }
    }
  }

  // Nights
  const nights=[];
  for(const night of state.nights){
    const map=Array(m).fill(NONE); let empties=0;
    for(const a of state.A){
      const bname=night.pairs[a]; const i=idxA[a];
      if(!bname){ map[i]=NONE; empties++; continue; }
      if(!(bname in idxB)) return {ok:false, error:'Matching Night enthält unbekannten Namen.'};
      map[i]=idxB[bname];
    }
    if(m===n && empties>0) return {ok:false, error:'Bei A=B darf niemand leer bleiben.'};
    if(m===n+1 && empties!==1) return {ok:false, error:'Bei A=B+1 muss genau eine Person leer bleiben.'};
    nights.push({map, beams: parseInt(night.beams||0,10), NONE});
  }
  return {ok:true, m,n,NONE,forced,forbidden,nights};
}

function solve(){
  // Overlay 2s + danach rechnen
  const overlay=document.getElementById('overlay');
  overlay.classList.add('show');
  const bar=document.querySelector('.progress .bar');
  if(bar){ bar.style.animation='none'; void bar.offsetWidth; bar.style.animation=null; }

  setTimeout(()=> {
    const status=document.getElementById('status');
    const logs=document.getElementById('logs'); logs.innerHTML='';
    const summary=document.getElementById('summary'); summary.innerHTML='';
    const matrix=document.getElementById('matrix'); matrix.style.display='none'; matrix.innerHTML='';
    const t0=performance.now();

    const cons=buildConstraints();
    const log=(m)=> logs.append(el('div',{class:'small muted'}, m));
    if(!cons.ok){ status.textContent='Fehler'; logs.append(el('div',{class:'warning'}, cons.error)); overlay.classList.remove('show'); return; }

    const {m,n,NONE,forced,forbidden,nights}=cons;
    const allowNone=(m===n+1);
    const all=[...Array(n).keys()];
    const dom=Array.from({length:m},(_,i)=> new Set(all.filter(j=>!forbidden[i].has(j))));
    if(allowNone){ for(let i=0;i<m;i++) dom[i].add(NONE); }
    for(let i=0;i<m;i++) if(forced[i]!==-1){ dom[i]=new Set([forced[i]]); }
    for(let i=0;i<m;i++) if(dom[i].size===0){ status.textContent='Unlösbar'; logs.append(el('div',{class:'warning'},`Keine Möglichkeit für ${state.A[i]}`)); overlay.classList.remove('show'); return; }

    const order=[...Array(m).keys()].sort((a,b)=> dom[a].size-dom[b].size);
    const assign=Array(m).fill(-1); const usedWomen=new Array(n).fill(false); let usedNone=0;
    let total=0n; const cols=n+(allowNone?1:0); const counts=Array.from({length:m},()=>Array(cols).fill(0n));

    function nightRange(nt){
      let fixed=0, possible=0;
      for(let i=0;i<m;i++){
        const w=assign[i];
        if(w!==-1){ if(w!==NONE && w===nt.map[i]) fixed++; }
        else {
          const want=nt.map[i];
          if(want===NONE){ if(allowNone && usedNone===0 && dom[i].has(NONE)) possible+=0; }
          else { if(!usedWomen[want] && dom[i].has(want)) possible++; }
        }
      }
      return [fixed,fixed+possible];
    }
    function prune(){ for(const nt of nights){ const [mn,mx]=nightRange(nt); if(nt.beams<mn||nt.beams>mx) return false; } return true; }
    function satisfied(){ for(const nt of nights){ let b=0; for(let i=0;i<m;i++) if(assign[i]!==-1 && assign[i]!==NONE && assign[i]===nt.map[i]) b++; if(b!==nt.beams) return false; } return true; }

    function dfs(pos){
      if(pos===m){
        if((!allowNone)||(allowNone&&usedNone===1)){
          if(!satisfied()) return;
          total++; for(let i=0;i<m;i++){ const j=assign[i]; const col=(j===NONE?n:j); counts[i][col]++; }
        }
        return;
      }
      const i=order[pos];
      for(const j of dom[i]){
        if(j===NONE){
          if(!allowNone||usedNone===1) continue;
          assign[i]=NONE; usedNone++;
          if(prune()) dfs(pos+1);
          assign[i]=-1; usedNone--;
        } else {
          if(usedWomen[j]) continue;
          assign[i]=j; usedWomen[j]=true;
          let ok=true;
          for(const k of order){ if(assign[k]!==-1 || k===i) continue; if(dom[k].size===1 && dom[k].has(j)){ ok=false; break; } }
          if(ok && prune()) dfs(pos+1);
          assign[i]=-1; usedWomen[j]=false;
        }
      }
    }

    if(!prune()){ status.textContent='Unlösbar'; logs.append(el('div',{class:'warning'},'Widerspruch mit Lichterzahlen.')); overlay.classList.remove('show'); return; }
    dfs(0);
    const dt=Math.round(performance.now()-t0);
    if(total===0n){ status.textContent='Keine Lösung'; summary.append(el('div',{class:'warning'},'Keine gültigen Kombinationen.')); log(`Zeit: ${dt} ms`); overlay.classList.remove('show'); return; }

    status.textContent='Fertig';
    summary.append(el('div',{class:'card'}, el('div',{},'Gültige Kombinationen: ', el('strong',{}, String(total))), el('div',{class:'small muted'}, `Zeit: ${dt} ms`)));

    const headers=state.B.slice(); if(allowNone) headers.push("— ohne Partnerin");
    const table=el('table'); const thead=el('thead'); const trh=el('tr'); trh.append(el('th',{},'A \\ B')); headers.forEach(b=> trh.append(el('th',{class:'center'}, b))); thead.append(trh); table.append(thead);
    const cols=headers.length;
    const tbody=el('tbody');
    const probs=Array.from({length:state.A.length},()=>Array(cols).fill(0));
    let maxP=0;
    for(let i=0;i<state.A.length;i++){
      for(let j=0;j<cols;j++){
        const raw = counts[i][j]*10000n/total;
        const p = Number(raw)/100;
        probs[i][j]=p; if(p>maxP) maxP=p;
      }
    }
    for(let i=0;i<state.A.length;i++){
      const tr=el('tr'); tr.append(el('td',{}, state.A[i]));
      for(let j=0;j<cols;j++){
        const p=probs[i][j]; const td=el('td',{class:'center'});
        const alpha = maxP>0 ? (0.15 + 0.85*(p/maxP)) : 0;
        td.style.background=`linear-gradient(180deg, rgba(110,168,254,${alpha}), transparent)`; td.style.borderRadius='6px';
        td.textContent = isNaN(p)? '-' : p.toFixed(2)+'%';
        tr.append(td);
      }
      tbody.append(tr);
    }
    table.append(tbody);
    const matrix=document.getElementById('matrix'); matrix.innerHTML=''; matrix.append(table); matrix.style.display='block';

    const picks=el('div',{class:'card'}); picks.append(el('div',{},'Wahrscheinlichste Paare je A-Person:'));
    for(let i=0;i<state.A.length;i++){
      let bestJ=-1, best=-1;
      for(let j=0;j<state.B.length;j++){ if(probs[i][j]>best){ best=probs[i][j]; bestJ=j; } }
      let line = (bestJ>=0) ? `${state.A[i]} → ${state.B[bestJ]} (${best.toFixed(2)}%)` : `${state.A[i]} → —`;
      if(state.A.length===state.B.length+1){ const pNone=probs[i][state.B.length]||0; line += `, ohne Partnerin: ${pNone.toFixed(2)}%`; }
      picks.append(el('div',{class:'small'}, line));
    }
    document.getElementById('summary').append(picks);

    overlay.classList.remove('show');
  }, 2000);
}

// ---------- Bottom-Navigation ----------
const nav=document.getElementById('nav');
const pages=document.querySelectorAll('.page');
if(nav){
  nav.addEventListener('click',(e)=>{
    const btn=e.target.closest('button'); if(!btn) return;
    document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const id=btn.getAttribute('data-target');
    pages.forEach(p=> p.classList.toggle('active', p.id===id));
    window.scrollTo({top:0,behavior:'smooth'});
  });
}

// ---------- Buttons verbinden ----------
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('prefill').onclick = ()=>{ renderNames(PREFILL_A,PREFILL_B); pushTimeline('Vorbelegung 11/10 geladen'); };
  document.getElementById('addA').onclick = ()=>{ addPerson('listA',''); readNames(); };
  document.getElementById('addB').onclick = ()=>{ addPerson('listB',''); readNames(); };
  document.getElementById('addTB').onclick = ()=>{
    const a=document.getElementById('tbA').value, b=document.getElementById('tbB').value, t=document.getElementById('tbType').value;
    if(!a) return alert('Bitte A wählen.'); if(!b) return alert('Bitte B wählen.');
    state.tb.push({a,b,type:t}); renderTBList(); pushTimeline(`Matchbox: ${a} × ${b} → ${t}`);
  };
  document.getElementById('addNight').onclick = ()=>{
    const night={pairs:{}, beams:0}; state.A.forEach(a=> night.pairs[a]=""); state.nights.push(night); renderNights(); pushTimeline('Neue Matching Night angelegt');
  };
  document.getElementById('solveBtn').onclick = solve;

  // Initial UI
  renderNames([],[]); renderTBList(); renderNights(); renderTimeline(); updateSelectors(); warnBalance();
});
