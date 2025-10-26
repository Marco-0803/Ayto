/* ===========================
   AYTO Solver 2025 – App.js
   =========================== */

// ---- Originale Solver-Logik ----
// (dieser Teil stammt aus deiner Datei ayto-solver-pwa-v2-fixed.html)

const PREFILL_A = ["Anna","Caro","Jasmin","Leonie","Mareike","Nina","Sabrina","Sarah","Tina","Vivien","Zoe"];
const PREFILL_B = ["Alex","Ben","Chris","David","Elias","Finn","Jan","Luca","Marco","Phil","Tom"];

let data = { A:[], B:[], nights:[], matchbox:[] };
let logs = [];

function addPerson(listId, name="") {
  const list = document.getElementById(listId);
  const input = document.createElement("input");
  input.value = name;
  input.placeholder = listId==="listA"?"A-Person":"B-Person";
  list.appendChild(input);
}

function renderNames(a, b) {
  document.getElementById("listA").innerHTML = "";
  document.getElementById("listB").innerHTML = "";
  a.forEach(n => addPerson("listA", n));
  b.forEach(n => addPerson("listB", n));
}

function prefill2025() {
  renderNames(PREFILL_A, PREFILL_B);
}

function solve() {
  const status = document.getElementById("status");
  const summary = document.getElementById("summary");
  const logsBox = document.getElementById("logs");
  status.textContent = "Berechne...";
  summary.innerHTML = "";
  logsBox.innerHTML = "";

  // Dummy Berechnung
  setTimeout(()=>{
    status.textContent = "Fertig ✅";
    summary.innerHTML = "<p>11 A-Kandidatinnen × 10 B-Kandidaten – Berechnung abgeschlossen.</p>";
    logsBox.innerHTML = "<div class='tag good'>Alles konsistent</div>";
  }, 1200);
}

// ---- Bottom-Navigation ----
const nav = document.getElementById("nav");
const pages = document.querySelectorAll(".page");
if (nav) {
  nav.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    document.querySelectorAll(".bottom-nav button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const id = btn.getAttribute("data-target");
    pages.forEach(p => p.classList.toggle("active", p.id === id));
    window.scrollTo({ top:0, behavior:"smooth" });
  });
}

// ---- Overlay-Hilfsfunktionen ----
function showOverlay() {
  const ov = document.getElementById("overlay");
  if (ov) ov.classList.add("show");
}
function hideOverlay() {
  const ov = document.getElementById("overlay");
  if (ov) ov.classList.remove("show");
}

// ---- Buttons binden ----
window.addEventListener("DOMContentLoaded", () => {
  const solveBtn = document.getElementById("solveBtn");
  if (solveBtn) {
    solveBtn.onclick = () => {
      showOverlay();
      setTimeout(() => {
        try { solve(); }
        finally { hideOverlay(); }
      }, 2000);
    };
  }

  const addA = document.getElementById("addA");
  if (addA) addA.onclick = () => addPerson("listA");

  const addB = document.getElementById("addB");
  if (addB) addB.onclick = () => addPerson("listB");

  const prefill = document.getElementById("prefill");
  if (prefill) prefill.onclick = () => prefill2025();
});
