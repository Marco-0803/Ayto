

// Bottom nav + overlay logic
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

function showOverlay(){ const ov=document.getElementById('overlay'); if(ov){ ov.classList.add('show'); } }
function hideOverlay(){ const ov=document.getElementById('overlay'); if(ov){ ov.classList.remove('show'); } }

window.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('solveBtn');
  if(btn){
    btn.onclick = ()=>{
      showOverlay();
      setTimeout(()=>{ try{ if(typeof solve==='function') solve(); } finally { hideOverlay(); } }, 2000);
    };
  }
});

// === Teilnehmer-Verwaltung mit localStorage ===
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
      warn.textContent = `⚠ Ungleichgewicht: ${aCount} A‑Person(en) vs. ${bCount} B‑Person(en).`;
    } else {
      warn.style.display = "none";
    }
  }

  addA.addEventListener("click", () => {
    createPerson(`A${listA.children.length + 1}`, "A");
  });
  addB.addEventListener("click", () => {
    createPerson(`B${listB.children.length + 1}`, "B");
  });

  // Optional: Reset-Button in "Matchingnight"-Sektion leert auch Teilnehmer
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      listA.innerHTML = "";
      listB.innerHTML = "";
      checkBalance();
    });
  }

  // Start mit geladenen Daten
  loadData();
});
// === Matchbox-Logik mit dynamischer Teilnehmer-Verknüpfung ===
window.addEventListener("DOMContentLoaded", () => {
  const tbA = document.getElementById("tbA");
  const tbB = document.getElementById("tbB");
  const tbType = document.getElementById("tbType");
  const tbAdd = document.getElementById("addTB");
  const tbList = document.getElementById("tbList");

  if (!tbA || !tbB || !tbType || !tbAdd || !tbList) return;

  const STORAGE_KEY_TEILNEHMER = "aytoTeilnehmer";
  const STORAGE_KEY_MATCHES = "aytoMatchbox";

  // -------- Teilnehmer abrufen --------
  function getTeilnehmer() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TEILNEHMER);
      if (!raw) return { A: [], B: [] };
      const parsed = JSON.parse(raw);
      return {
        A: Array.isArray(parsed.A) ? parsed.A : [],
        B: Array.isArray(parsed.B) ? parsed.B : []
      };
    } catch (e) {
      console.warn("Fehler beim Lesen der Teilnehmer:", e);
      return { A: [], B: [] };
    }
  }

  // -------- Dropdowns neu befüllen --------
  function refreshDropdowns() {
    const { A, B } = getTeilnehmer();

    tbA.innerHTML = '<option value="">— A auswählen —</option>';
    A.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      tbA.appendChild(opt);
    });

    tbB.innerHTML = '<option value="">— B auswählen —</option>';
    B.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      tbB.appendChild(opt);
    });
  }

  // -------- Matchbox-Einträge laden/speichern --------
  function loadMatches() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_MATCHES)) || [];
    } catch {
      return [];
    }
  }

  function saveMatches(arr) {
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(arr));
  }

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
      const tagClass =
        m.type === "PM" ? "tag good" :
        m.type === "NM" ? "tag bad" :
        "tag neutral";
      const tagText =
        m.type === "PM" ? "Perfect Match" :
        m.type === "NM" ? "No Match" :
        "Sold";
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

  // -------- Eintrag hinzufügen --------
  tbAdd.addEventListener("click", () => {
    const a = tbA.value.trim();
    const b = tbB.value.trim();
    const type = tbType.value;
    if (!a || !b) {
      alert("Bitte A und B auswählen!");
      return;
    }
    const arr = loadMatches();
    if (arr.some(m => m.A === a && m.B === b)) {
      alert("Dieses Paar existiert bereits.");
      return;
    }
    arr.push({ A: a, B: b, type });
    saveMatches(arr);
    renderMatches();
  });

  // -------- Reaktion auf Teilnehmeränderung --------
  const listA = document.getElementById("listA");
  const listB = document.getElementById("listB");
  const observer = new MutationObserver(() => {
    refreshDropdowns();
  });
  if (listA) observer.observe(listA, { childList: true, subtree: true });
  if (listB) observer.observe(listB, { childList: true, subtree: true });

  // -------- Startinitialisierung --------
  refreshDropdowns();
  renderMatches();
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

  // Rendering
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
          ${night.pairs
            .map(p => `<tr><td>${p.A}</td><td>×</td><td>${p.B}</td></tr>`)
            .join("")}
        </table>
      `;

      div.querySelector("button").addEventListener("click", () => {
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
    box.style.maxWidth = "400px";
    box.style.background = "#171a2b";
    box.style.color = "white";
    box.style.padding = "16px";
    box.innerHTML = `<h3>Neue Matching Night</h3>`;

    // Tabelle mit Zuordnungen
    const table = document.createElement("table");
    table.style.width = "100%";
    table.innerHTML = `
      <tr><th>A-Person</th><th></th><th>B-Person</th></tr>
    `;
    A.forEach((a, i) => {
      const tr = document.createElement("tr");
      const sel = document.createElement("select");
      sel.innerHTML =
        '<option value="">— wählen —</option>' +
        B.map(b => `<option value="${b}">${b}</option>`).join("");
      tr.innerHTML = `<td>${a}</td><td>×</td><td></td>`;
      tr.children[2].appendChild(sel);
      table.appendChild(tr);
    });
    box.appendChild(table);

    // Lichter-Auswahl
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

    // Buttons
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

    saveBtn.addEventListener("click", () => {
      const pairs = [];
      const selects = box.querySelectorAll("select");
      selects.forEach((sel, idx) => {
        // Die letzten Selects sind für Lichter, daher filtern
        if (idx < A.length) {
          const value = sel.value;
          if (value) pairs.push({ A: A[idx], B: value });
        }
      });

      if (pairs.length !== A.length) {
        alert("Bitte für jede A-Person eine B-Person wählen!");
        return;
      }

      const lights = parseInt(lightSelect.value, 10);
      const nights = loadNights();
      nights.push({ pairs, lights });
      saveNights(nights);
      overlay.remove();
      renderNights();
    });
  });

  // Initial laden
  renderNights();
});
// === 🕒 Timeline-Seite ("Nights") ===
window.addEventListener("DOMContentLoaded", () => {
  const box = document.getElementById("timelineBox");
  if (!box) return;

  const KEY_MATCHBOX = "aytoMatchbox";
  const KEY_NIGHTS = "aytoMatchingNights";

  function getMatchbox() {
    try { return JSON.parse(localStorage.getItem(KEY_MATCHBOX)) || []; }
    catch { return []; }
  }
  function getNights() {
    try { return JSON.parse(localStorage.getItem(KEY_NIGHTS)) || []; }
    catch { return []; }
  }

  function renderTimeline() {
    const matchbox = getMatchbox();
    const nights = getNights();
    box.innerHTML = "";

    if (matchbox.length === 0 && nights.length === 0) {
      box.innerHTML = "<div class='small muted'>Noch keine Ereignisse vorhanden</div>";
      return;
    }

    // --- Matchbox-Einträge zuerst ---
    if (matchbox.length > 0) {
      const mbHeader = document.createElement("h3");
      mbHeader.textContent = "💞 Matchbox-Entscheidungen";
      box.appendChild(mbHeader);

      matchbox.forEach((m, i) => {
        const div = document.createElement("div");
        div.className = "card stack";
        const emoji = m.type === "PM" ? "✅" : m.type === "NM" ? "❌" : "🟦";
        const txt = m.type === "PM" ? "Perfect Match"
                  : m.type === "NM" ? "No Match" : "Sold";
        div.innerHTML = `<strong>Matchbox ${i + 1}</strong><div>${emoji} ${m.A} × ${m.B} — ${txt}</div>`;
        box.appendChild(div);
      });
    }

    // --- Dann Matching Nights ---
    if (nights.length > 0) {
      const nightHeader = document.createElement("h3");
      nightHeader.textContent = "🌙 Matching Nights";
      box.appendChild(nightHeader);

      nights.forEach((n, i) => {
        const div = document.createElement("div");
        div.className = "card stack";
        div.style.padding = "10px";
        div.innerHTML = `<strong>Night ${i + 1}</strong> – ${n.lights} Lichter`;

        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.fontSize = "13px";
        table.innerHTML = n.pairs
          .map(p => `<tr><td>${p.A}</td><td>×</td><td>${p.B}</td></tr>`)
          .join("");
        div.appendChild(table);

        box.appendChild(div);
      });
    }
  }

  // Seite beim Laden aufbauen
  renderTimeline();

  // Optional: neu rendern, wenn man zur Seite wechselt
  document.querySelectorAll('nav button[data-target="page-nights"]').forEach(btn => {
    btn.addEventListener("click", renderTimeline);
  });
});
// === 🧮 AYTO Smart-Solver (schnell & exakt) ===
window.addEventListener("DOMContentLoaded", () => {
  const solveBtn = document.getElementById("solveBtn");
  const summaryBox = document.getElementById("summary");
  const logsBox = document.getElementById("logs");
  const matrixBox = document.getElementById("matrix");

  if (!solveBtn) return;

  function getTeilnehmer() {
    try { return JSON.parse(localStorage.getItem("aytoTeilnehmer")) || { A: [], B: [] }; }
    catch { return { A: [], B: [] }; }
  }
  function getMatchbox() {
    try { return JSON.parse(localStorage.getItem("aytoMatchbox")) || []; }
    catch { return []; }
  }
  function getNights() {
    try { return JSON.parse(localStorage.getItem("aytoMatchingNights")) || []; }
    catch { return []; }
  }

  async function exportMatrix() {
    const el = document.querySelector(".ayto-table-container");
    if (!el) return alert("Keine Matrix gefunden!");
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#1a1b2b" });
    const link = document.createElement("a");
    link.download = "AYTO-Matrix.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  // ----------------------------------------------------------------
  // Hauptberechnung mit Pruning
  // ----------------------------------------------------------------
  function berechne() {
    const { A, B } = getTeilnehmer();
    const matchbox = getMatchbox();
    const nights = getNights();

    if (!A.length || !B.length) {
      alert("Bitte zuerst Teilnehmer hinzufügen!");
      return;
    }

    summaryBox.innerHTML = "<h3>Berechnung läuft...</h3>";
    logsBox.innerHTML = "";
    matrixBox.innerHTML = "";
    matrixBox.style.display = "block";

    const noMatches = new Set(matchbox.filter(m => m.type === "NM").map(m => `${m.A}-${m.B}`));
    const perfectMatches = matchbox.filter(m => m.type === "PM");

    logsBox.innerHTML += `<div>${A.length}×${B.length} Teilnehmer</div>`;
    logsBox.innerHTML += `<div>${perfectMatches.length} Perfect Matches, ${noMatches.size} No Matches, ${nights.length} Nights</div>`;

    const diff = Math.abs(A.length - B.length);
    if (diff > 0) logsBox.innerHTML += `<div class="warning">⚠ Ungleichgewicht: ${A.length}×${B.length}</div>`;

    // --- Speicher für gültige Kombinationen ---
    const validAssignments = [];
    let tested = 0;

    // --- vorberechnete Night-Checker ---
    function nightValid(partialAssign) {
      for (const n of nights) {
        const correct = n.pairs.filter(p => partialAssign.some(a => a.A === p.A && a.B === p.B)).length;
        if (correct > n.lights) return false; // zu viele Treffer → unzulässig
      }
      return true;
    }

    // --- Rekursive Tiefensuche mit Pruning ---
    function dfs(i, usedB, assign) {
      if (i === A.length || usedB.size === B.length) {
        tested++;
        // Prüfen, ob Nights exakt erfüllt sind
        for (const n of nights) {
          const correct = n.pairs.filter(p => assign.some(a => a.A === p.A && a.B === p.B)).length;
          if (correct !== n.lights) return;
        }
        validAssignments.push(assign.slice());
        return;
      }

      const a = A[i];

      // Wenn mehr Männer als Frauen → evtl. diesen überspringen
      const maySkip = A.length > B.length && (A.length - i > B.length - usedB.size);
      if (maySkip) dfs(i + 1, new Set(usedB), assign);

      for (const b of B) {
        if (usedB.has(b)) continue;
        const pairKey = `${a}-${b}`;

        // sofort ausschließen, wenn No-Match oder falscher Perfect-Match
        if (noMatches.has(pairKey)) continue;
        const pm = perfectMatches.find(p => p.A === a);
        if (pm && pm.B !== b) continue;

        const newAssign = [...assign, { A: a, B: b }];
        if (!nightValid(newAssign)) continue; // früh abbrechen

        const newUsed = new Set(usedB);
        newUsed.add(b);
        dfs(i + 1, newUsed, newAssign);
      }
    }

    dfs(0, new Set(), []);

    // --- Ergebnisse ---
    summaryBox.innerHTML = `
      <h3>Ergebnis</h3>
      <div>${validAssignments.length} gültige Kombination(en) aus ${tested} geprüft</div>
      <button id="exportMatrix" class="primary" style="margin-top:8px">Matrix speichern (PNG)</button>
    `;
    document.getElementById("exportMatrix").onclick = exportMatrix;

    if (!validAssignments.length) {
      matrixBox.innerHTML = "<h3>Keine gültige Kombination!</h3>";
      return;
    }

// --- Häufigkeiten zählen (mit Perfect-Match-Fix) ---
const counts = {};
A.forEach(a => B.forEach(b => counts[`${a}-${b}`] = 0));

for (const assign of validAssignments) {
  for (const p of assign) counts[`${p.A}-${p.B}`]++;
}

// --- Perfect-Matches erzwingen ---
for (const pm of perfectMatches) {
  // Alles außer der echten Kombination auf 0 setzen
  A.forEach(a => counts[`${a}-${pm.B}`] = a === pm.A ? counts[`${a}-${pm.B}`] : 0);
  B.forEach(b => counts[`${pm.A}-${b}`] = b === pm.B ? counts[`${pm.A}-${b}`] : 0);
}

    // --- Matrix generieren ---
    let table = `
      <style>
        .ayto-table-container {overflow-x:auto;margin-top:10px;border-radius:10px;box-shadow:0 0 12px rgba(0,0,0,0.3);}
        .ayto-table {width:100%;border-collapse:collapse;background:rgba(25,27,45,0.9);font-size:13px;}
        .ayto-table th,.ayto-table td {padding:6px 8px;text-align:center;border:1px solid rgba(255,255,255,0.05);}
        .ayto-table th {background:rgba(35,38,60,0.95);color:#eee;font-weight:600;position:sticky;top:0;}
        .ayto-table .a-name {background:rgba(35,38,60,0.9);text-align:left;font-weight:600;color:#ddd;position:sticky;left:0;}
      </style>
      <div class="ayto-table-container">
      <table class="ayto-table">
      <tr><th>A \\ B</th>${B.map(b=>`<th>${b}</th>`).join("")}</tr>`;
    for (const a of A) {
      table += `<tr><td class="a-name">${a}</td>`;
      for (const b of B) {
        const c = counts[`${a}-${b}`];
        const pct = (c / validAssignments.length) * 100;
        const hue = pct === 0 ? 0 : pct === 100 ? 120 : pct * 1.2;
        const bg = `hsl(${hue},75%,${Math.min(25 + pct * 0.3,55)}%)`;
        table += `<td style="background:${bg};color:#fff">${pct.toFixed(0)}%</td>`;
      }
      table += "</tr>";
    }
    table += "</table></div>";
    matrixBox.innerHTML = table;
  }

  solveBtn.addEventListener("click", berechne);
});
