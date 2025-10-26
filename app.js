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

/* === 🌙 Matching Nights === */
window.addEventListener("DOMContentLoaded",()=>{
  const addNight=document.getElementById("addNight"),
        nightsList=document.getElementById("nights");
  if(!addNight||!nightsList) return;

  const KEY_N="aytoMatchingNights", KEY_T="aytoTeilnehmer";
  const getTeilnehmer=()=>JSON.parse(localStorage.getItem(KEY_T)||'{"A":[],"B":[]}');
  const loadN=()=>JSON.parse(localStorage.getItem(KEY_N)||"[]");
  const saveN=a=>localStorage.setItem(KEY_N,JSON.stringify(a));

  function render(){
    const nights=loadN(); nightsList.innerHTML="";
    if(!nights.length){nightsList.innerHTML="<div class='small muted'>Noch keine Matching Night angelegt</div>"; return;}
    nights.forEach((n,i)=>{
      const div=document.createElement("div");
      div.className="card stack"; div.style.padding="10px";
      div.innerHTML=`<div class="row" style="justify-content:space-between;align-items:center">
        <strong>Night ${i+1}</strong><button class="danger small">✖</button></div>
        <div class="small muted">Lichter: ${n.lights}</div>
        <table style="width:100%;font-size:13px">${n.pairs.map(p=>`<tr><td>${p.A}</td><td>×</td><td>${p.B||"<i>Keine Partnerin</i>"}</td></tr>`).join("")}</table>`;
      div.querySelector("button").onclick=()=>{const arr=loadN();arr.splice(i,1);saveN(arr);render();};
      nightsList.appendChild(div);
    });
  }

  addNight.onclick=()=>{
    const {A,B}=getTeilnehmer();
    if(!A.length||!B.length) return alert("Bitte zuerst Teilnehmer hinzufügen!");
    const overlay=document.createElement("div");
    overlay.style=`
      position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;`;
    const box=document.createElement("div");
    box.className="card stack"; box.style.maxWidth="400px"; box.style.background="#171a2b"; box.style.color="white"; box.style.padding="16px";
    box.innerHTML="<h3>Neue Matching Night</h3>";

    const table=document.createElement("table"); table.style.width="100%";
    table.innerHTML="<tr><th>A-Person</th><th></th><th>B-Person</th></tr>";
    A.forEach(a=>{
      const tr=document.createElement("tr");
      const sel=document.createElement("select");
      sel.innerHTML='<option value="">Keine Partnerin</option>'+B.map(b=>`<option value="${b}">${b}</option>`).join("");
      tr.innerHTML=`<td>${a}</td><td>×</td><td></td>`; tr.children[2].appendChild(sel);
      table.appendChild(tr);
    });
    box.appendChild(table);

    const lightRow=document.createElement("div");
    lightRow.className="row"; lightRow.style.marginTop="10px";
    const lightLabel=document.createElement("label"); lightLabel.textContent="Lichter:";
    const lightSelect=document.createElement("select");
    for(let i=0;i<=Math.min(A.length,B.length);i++){
      const opt=document.createElement("option"); opt.value=i; opt.textContent=i; lightSelect.appendChild(opt);
    }
    lightRow.appendChild(lightLabel); lightRow.appendChild(lightSelect); box.appendChild(lightRow);

    const btnRow=document.createElement("div"); btnRow.className="row"; btnRow.style.marginTop="12px";
    const saveBtn=document.createElement("button"); saveBtn.textContent="Speichern"; saveBtn.className="primary";
    const cancelBtn=document.createElement("button"); cancelBtn.textContent="Abbrechen"; cancelBtn.className="ghost";
    btnRow.append(saveBtn,cancelBtn); box.appendChild(btnRow);
    overlay.appendChild(box); document.body.appendChild(overlay);
    cancelBtn.onclick=()=>overlay.remove();

    saveBtn.onclick=()=>{
      const selects=box.querySelectorAll("select");
      const pairs=A.map((a,i)=>({A:a,B:selects[i].value||null}));
      const lights=parseInt(lightSelect.value,10);
      const arr=loadN(); arr.push({pairs,lights}); saveN(arr); overlay.remove(); render();
    };
  };

  render();
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

/* === 📊 Solver mit stabiler Eingabeprüfung & korrekten Prozentwerten === */
window.addEventListener("DOMContentLoaded", () => {
  const solveBtn = document.getElementById("solveBtn"),
        summary = document.getElementById("summary"),
        matrix = document.getElementById("matrix");

  if (!solveBtn) return;

  const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
  const getT = () => get("aytoTeilnehmer", { A: [], B: [] });
  const getM = () => get("aytoMatchbox", []);
  const getN = () => get("aytoMatchingNights", []);

  async function exportMatrix() {
    const el = document.querySelector(".ayto-table-container");
    if (!el) return alert("Keine Matrix gefunden!");
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#1a1b2b" });
    const a = document.createElement("a");
    a.download = "AYTO-Matrix.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  async function berechne() {
    const overlay = document.getElementById("overlay");
    const progressBar = overlay?.querySelector(".progress .bar");
    if (progressBar) progressBar.style.width = "0%";
    showOverlay();

    const { A, B } = getT();
    const M = getM();
    const Nraw = getN();

    // 🧠 Sicherheitsprüfungen
    if (A.length < 2 || B.length < 2) {
      hideOverlay();
      return alert("Bitte mindestens 2 Teilnehmer pro Gruppe eingeben!");
    }

    const N = Nraw.map(n => ({
      lights: n.lights,
      pairs: (n.pairs || []).filter(p => p.B && p.A)
    })).filter(n => n.pairs.length > 0);

    const PM = M.filter(x => x.type === "PM");
    const NM = new Set(M.filter(x => x.type === "NM").map(x => `${x.A}-${x.B}`));

    summary.innerHTML = "<h3>Berechnung läuft...</h3>";
    matrix.innerHTML = "";

    const counts = {};
    A.forEach(a => B.forEach(b => counts[`${a}-${b}`] = 0));
    let total = 0, tested = 0;

    const maxIter = Math.pow(Math.min(A.length, B.length), 2) * 2;
    const updateProgress = (c, m) => {
      if (!progressBar) return;
      const pct = Math.min(100, (c / m) * 100);
      progressBar.style.width = pct.toFixed(1) + "%";
    };

    const start = performance.now();

    function isValid(assign) {
      // Keine "No Matches"
      for (const nm of NM)
        if (assign.some(p => `${p.A}-${p.B}` === nm)) return false;
      // Perfect Matches müssen exakt stimmen
      for (const pm of PM)
        if (!assign.some(p => p.A === pm.A && p.B === pm.B)) return false;
      // Nights prüfen
      for (const n of N) {
        const correct = n.pairs.filter(p =>
          assign.some(a => a.A === p.A && a.B === p.B)
        ).length;
        if (correct !== n.lights) return false;
      }
      return true;
    }

    function dfs(i, used, cur) {
      tested++;
      if (tested % 50 === 0) updateProgress(tested, maxIter);
      if (i === A.length) {
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
        used.add(j); cur.push({ A: a, B: b });
        dfs(i + 1, used, cur);
        cur.pop(); used.delete(j);
      }
      // Wenn mehr A als B → einer bleibt ohne Partnerin
      if (A.length > B.length) dfs(i + 1, used, cur);
    }

    try {
      dfs(0, new Set(), []);
    } catch (err) {
      hideOverlay();
      return alert("Fehler in der Berechnung: " + err.message);
    }

    updateProgress(1, 1);
    const dur = ((performance.now() - start) / 1000).toFixed(2);

    // 🧮 Ergebnis anzeigen
    summary.innerHTML = `
      <h3>Ergebnis</h3>
      <div>${A.length}×${B.length} Teilnehmer</div>
      <div>${total} gültige Kombinationen (${tested} geprüft, ${dur}s)</div>
      <button id="exportMatrix" class="primary" style="margin-top:8px">Matrix speichern (PNG)</button>
    `;
    document.getElementById("exportMatrix").onclick = exportMatrix;

    if (!total) {
      matrix.innerHTML = "<h3>Keine gültige Kombination gefunden!</h3>";
      hideOverlay();
      return;
    }

    // Matrix-Tabelle erzeugen
    let html = `<div class="ayto-table-container"><table class="ayto-table"><tr><th>A\\B</th>${B.map(b => `<th>${b}</th>`).join("")}</tr>`;
    A.forEach(a => {
      html += `<tr><td class="a-name">${a}</td>`;
      B.forEach(b => {
        let pct = (counts[`${a}-${b}`] / total) * 100;
        // Korrektur: Perfect Matches = 100%, No Matches = 0%
        if (PM.some(pm => pm.A === a && pm.B === b)) pct = 100;
        if (NM.has(`${a}-${b}`)) pct = 0;
        const hue = pct === 0 ? 0 : pct === 100 ? 120 : pct * 1.2;
        const bg = `hsl(${hue},75%,${Math.min(25 + pct * 0.3, 55)}%)`;
        html += `<td style="background:${bg};color:#fff">${pct.toFixed(0)}%</td>`;
      });
      html += "</tr>";
    });
    html += "</table></div>";
    matrix.innerHTML = html;

    hideOverlay();
  }

  solveBtn.onclick = berechne;
});
