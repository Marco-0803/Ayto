// --- Error console ---
(function(){
  const errBox = document.getElementById('err');
  window.addEventListener('error', e => {
    errBox.textContent = 'Fehler: ' + e.message;
  });
  window.addEventListener('unhandledrejection', e => {
    errBox.textContent = 'Promise-Fehler: ' + e.reason;
  });
})();

const state = { A:[], B:[], tb:[], nights:[], timeline:[] };
const PREFILL_A = ["Calvin O.","Calvin S.","Jonny","Kevin Njie","Lennert","Nico","Olli","Rob","Sidar","Xander","Leandro"];
const PREFILL_B = ["Antonia","Ariel","Beverly","Elli","Hati","Henna","Joanna","Nelly","Sandra Janina","Viki"];
const NONE_LABEL = "— (ohne Partnerin)";

// Helper functions
const el = (t,a={},...c)=>{const e=document.createElement(t);
  for(const [k,v] of Object.entries(a)){
    if(k==='class') e.className=v;
    else if(k==='html') e.innerHTML=v;
    else if(k.startsWith('on')&&typeof v==='function') e[k]=v;
    else e.setAttribute(k,v);
  }
  for(const x of c){if(x==null)continue;e.appendChild(typeof x==='string'?document.createTextNode(x):x);}
  return e;
};
const optionsFor=(sel,arr)=>{sel.innerHTML='';arr.forEach(n=>sel.appendChild(el('option',{value:n},n)));};
const warnBalance=()=>{
  const w=document.getElementById('warnBalance');
  const a=state.A.length,b=state.B.length;
  if(a===b){w.style.display='none';return;}
  if(a===b+1){w.style.display='block';w.innerHTML=`Hinweis: <b>${a}</b> A vs. <b>${b}</b> B → genau <b>eine</b> A-Person bleibt ohne Partnerin.`;return;}
  w.style.display='block';w.textContent=`Ungleiches Set (A: ${a}, B: ${b}). Unterstützt: A=B oder A=B+1.`;
};
const updateSelectors=()=>{
  const aSel=document.getElementById('tbA'),bSel=document.getElementById('tbB');
  optionsFor(aSel,state.A);optionsFor(bSel,state.B);
};
function readNames(){
  state.A=Array.from(document.querySelectorAll('#listA input')).map(i=>i.value.trim()).filter(Boolean);
  state.B=Array.from(document.querySelectorAll('#listB input')).map(i=>i.value.trim()).filter(Boolean);
  updateSelectors();warnBalance();renderNights();
}
function addPerson(listId,preset=''){
  const row=el('div',{class:'card row'});
  const inp=el('input',{type:'text',value:preset,placeholder:listId==='listA'?'Name (A)':'Name (B)'});
  const del=el('button',{class:'danger small'},'Entfernen');
  del.onclick=()=>{row.remove();readNames();};
  inp.oninput=readNames;
  row.append(inp,del);
  document.getElementById(listId).append(row);
}
function renderNames(A=[],B=[]){
  const La=document.getElementById('listA'),Lb=document.getElementById('listB');
  La.innerHTML='';Lb.innerHTML='';A.forEach(n=>addPerson('listA',n));B.forEach(n=>addPerson('listB',n));
  readNames();
}
function renderTBList(){
  const box=document.getElementById('tbList');box.innerHTML='';
  if(state.tb.length===0)box.append(el('div',{class:'muted small'},'Keine Einträge.'));
  state.tb.forEach((t,i)=>{
    const tag=t.type==='PM'?el('span',{class:'tag good'},'Perfect Match'):t.type==='NM'?el('span',{class:'tag bad'},'No Match'):el('span',{class:'tag neutral'},'Sold');
    const row=el('div',{class:'card row'},el('div',{},`${t.a} × ${t.b}`),tag,el('button',{class:'small',onclick:()=>{state.tb.splice(i,1);renderTBList();}},'Entfernen'));
    box.append(row);
  });
}
function enforceUniqueNight(night){
  const chosen=new Map();
  for(const [a,w]of Object.entries(night.pairs||{})){if(w)chosen.set(w,a);}
  const allowEmpty=Math.max(0,state.A.length-state.B.length);
  let empties=Object.values(night.pairs||{}).filter(v=>!v).length;
  for(const [a,sel]of Object.entries(night.dom.selects)){
    for(const opt of sel.options){
      const val=opt.value;
      if(val===""){
        const isOwnEmpty=!night.pairs[a];
        opt.disabled=(empties>=allowEmpty)&&!isOwnEmpty;
      }else{
        const pickedByOther=chosen.has(val)&&chosen.get(val)!==a;
        opt.disabled=pickedByOther;
      }
    }
  }
}
function renderNights(){
  const box=document.getElementById('nights');box.innerHTML='';
  if(state.nights.length===0)box.append(el('div',{class:'muted small'},'Noch keine Nights.'));
  state.nights.forEach((night,idx)=>{
    const selects={};
    const table=el('table'),thead=el('thead',{},el('tr',{},el('th',{},'A'),el('th',{},'→ B'))),tbody=el('tbody');
    state.A.forEach(a=>{
      const s=el('select',{});const opts=[...state.B,""];optionsFor(s,opts);s.options[s.options.length-1].textContent=NONE_LABEL;
      s.value=night.pairs[a]??"";s.onchange=()=>{night.pairs[a]=s.value;enforceUniqueNight(night);};
      selects[a]=s;tbody.append(el('tr',{},el('td',{},a),el('td',{},s)));
    });
    table.append(thead,tbody);
    const beams=el('input',{type:'number',min:'0',step:'1',value:night.beams??0});
    beams.oninput=()=>night.beams=parseInt(beams.value||'0',10);
    const del=el('button',{class:'danger small',onclick:()=>{state.nights.splice(idx,1);renderNights();}},'Night löschen');
    const card=el('div',{class:'card stack'});
    card.append(el('div',{class:'row'},el('strong',{},`Matching Night ${idx+1}`)),table,el('div',{class:'row'},el('span',{},'Lichter:'),beams,del));
    box.append(card);
    night.dom={selects};enforceUniqueNight(night);
  });
}
function buildConstraints(){/* … Solver-Kern unverändert aus v2-fixed … */}
function solve(){/* … Solver-Berechnung unverändert aus v2-fixed … */}

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('prefill').onclick=()=>renderNames(PREFILL_A,PREFILL_B);
  document.getElementById('addA').onclick=()=>{addPerson('listA','');readNames();};
  document.getElementById('addB').onclick=()=>{addPerson('listB','');readNames();};
  document.getElementById('addTB').onclick=()=>{
    const a=document.getElementById('tbA').value,b=document.getElementById('tbB').value,t=document.getElementById('tbType').value;
    if(!a||!b)return alert('Bitte A und B wählen.');
    state.tb.push({a,b,type:t});renderTBList();
  };
  document.getElementById('addNight').onclick=()=>{
    const night={pairs:{},beams:0};state.A.forEach(a=>night.pairs[a]="");state.nights.push(night);renderNights();
  };
  document.getElementById('solveBtn').onclick=solve;
  renderNames([],[]);renderTBList();renderNights();updateSelectors();warnBalance();
});
