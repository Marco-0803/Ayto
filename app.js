/* === 🌐 Bottom Navigation + Overlay Logic === */
(function(){
  const nav = document.getElementById('nav');
  const pages = document.querySelectorAll('.page');
  if(nav){
    nav.addEventListener('click', (e)=>{
      const btn = e.target.closest('button'); if(!btn) return;
      document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const id = btn.getAttribute('data-target');
      pages.forEach(p=> p.classList.toggle('active', p.id===id));
      window.scrollTo({top:0, behavior:'smooth'});
    });
  }
})();

function showOverlay(){
  const ov=document.getElementById('overlay');
  if(ov){
    ov.classList.add('show');
    const bar = ov.querySelector('.progress .bar');
    if(bar) bar.style.width = "0%";
  }
}
function hideOverlay(){
  const ov=document.getElementById('overlay');
  if(ov) ov.classList.remove('show');
}

/* === 👥 Teilnehmer-Verwaltung === */
window.addEventListener("DOMContentLoaded", () => {
  const listA = document.getElementById("listA");
  const listB = document.getElementById("listB");
  const addA = document.getElementById("addA");
  const addB = document.getElementById("addB");
  const prefill = document.getElementById("prefill");
  const warn = document.getElementById("warnBalance");
  if(!listA || !listB || !addA || !addB) return;

  const STORAGE_KEY = "aytoTeilnehmer";

  function getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { A: [], B: [] };
      const parsed = JSON.parse(raw);
      return { A: Array.isArray(parsed.A)?parsed.A:[], B: Array.isArray(parsed.B)?parsed.B:[] };
    } catch (e) {
      console.warn("localStorage Fehler:", e);
      return { A: [], B: [] };
    }
  }

  function saveData() {
    const A = [...listA.querySelectorAll("input")].map(i=>i.value.trim()).filter(Boolean);
    const B = [...listB.querySelectorAll("input")].map(i=>i.value.trim()).filter(Boolean);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({A,B}));
  }

  function createPerson(name, group, save=true) {
    const div = document.createElement("div");
    div.className = "row";
    div.innerHTML = `
      <input type="text" value="${name}" placeholder="Name eingeben" style="flex:1">
      <button class="danger small" title="Löschen">✖</button>
    `;
    const input = div.querySelector("input");
    input.addEventListener("input", saveData);
    div.querySelector("button").addEventListener("click", ()=>{
      div.remove(); saveData(); checkBalance();
    });
    (group==="A"?listA:listB).appendChild(div);
    if(save) saveData();
    checkBalance();
  }

  function loadData(){
    const data = getData();
    listA.innerHTML = ""; listB.innerHTML = "";
    data.A.forEach(n=>createPerson(n,"A",false));
    data.B.forEach(n=>createPerson(n,"B",false));
    checkBalance();
  }

  function checkBalance(){
    const aCount=listA.children.length, bCount=listB.children.length;
    if(Math.abs(aCount-bCount)>1){
      warn.style.display="block";
      warn.textContent=`⚠ Ungleichgewicht: ${aCount} A-Person(en) vs. ${bCount} B-Person(en).`;
    } else warn.style.display="none";
  }

  addA.addEventListener("click",()=>createPerson(`A${listA.children.length+1}`,"A"));
  addB.addEventListener("click",()=>createPerson(`B${listB.children.length+1}`,"B"));

  // Staffel 2025 vorbelegen
  if(prefill){
    prefill.addEventListener("click", ()=>{
      const A = ["Calvin.O","Calvin.S","Jonny","Kevin","Leandro","Lennert","Nico","Oliver","Rob","Sidar","Xander"];
      const B = ["Antonia","Ariel","Beverly","Viki","Elly","Hati","Henna","Joanna","Nelly","Sandra"];
      localStorage.setItem(STORAGE_KEY, JSON.stringify({A,B}));
      loadData();
      prefill.textContent = "✅ Staffel 2025 geladen";
      prefill.disabled = true;
    });
  }

  const resetBtn=document.getElementById("resetBtn");
  if(resetBtn){
    resetBtn.addEventListener("click",()=>{
      localStorage.removeItem(STORAGE_KEY);
      listA.innerHTML=""; listB.innerHTML="";
      checkBalance();
    });
  }

  loadData();
});

/* === 💞 Matchbox === */
window.addEventListener("DOMContentLoaded",()=>{
  const tbA=document.getElementById("tbA"),
        tbB=document.getElementById("tbB"),
        tbType=document.getElementById("tbType"),
        tbAdd=document.getElementById("addTB"),
        tbList=document.getElementById("tbList");
  if(!tbA||!tbB||!tbType||!tbAdd||!tbList) return;

  const KEY_T="aytoTeilnehmer", KEY_M="aytoMatchbox";
  const getTeilnehmer=()=>JSON.parse(localStorage.getItem(KEY_T)||'{"A":[],"B":[]}');
  const loadM=()=>JSON.parse(localStorage.getItem(KEY_M)||"[]");
  const saveM=a=>localStorage.setItem(KEY_M,JSON.stringify(a));

  function refresh(){
    const {A,B}=getTeilnehmer();
    tbA.innerHTML='<option value="">— A auswählen —</option>';
    tbB.innerHTML='<option value="">— B auswählen —</option>';
    A.forEach(n=>tbA.innerHTML+=`<option>${n}</option>`);
    B.forEach(n=>tbB.innerHTML+=`<option>${n}</option>`);
  }

  function render(){
    const arr=loadM(); tbList.innerHTML="";
    if(!arr.length){tbList.innerHTML="<div class='small muted'>Noch keine Einträge</div>"; return;}
    arr.forEach((m,i)=>{
      const tagClass=m.type==="PM"?"tag good":m.type==="NM"?"tag bad":"tag neutral";
      const tagText=m.type==="PM"?"Perfect Match":m.type==="NM"?"No Match":"Sold";
      const div=document.createElement("div");
      div.className="row";
      div.innerHTML=`<div style="flex:1">${m.A} × ${m.B} <span class="${tagClass}">${tagText}</span></div>
      <button class="danger small">✖</button>`;
      div.querySelector("button").onclick=()=>{
        const a=loadM(); a.splice(i,1); saveM(a); render();
      };
      tbList.appendChild(div);
    });
  }

  tbAdd.onclick=()=>{
    const a=tbA.value.trim(), b=tbB.value.trim(), t=tbType.value;
    if(!a||!b) return alert("Bitte A und B auswählen!");
    const arr=loadM();
    if(arr.some(x=>x.A===a&&x.B===b)) return alert("Dieses Paar existiert bereits!");
    arr.push({A:a,B:b,type:t}); saveM(arr); render();
  };

  const obsA=new MutationObserver(refresh);
  const obsB=new MutationObserver(refresh);
  obsA.observe(document.getElementById("listA"),{childList:true,subtree:true});
  obsB.observe(document.getElementById("listB"),{childList:true,subtree:true});

  refresh(); render();
});
// === 🌙 Matching Nights (komplette Paarungen) ===
window.addEventListener("DOMContentLoaded", () => {
  const addNightBtn = document.getElementById("addNight");
  const nightsList = document.getElementById("nights");
  const STORAGE_KEY_NIGHTS = "aytoMatchingNights";
  const STORAGE_KEY_TEILNEHMER = "aytoTeilnehmer";

  if (!addNightBtn || !nightsList) return;

  // Teilnehmer laden
  function getTeilnehmer() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TEILNEHMER);
      if (!raw) return { A: [], B: [] };
      const parsed = JSON.parse(raw);
      return {
        A: Array.isArray(parsed.A) ? parsed.A : [],
        B: Array.isArray(parsed.B) ? parsed.B : []
      };
    } catch {
      return { A: [], B: [] };
    }
  }

  // Nights laden/speichern
  function loadNights() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_NIGHTS)) || [];
    } catch {
      return [];
    }
  }
  function saveNights(arr) {
    localStorage.setItem(STORAGE_KEY_NIGHTS, JSON.stringify(arr));
  }

  // Rendering der gespeicherten Nights
  function renderNights() {
    const nights = loadNights();
    nightsList.innerHTML = "";

    if (nights.length === 0) {
      nightsList.innerHTML = "<div class='small muted'>Noch keine Matching Night angelegt</div>";
      return;
    }

    nights.forEach((night, i) => {
      const div = document.createElement("div");
      div.className = "card stack";
      div.style.padding = "10px";

      div.innerHTML = `
        <div class="row" style="justify-content:space-between;align-items:center">
          <strong>Night ${i + 1}</strong>
          <button class="danger small">✖</button>
        </div>
        <div class="small muted">Lichter: ${night.lights}</div>
        <table style="width:100%;font-size:13px">
          ${night.pairs.map(p => `<tr><td>${p.A}</td><td>×</td><td>${p.B}</td></tr>`).join("")}
        </table>
      `;

      div.querySelector("button").addEventListener("click", () => {
        const nights = loadNights();
        nights.splice(i, 1);
        saveNights(nights);
        renderNights();
      });

      nightsList.appendChild(div);
    });
  }

  // Neue Night hinzufügen
  addNightBtn.addEventListener("click", () => {
    const { A, B } = getTeilnehmer();
    if (A.length === 0 || B.length === 0) {
      alert("Bitte zuerst Teilnehmer hinzufügen!");
      return;
    }

    // --- Erstelle UI für Auswahl ---
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.85)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "10000";

    const box = document.createElement("div");
    box.className = "card stack";
    box.style.maxWidth = "420px";
    box.style.background = "#171a2b";
    box.style.color = "white";
    box.style.padding = "16px";
    box.innerHTML = `<h3>Neue Matching Night</h3>`;

    // === Tabelle mit Zuordnungen ===
    const table = document.createElement("table");
    table.style.width = "100%";
    table.innerHTML = `<tr><th>A-Person</th><th></th><th>B-Person</th></tr>`;

    // "Keine Partnerin" ist immer erlaubt
    const optionsBase = [
      '<option value="">— wählen —</option>',
      '<option value="keine">Keine Partnerin</option>'
    ];

    const selects = [];
    function updateDropdowns() {
      const used = new Set(
        selects.map(sel => sel.value).filter(v => v && v !== "keine")
      );

      selects.forEach(sel => {
        const current = sel.value;
        sel.innerHTML = optionsBase.concat(
          B.filter(b => !used.has(b) || b === current)
            .map(b => `<option value="${b}">${b}</option>`)
        ).join("");
        sel.value = current;
      });
    }

    A.forEach(a => {
      const tr = document.createElement("tr");
      const sel = document.createElement("select");
      selects.push(sel);
      tr.innerHTML = `<td>${a}</td><td>×</td><td></td>`;
      tr.children[2].appendChild(sel);
      table.appendChild(tr);

      // Initial füllen
      sel.innerHTML = optionsBase.concat(
        B.map(b => `<option value="${b}">${b}</option>`)
      ).join("");

      // Wenn Auswahl geändert → Dropdowns neu aufbauen
      sel.addEventListener("change", updateDropdowns);
    });
    box.appendChild(table);

    // === Lichter-Auswahl ===
    const lightRow = document.createElement("div");
    lightRow.className = "row";
    lightRow.style.marginTop = "10px";
    const lightLabel = document.createElement("label");
    lightLabel.textContent = "Lichter:";
    const lightSelect = document.createElement("select");
    for (let i = 0; i <= Math.min(A.length, B.length); i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = i;
      lightSelect.appendChild(opt);
    }
    lightRow.appendChild(lightLabel);
    lightRow.appendChild(lightSelect);
    box.appendChild(lightRow);

    // === Buttons (Speichern / Abbrechen) ===
    const btnRow = document.createElement("div");
    btnRow.className = "row";
    btnRow.style.marginTop = "12px";
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Speichern";
    saveBtn.className = "primary";
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Abbrechen";
    cancelBtn.className = "ghost";
    btnRow.appendChild(saveBtn);
    btnRow.appendChild(cancelBtn);
    box.appendChild(btnRow);

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    cancelBtn.addEventListener("click", () => overlay.remove());

    // === Speichern der Night ===
    saveBtn.addEventListener("click", () => {
      const pairs = [];
      const selects = box.querySelectorAll("select");
      selects.forEach((sel, idx) => {
        if (idx < A.length) {
          const value = sel.value;
          if (value && value !== "keine") pairs.push({ A: A[idx], B: value });
        }
      });

      const lights = parseInt(lightSelect.value, 10);
      const nights = loadNights();
      nights.push({ pairs, lights });
      saveNights(nights);
      overlay.remove();
      renderNights();
    });
  });

  // Initial aufrufen
  renderNights();
});
/* === 🕒 Timeline === */
window.addEventListener("DOMContentLoaded",()=>{
  const box=document.getElementById("timelineBox"); if(!box) return;
  const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d;}catch{return d;}};
  function render(){
    const mb=get("aytoMatchbox",[]), nights=get("aytoMatchingNights",[]);
    box.innerHTML="";
    if(!mb.length&&!nights.length){box.innerHTML="<div class='small muted'>Noch keine Ereignisse vorhanden</div>";return;}
    if(mb.length){
      box.innerHTML+="<h3>💞 Matchbox-Entscheidungen</h3>";
      mb.forEach((m,i)=>{
        const emoji=m.type==="PM"?"✅":m.type==="NM"?"❌":"🟦";
        const txt=m.type==="PM"?"Perfect Match":m.type==="NM"?"No Match":"Sold";
        box.innerHTML+=`<div class="card stack"><strong>Matchbox ${i+1}</strong><div>${emoji} ${m.A} × ${m.B} — ${txt}</div></div>`;
      });
    }
    if(nights.length){
      box.innerHTML+="<h3>🌙 Matching Nights</h3>";
      nights.forEach((n,i)=>{
        box.innerHTML+=`<div class="card stack"><strong>Night ${i+1}</strong> – ${n.lights} Lichter
        <table style="width:100%;font-size:13px">${n.pairs.map(p=>`<tr><td>${p.A}</td><td>×</td><td>${p.B||"<i>Keine Partnerin</i>"}</td></tr>`).join("")}</table></div>`;
      });
    }
  }
  render();
  document.querySelectorAll('nav button[data-target="page-nights"]').forEach(b=>b.addEventListener("click",render));
});

/* === 📊 Hybrid-Solver: schnell, korrekt, 20 s Timeout & „Keine Partnerin“-Fix === */
window.addEventListener("DOMContentLoaded", () => {
  const solveBtn   = document.getElementById("solveBtn");
  const summaryBox = document.getElementById("summary");
  const matrixBox  = document.getElementById("matrix");
  const logsBox    = document.getElementById("logs");

  if (!solveBtn) return;

  // --- Storage-Reader
  const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
  const getT = () => get("aytoTeilnehmer", { A: [], B: [] });
  const getM = () => get("aytoMatchbox", []);
  const getN = () => get("aytoMatchingNights", []);

  // --- PNG-Export
  async function exportMatrix() {
    const el = document.querySelector(".ayto-table-container");
    if (!el) return alert("Keine Matrix gefunden!");
    if (typeof html2canvas !== "function")
      return alert("html2canvas nicht geladen – Export nicht möglich.");
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#1a1b2b" });
    const a = document.createElement("a");
    a.download = "AYTO-Matrix.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  // --- Overlay / Fortschritt
  const overlayEl = () => document.getElementById("overlay");
  const barEl = () => overlayEl()?.querySelector(".progress .bar");
  const setProgress = (p) => { const b = barEl(); if (b) b.style.width = Math.min(100, p).toFixed(1) + "%"; };

  // === Constraints ===
  function buildConstraints() {
    const { A, B } = getT();
    const M = getM();
    const Nraw = getN();

    if (A.length < 2 || B.length < 2)
      return { ok:false, error:"Bitte mindestens 2 Teilnehmer pro Gruppe anlegen.", A,B };
    if (!(A.length === B.length || A.length === B.length + 1))
      return { ok:false, error:`Unterstützt werden A=B oder A=B+1. Aktuell: ${A.length}×${B.length}.`, A,B };

    const idxA = Object.fromEntries(A.map((n,i)=>[n,i]));
    const idxB = Object.fromEntries(B.map((n,i)=>[n,i]));
    const m = A.length, n = B.length, NONE = n;
    const forced = Array(m).fill(-1);
    const forbidden = Array.from({length:m},()=>new Set());

    // --- Matchbox
    for (const t of M) {
      if (!(t.A in idxA)) continue;
      const ai = idxA[t.A];
      if (t.B in idxB) {
        const bj = idxB[t.B];
        if (t.type === "PM") {
          if (forced[ai] !== -1 && forced[ai] !== bj)
            return { ok:false, error:`Widerspruch in Perfect Matches: ${t.A}×${t.B}`, A,B };
          forced[ai] = bj;
        } else if (t.type === "NM") forbidden[ai].add(bj);
      }
    }

    // --- Matching Nights
    const nights = [];
    for (const nObj of Array.isArray(Nraw)?Nraw:[]) {
      const map = Array(m).fill(NONE);
      let empties = 0;

      for (const a of A) {
        const i = idxA[a];
        const entry = (nObj.pairs || []).find(p => p.A === a);
        const rawB = entry ? (entry.B || "").trim().toLowerCase() : "";

        if (
          rawB === "" ||
          rawB.includes("keine") ||
          rawB.includes("partnerin") ||
          rawB.includes("ohne") ||
          rawB.includes("—") ||
          rawB.includes("-")
        ) {
          map[i] = NONE; empties++;
        } else if (rawB in idxB) {
          map[i] = idxB[rawB];
        } else if (B.some(b => b.toLowerCase() === rawB)) {
          map[i] = idxB[B.find(b => b.toLowerCase() === rawB)];
        } else {
          map[i] = NONE; empties++;
        }
      }

      if (A.length === B.length && empties > 0)
        return { ok:false, error:"In einer Night (A=B) darf niemand ohne Partnerin sein.", A,B };
      if (A.length === B.length + 1 && empties !== 1)
        return { ok:false, error:"In einer Night (A=B+1) muss genau eine Person ohne Partnerin sein.", A,B };

      nights.push({ map, beams: parseInt(nObj.lights||0,10), NONE });
    }

    return { ok:true, A,B,m,n,NONE,forced,forbidden,nights };
  }

// === Solver ===
async function solve() {
  const overlay = document.getElementById('overlay');
  const progressBar = overlay?.querySelector('.bar');
  const progressText = overlay?.querySelector('.overlay-title');
  const summary = document.getElementById('summary');
  const matrix = document.getElementById('matrix');
  const logs = document.getElementById('logs');
  const status = document.getElementById('status');

  summary.innerHTML = '';
  matrix.innerHTML = '';
  logs.innerHTML = '';
  status.textContent = 'Berechnung läuft...';

  overlay?.classList.add('show');
  if (progressBar) progressBar.style.width = '0%';
  if (progressText) progressText.textContent = 'Berechnung läuft... (0%)';

  const startTime = performance.now();
  let progress = 0;
  let total = 0n;
  let tested = 0;
  const MIN_OVERLAY_TIME = 5000; // mind. 5 s sichtbar

  // ---- Teilnehmer & Daten ----
  const { A, B } = JSON.parse(localStorage.getItem("aytoTeilnehmer") || '{"A":[],"B":[]}');
  const M = JSON.parse(localStorage.getItem("aytoMatchbox") || "[]");
  const Nraw = JSON.parse(localStorage.getItem("aytoMatchingNights") || "[]");

  if (A.length < 2 || B.length < 2) {
    overlay?.classList.remove('show');
    alert("Bitte zuerst Teilnehmer hinzufügen!");
    return;
  }

  const PM = M.filter(x => x.type === "PM");
  const NM = new Set(M.filter(x => x.type === "NM").map(x => `${x.A}-${x.B}`));
  const N = Nraw.map(n => ({
    lights: n.lights,
    pairs: (n.pairs || []).filter(p => p.A && p.B)
  })).filter(n => n.pairs.length > 0);

  const counts = {};
  A.forEach(a => B.forEach(b => counts[`${a}-${b}`] = 0));
  const NONE_ALLOWED = A.length === B.length + 1;

  const maxSteps = Math.pow(Math.min(A.length, B.length), 2) * 4;

  // ---- Prüffunktionen ----
  function isValid(assign) {
    for (const nm of NM)
      if (assign.some(p => `${p.A}-${p.B}` === nm)) return false;

    for (const pm of PM)
      if (!assign.some(p => p.A === pm.A && p.B === pm.B)) return false;

    for (const n of N) {
      const correct = n.pairs.filter(p =>
        assign.some(a => a.A === p.A && a.B === p.B)
      ).length;
      if (correct !== n.lights) return false;
    }
    return true;
  }

  // ---- Rekursive Suche ----
  function dfs(i, used, cur) {
    if (i === A.length) {
      tested++;
      if (isValid(cur)) {
        total++;
        cur.forEach(p => counts[`${p.A}-${p.B}`]++);
      }
      return;
    }
    for (let j = 0; j < B.length; j++) {
      if (used.has(j)) continue;
      const a = A[i], b = B[j];
      if (NM.has(`${a}-${b}`)) continue;
      const pm = PM.find(p => p.A === a);
      if (pm && pm.B !== b) continue;
      used.add(j);
      cur.push({ A: a, B: b });
      dfs(i + 1, used, cur);
      cur.pop();
      used.delete(j);
    }
    if (NONE_ALLOWED) dfs(i + 1, used, cur);
  }

  // ---- Fortschrittssimulation ----
  const fakeProgress = setInterval(() => {
    progress = Math.min(progress + 3, 90);
    if (progressBar) progressBar.style.width = progress + '%';
    if (progressText) progressText.textContent = `Berechnung läuft... (${progress}%)`;
  }, 250);

  // ---- Berechnung starten ----
  dfs(0, new Set(), []);
  clearInterval(fakeProgress);
  if (progressBar) progressBar.style.width = '100%';
  if (progressText) progressText.textContent = 'Berechnung abgeschlossen (100%)';

  const elapsed = performance.now() - startTime;
  const remaining = Math.max(0, MIN_OVERLAY_TIME - elapsed);
  await new Promise(r => setTimeout(r, remaining));
  overlay?.classList.remove('show');

  // ---- Ergebnisse ----
  if (!total) {
    matrix.innerHTML = "<h3>Keine gültige Kombination gefunden!</h3>";
    status.textContent = "Keine Lösung";
    return;
  }

  status.textContent = "Fertig";
  summary.innerHTML = `
    <h3>Ergebnis</h3>
    <div>${A.length}×${B.length} Teilnehmer</div>
    <div>${total} gültige Kombinationen (${tested} geprüft)</div>
  `;

  let html = `<div class="ayto-table-container"><table class="ayto-table"><tr><th>A\\B</th>${B.map(b => `<th>${b}</th>`).join("")}</tr>`;
  A.forEach(a => {
    html += `<tr><td><b>${a}</b></td>`;
    B.forEach(b => {
      let pct = Number(counts[`${a}-${b}`] * 100n / total);
      if (PM.some(pm => pm.A === a && pm.B === b)) pct = 100;
      if (NM.has(`${a}-${b}`)) pct = 0;
      const hue = pct === 0 ? 0 : pct === 100 ? 120 : pct * 1.2;
      const bg = `hsl(${hue},75%,${Math.min(25 + pct * 0.3, 55)}%)`;
      html += `<td style="text-align:center;background:${bg};color:#fff">${pct.toFixed(0)}%</td>`;
    });
    html += "</tr>";
  });
  html += "</table></div>";

  matrix.innerHTML = html;
  matrix.style.display = "block";
}

solveBtn.onclick = solve;
});
