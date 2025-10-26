

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
