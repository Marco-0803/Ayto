

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
// === Matchbox-Logik mit Speicherung ===
window.addEventListener("DOMContentLoaded", () => {
  const tbA = document.getElementById("tbA");
  const tbB = document.getElementById("tbB");
  const tbType = document.getElementById("tbType");
  const tbAdd = document.getElementById("addTB");
  const tbList = document.getElementById("tbList");

  const STORAGE_KEY_MATCHES = "aytoMatchbox";
  const STORAGE_KEY_TEILNEHMER = "aytoTeilnehmer";

  if (!tbA || !tbB || !tbType || !tbAdd || !tbList) return;

  // ------------------- Hilfsfunktionen -------------------
  function loadMatches() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_MATCHES)) || [];
    } catch {
      return [];
    }
  }

  function saveMatches(matches) {
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(matches));
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
        matches.splice(i, 1);
        saveMatches(matches);
        renderMatches();
      });
      tbList.appendChild(div);
    });
  }

  // ------------------- Dropdown aktualisieren -------------------
  function getTeilnehmer() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_TEILNEHMER)) || { A: [], B: [] };
    } catch {
      return { A: [], B: [] };
    }
  }

  function refreshDropdowns() {
    const data = getTeilnehmer();
    tbA.innerHTML = "";
    tbB.innerHTML = "";

    const optA0 = document.createElement("option");
    optA0.value = "";
    optA0.textContent = "— A auswählen —";
    tbA.appendChild(optA0);
    data.A.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      tbA.appendChild(opt);
    });

    const optB0 = document.createElement("option");
    optB0.value = "";
    optB0.textContent = "— B auswählen —";
    tbB.appendChild(optB0);
    data.B.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      tbB.appendChild(opt);
    });
  }

  // Änderungen an Teilnehmern beobachten (im selben Tab)
  const listA = document.getElementById("listA");
  const listB = document.getElementById("listB");
  const observer = new MutationObserver(refreshDropdowns);
  if (listA && listB) {
    observer.observe(listA, { childList: true, subtree: true });
    observer.observe(listB, { childList: true, subtree: true });
  }

  // ------------------- Hinzufügen -------------------
  tbAdd.addEventListener("click", () => {
    const a = tbA.value;
    const b = tbB.value;
    const type = tbType.value;

    if (!a || !b) {
      alert("Bitte A und B auswählen!");
      return;
    }

    const matches = loadMatches();

    // Doppel vermeiden
    if (matches.some(m => m.A === a && m.B === b)) {
      alert("Dieses Paar existiert bereits.");
      return;
    }

    matches.push({ A: a, B: b, type });
    saveMatches(matches);
    renderMatches();
  });

  // ------------------- Initial laden -------------------
  refreshDropdowns();
  renderMatches();
});
