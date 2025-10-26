// ============================================================
// AYTO Solver 2025 – Debug Version
// Zeigt JavaScript-Fehler direkt auf der Seite in einer roten Box
// ============================================================

// --- Fehleranzeige einfügen ---
(function() {
  const box = document.createElement('div');
  box.id = 'debugBox';
  box.style.position = 'fixed';
  box.style.top = '0';
  box.style.left = '0';
  box.style.width = '100%';
  box.style.background = '#ff3b30';
  box.style.color = 'white';
  box.style.fontFamily = 'monospace';
  box.style.fontSize = '13px';
  box.style.padding = '8px 12px';
  box.style.zIndex = '99999';
  box.style.display = 'none';
  document.body.appendChild(box);

  const showError = msg => {
    box.style.display = 'block';
    box.textContent = '⚠️ ' + msg;
  };

  window.addEventListener('error', e => showError(`${e.message} @ ${e.filename}:${e.lineno}`));
  window.addEventListener('unhandledrejection', e => showError(`Promise-Fehler: ${e.reason}`));
})();

// ============================================================
// Hauptlogik
// ============================================================

console.log("✅ app.js geladen und gestartet");

window.addEventListener('DOMContentLoaded', () => {
  console.log("📦 DOM geladen – Initialisiere App");

  const addA = document.getElementById('addA');
  const addB = document.getElementById('addB');
  const prefill = document.getElementById('prefill');

  // Test: Buttons gefunden?
  console.log("🔍 Buttons:", { addA, addB, prefill });

  function addPerson(groupId) {
    const container = document.getElementById(groupId);
    if (!container) {
      console.error("❌ Container nicht gefunden:", groupId);
      return;
    }
    const row = document.createElement('div');
    row.className = 'row';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = groupId === 'listA' ? 'Name (A)' : 'Name (B)';
    const btn = document.createElement('button');
    btn.textContent = 'Entfernen';
    btn.className = 'danger';
    btn.onclick = () => row.remove();
    row.append(input, btn);
    container.appendChild(row);
    console.log(`👤 Neue Person in ${groupId}`);
  }

  if (addA) addA.onclick = () => addPerson('listA');
  if (addB) addB.onclick = () => addPerson('listB');

  if (prefill) prefill.onclick = () => {
    console.log("📋 Staffel 2025 vorbelegen");
    const namesA = ["Calvin O.","Calvin S.","Jonny","Kevin Njie","Lennert","Nico","Olli","Rob","Sidar","Xander","Leandro"];
    const namesB = ["Antonia","Ariel","Beverly","Elli","Hati","Henna","Joanna","Nelly","Sandra Janina","Viki"];
    const listA = document.getElementById('listA');
    const listB = document.getElementById('listB');
    listA.innerHTML = "";
    listB.innerHTML = "";
    namesA.forEach(n => {
      const inp = document.createElement('input');
      inp.type = 'text'; inp.value = n;
      listA.appendChild(inp);
    });
    namesB.forEach(n => {
      const inp = document.createElement('input');
      inp.type = 'text'; inp.value = n;
      listB.appendChild(inp);
    });
  };

  // Solver-Button
  const solveBtn = document.getElementById('solveBtn');
  if (solveBtn) {
    solveBtn.onclick = () => {
      console.log("⚙️ Solver gestartet");
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.background = 'rgba(0,0,0,0.6)';
      overlay.style.color = '#fff';
      overlay.style.fontSize = '20px';
      overlay.style.zIndex = '9999';
      overlay.textContent = 'Berechnung läuft...';
      document.body.appendChild(overlay);

      setTimeout(() => {
        overlay.textContent = '✅ Fertig!';
        setTimeout(() => overlay.remove(), 1200);
      }, 2000);
    };
  }

  // Bottom Navigation
  const nav = document.getElementById('nav');
  if (nav) {
    nav.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      console.log("🔘 Bottom Button geklickt:", btn.dataset.target);
      document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const id = btn.getAttribute('data-target');
      document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === id));
    });
  } else {
    console.warn("⚠️ Keine Bottom-Navigation gefunden");
  }

  console.log("✅ App vollständig initialisiert");
});

