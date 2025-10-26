// === 📱 Bottom Navigation + Overlay ===
(function(){
  const nav = document.getElementById('nav');
  const pages = document.querySelectorAll('.page');
  if(nav){
    nav.addEventListener('click', (e)=>{
      const btn = e.target.closest('button');
      if(!btn) return;
      document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const id = btn.getAttribute('data-target');
      pages.forEach(p=> p.classList.toggle('active', p.id===id));
      window.scrollTo({top:0, behavior:'smooth'});
    });
  }
})();

function showOverlay(){ const ov=document.getElementById('overlay'); if(ov) ov.classList.add('show'); }
function hideOverlay(){ const ov=document.getElementById('overlay'); if(ov) ov.classList.remove('show'); }

window.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('solveBtn');
  if(btn){
    btn.onclick = ()=>{
      showOverlay();
      setTimeout(()=>{ try{ if(typeof berechne==='function') berechne(); } finally { hideOverlay(); } }, 1000);
    };
  }
});

// === 👥 Teilnehmer-Verwaltung ===
window.addEventListener("DOMContentLoaded", () => {
  const listA = document.getElementById("listA");
  const listB = document.getElementById("listB");
  const addA = document.getElementById("addA");
  const addB = document.getElementById("addB");
  const warn = document.getElementById("warnBalance");
  if(!listA || !listB || !addA || !addB) return;

  const STORAGE_KEY = "aytoTeilnehmer";

  function getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { A: [], B: [] };
      const parsed = JSON.parse(raw);
      return { A: Array.isArray(parsed.A) ? parsed.A : [], B: Array.isArray(parsed.B) ? parsed.B : [] };
    } catch (e) {
      console.warn("Konnte localStorage nicht lesen:", e);
      return { A: [], B: [] };
    }
  }

  function saveData() {
    const A = [...listA.querySelectorAll("input")].map(i => i.value.trim()).filter(Boolean);
    const B = [...listB.querySelectorAll("input")].map(i => i.value.trim()).filter(Boolean);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ A, B }));
  }

  function createPerson(name, group, save = true) {
    const div = document.createElement("div");
    div.className = "row";
    div.innerHTML = `
      <input type="text" value="${name}" placeholder="Name eingeben" style="flex:1">
      <button class="danger small" title="Löschen">✖</button>
    `;
    const input = div.querySelector("input");
    input.addEventListener("input", saveData);
    div.querySelector("button").addEventListener("click", () => {
      div.remove();
      saveData();
      checkBalance();
    });
    (group === "A" ? listA : listB).appendChild(div);
    if (save) saveData();
    checkBalance();
  }

  function loadData() {
    const data = getData();
    listA.innerHTML = "";
    listB.innerHTML = "";
    data.A.forEach(n => createPerson(n, "A", false));
    data.B.forEach(n => createPerson(n, "B", false));
    checkBalance();
  }

  function checkBalance() {
    const aCount = listA.children.length;
    const bCount = listB.children.length;
    if (Math.abs(aCount - bCount) > 1) {
      warn.style.display = "block";
      warn.textContent = `⚠ Ungleichgewicht: ${aCount} A-Person(en) vs. ${bCount} B-Person(en).`;
    } else {
      warn.style.display = "none";
    }
  }

  addA.addEventListener("click", () => createPerson(`A${listA.children.length + 1}`, "A"));
  addB.addEventListener("click", () => createPerson(`B${listB.children.length + 1}`, "B"));

  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      listA.innerHTML = "";
      listB.innerHTML = "";
      checkBalance();
    });
  }

  loadData();
});

// === 💞 Matchbox-Logik ===
window.addEventListener("DOMContentLoaded", () => {
  const tbA = document.getElementById("tbA");
  const tbB = document.getElementById("tbB");
  const tbType = document.getElementById("tbType");
  const tbAdd = document.getElementById("addTB");
  const tbList = document.getElementById("tbList");
  if (!tbA || !tbB || !tbType || !tbAdd || !tbList) return;

  const KEY_MATCHES = "aytoMatchbox";
  const KEY_TEILNEHMER = "aytoTeilnehmer";

  function getTeilnehmer() {
    try {
      const raw = localStorage.getItem(KEY_TEILNEHMER);
      if (!raw) return { A: [], B: [] };
      const parsed = JSON.parse(raw);
      return parsed;
    } catch {
      return { A: [], B: [] };
    }
  }

  function loadMatches() {
    try { return JSON.parse(localStorage.getItem(KEY_MATCHES)) || []; }
    catch { return []; }
  }
  function saveMatches(arr) { localStorage.setItem(KEY_MATCHES, JSON.stringify(arr)); }

  function renderMatches() {
    const matches = loadMatches();
    tbList.innerHTML = "";
    if (matches.length === 0) {
      tbList.innerHTML = "<div class='small muted'>Noch keine Einträge</div>";
      return;
    }
    matches.forEach((m, i) => {
      const div = document.createElement("div");
      div.className = "row";
      const tagClass = m.type === "PM" ? "tag good" : m.type === "NM" ? "tag bad" : "tag neutral";
      const tagText = m.type === "PM" ? "Perfect Match" : m.type === "NM" ? "No Match" : "Sold";
      div.innerHTML = `
        <div style="flex:1">${m.A} × ${m.B} <span class="${tagClass}">${tagText}</span></div>
        <button class="danger small">✖</button>
      `;
      div.querySelector("button").addEventListener("click", () => {
        const arr = loadMatches();
        arr.splice(i, 1);
        saveMatches(arr);
        renderMatches();
      });
      tbList.appendChild(div);
    });
  }

  tbAdd.addEventListener("click", () => {
    const a = tbA.value.trim();
    const b = tbB.value.trim();
    const type = tbType.value;
    if (!a || !b) return alert("Bitte A und B auswählen!");
    const arr = loadMatches();
    if (arr.some(m => m.A === a && m.B === b)) return alert("Dieses Paar existiert bereits.");
    arr.push({ A: a, B: b, type });
    saveMatches(arr);
    renderMatches();
  });

  function refreshDropdowns() {
    const { A, B } = getTeilnehmer();
    tbA.innerHTML = '<option value="">— A auswählen —</option>';
    A.forEach(n => tbA.insertAdjacentHTML("beforeend", `<option>${n}</option>`));
    tbB.innerHTML = '<option value="">— B auswählen —</option>';
    B.forEach(n => tbB.insertAdjacentHTML("beforeend", `<option>${n}</option>`));
  }

  const listA = document.getElementById("listA");
  const listB = document.getElementById("listB");
  const obs = new MutationObserver(refreshDropdowns);
  if (listA) obs.observe(listA, { childList: true });
  if (listB) obs.observe(listB, { childList: true });

  refreshDropdowns();
  renderMatches();
});

// === 🌙 Matching Nights ===
window.addEventListener("DOMContentLoaded", () => {
  const addNightBtn = document.getElementById("addNight");
  const nightsList = document.getElementById("nights");
  if (!addNightBtn || !nightsList) return;
  const KEY_NIGHTS = "aytoMatchingNights";
  const KEY_TEILNEHMER = "aytoTeilnehmer";

  function getTeilnehmer() {
    try { return JSON.parse(localStorage.getItem(KEY_TEILNEHMER)) || {A:[],B:[]}; }
    catch { return {A:[],B:[]}; }
  }
  function loadNights() { try { return JSON.parse(localStorage.getItem(KEY_NIGHTS)) || []; } catch { return []; } }
  function saveNights(arr){ localStorage.setItem(KEY_NIGHTS, JSON.stringify(arr)); }

  function renderNights(){
    const nights = loadNights();
    nightsList.innerHTML = "";
    if(nights.length===0){
      nightsList.innerHTML = "<div class='small muted'>Noch keine Matching Night angelegt</div>";
      return;
    }
    nights.forEach((n,i)=>{
      const div = document.createElement("div");
      div.className = "card stack";
      div.innerHTML = `<strong>Night ${i+1}</strong> – ${n.lights} Lichter<table>${n.pairs.map(p=>`<tr><td>${p.A}</td><td>×</td><td>${p.B}</td></tr>`).join("")}</table><button class='danger small'>✖</button>`;
      div.querySelector("button").addEventListener("click",()=>{ nights.splice(i,1); saveNights(nights); renderNights(); });
      nightsList.appendChild(div);
    });
  }

  addNightBtn.addEventListener("click",()=>{
    const {A,B}=getTeilnehmer();
    if(!A.length||!B.length) return alert("Bitte zuerst Teilnehmer hinzufügen!");

    const pairs=[];
    A.forEach((a,i)=> pairs.push({A:a,B:B[i%B.length]}));
    const lights = prompt("Wie viele Lichter?");
    const arr=loadNights(); arr.push({pairs,lights:parseInt(lights||0)});
    saveNights(arr); renderNights();
  });

  renderNights();
});

// === 🕒 Timeline ===
window.addEventListener("DOMContentLoaded",()=>{
  const box=document.getElementById("timelineBox");
  if(!box)return;
  const MB="aytoMatchbox",N="aytoMatchingNights";
  function g(k){try{return JSON.parse(localStorage.getItem(k))||[]}catch{return[]}}
  function render(){
    const m=g(MB),n=g(N);
    box.innerHTML="";
    if(!m.length&&!n.length){box.innerHTML="<div class='small muted'>Keine Ereignisse</div>";return;}
    if(m.length){box.innerHTML+="<h3>💞 Matchbox</h3>"+m.map((x,i)=>`<div>${x.A} × ${x.B} (${x.type})</div>`).join("")}
    if(n.length){box.innerHTML+="<h3>🌙 Nights</h3>"+n.map((x,i)=>`<div>Night ${i+1}: ${x.lights} Lichter</div>`).join("")}
  }
  render();
});

// === 🧮 Solver mit stylischer Matrix ===
window.addEventListener("DOMContentLoaded",()=>{
  const solveBtn=document.getElementById("solveBtn");
  const summaryBox=document.getElementById("summary");
  const logsBox=document.getElementById("logs");
  const matrixBox=document.getElementById("matrix");
  if(!solveBtn)return;

  function factorial(n){return n<=1?1:n*factorial(n-1);}

  function berechne(){
    const {A,B}=JSON.parse(localStorage.getItem("aytoTeilnehmer"))||{A:[],B:[]};
    const matchbox=JSON.parse(localStorage.getItem("aytoMatchbox"))||[];
    const nights=JSON.parse(localStorage.getItem("aytoMatchingNights"))||[];
    if(!A.length||!B.length)return alert("Bitte zuerst Teilnehmer hinzufügen!");

    summaryBox.innerHTML="<h3>Berechnung läuft...</h3>";
    logsBox.innerHTML=""; matrixBox.innerHTML="";

    const noMatches=new Set(matchbox.filter(m=>m.type==="NM").map(m=>`${m.A}-${m.B}`));
    const perfectMatches=matchbox.filter(m=>m.type==="PM");

    logsBox.innerHTML+=`<div>${A.length}×${B.length} Teilnehmer</div>`;
    logsBox.innerHTML+=`<div>${perfectMatches.length} PM, ${noMatches.size} NM, ${nights.length} Nights</div>`;

    function* permute(arr){
      if(arr.length<=1)yield arr;
      else for(let i=0;i<arr.length;i++){
        const rest=arr.slice(0,i).concat(arr.slice(i+1));
        for(const p of permute(rest))yield [arr[i],...p];
      }
    }

    function isValid(assign){
      for(const nm of noMatches)if(assign.some(p=>`${p.A}-${p.B}`===nm))return false;
      for(const pm of perfectMatches)if(assign.some(p=>p.A===pm.A&&p.B!==pm.B))return false;
      for(const n of nights){
        const correct=n.pairs.filter(p=>assign.some(a=>a.A===p.A&&a.B===p.B)).length;
        if(correct!==n.lights)return false;
      }
      return true;
    }

    const valid=[],total=factorial(B.length);let tested=0;
    for(const perm of permute(B)){
      tested++;
      const assign=A.map((a,i)=>({A:a,B:perm[i]}));
      if(isValid(assign))valid.push(assign);
    }

    logsBox.innerHTML+=`<div>Geprüft: ${tested}</div><div>Gültig: ${valid.length}</div>`;
    if(!valid.length)return summaryBox.innerHTML="<h3>Keine gültige Kombination!</h3>";

    const counts={};A.forEach(a=>B.forEach(b=>counts[`${a}-${b}`]=0));
    valid.forEach(v=>v.forEach(p=>counts[`${p.A}-${p.B}`]++));

    let table=`
<style>
  .ayto-table-container{overflow-x:auto;margin-top:10px;border-radius:10px;box-shadow:0 0 12px rgba(0,0,0,.3);}
  .ayto-table{width:100%;min-width:600px;border-collapse:collapse;background:#191b2d;font-size:13px;}
  .ayto-table th,.ayto-table td{padding:8px 10px;text-align:center;border:1px solid rgba(255,255,255,.05);}
  .ayto-table th{background:#23263c;color:#eee;position:sticky;top:0;}
  .ayto-table .a-name{background:#23263c;text-align:left;position:sticky;left:0;}
  .ayto-tooltip{visibility:hidden;position:absolute;background:rgba(0,0,0,.85);color:#fff;border-radius:6px;padding:4px 8px;font-size:12px;bottom:120%;left:50%;transform:translateX(-50%);opacity:0;transition:opacity .3s;}
  td:hover .ayto-tooltip{visibility:visible;opacity:1;}
</style>
<div class="ayto-table-container"><table class="ayto-table"><tr><th>A \\ B</th>${B.map(b=>`<th>${b}</th>`).join("")}</tr>`;
    A.forEach(a=>{
      table+=`<tr><td class="a-name">${a}</td>`;
      B.forEach(b=>{
        const c=counts[`${a}-${b}`];
        const pct=(c/valid.length)*100;
        const hue=pct===0?0:pct===100?120:pct*1.2;
        const bg=`hsl(${hue},75%,${Math.min(25+pct*.3,55)}%)`;
        table+=`<td style="background:${bg};color:white;position:relative">${pct.toFixed(0)}%
          <div class="ayto-tooltip">${pct.toFixed(2)}% (${c}/${valid.length})</div></td>`;
      });
      table+="</tr>";
    });
    table+="</table></div>";
    matrixBox.innerHTML=table;

    summaryBox.innerHTML=`<h3>Ergebnis</h3><div>Gültige Kombinationen: ${valid.length}</div><div>Geprüft: ${tested}</div>`;
  }

  solveBtn.addEventListener("click", berechne);
});
