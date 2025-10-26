

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

  // --- LocalStorage Schlüssel ---
  const STORAGE_KEY = "aytoTeilnehmer";

  // --- Teilnehmer laden ---
  function loadData() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"A":[],"B":[]}');
    listA.innerHTML = "";
    listB.innerHTML = "";
    data.A.forEach(name => createPerson(name, "A", false));
    data.B.forEach(name => createPerson(name, "B", false));
    checkBalance();
  }

  // --- Teilnehmer speichern ---
  function saveData() {
    const A = [...listA.querySelectorAll("input")].map(i => i.value.trim()).filter(Boolean);
    const B = [...listB.querySelectorAll("input")].map(i => i.value.trim()).filter(Boolean);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ A, B }));
  }

  // --- Person-Element erzeugen ---
  function createPerson(name, group, save = true) {
    const div = document.createElement("div");
    div.className = "row";
    div.innerHTML = `
      <input type="text" value="${name}" placeholder="Name eingeben" style="flex:1">
      <button class="danger small">✖</button>
    `;

    // Änderungen speichern
    const input = div.querySelector("input");
    input.addEventListener("input", saveData);

    // Lösch-Button
    div.querySelector("button").addEventListener("click", () => {
      div.remove();
      saveData();
      checkBalance();
    });

    if (group === "A") listA.appendChild(div);
    else listB.appendChild(div);

    if (save) saveData();
    checkBalance();
  }

  // --- Balance prüfen ---
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

  // --- Buttons ---
  addA.addEventListener("click", () => {
    createPerson(`A${listA.children.length + 1}`, "A");
  });
  addB.addEventListener("click", () => {
    createPerson(`B${listB.children.length + 1}`, "B");
  });

  // --- Initial laden ---
  loadData();
});
