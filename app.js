// ---- Teilnehmer hinzufügen & löschen ----
function addPerson(listId, name = "") {
  const list = document.getElementById(listId);
  if (!list) return;

  const item = document.createElement("div");
  item.className = "person-item";

  const input = document.createElement("input");
  input.type = "text";
  input.value = name;
  input.placeholder = listId === "listA" ? "A-Person" : "B-Person";

  const delBtn = document.createElement("button");
  delBtn.textContent = "🗑️";
  delBtn.className = "del-btn";
  delBtn.title = "Eintrag löschen";
  delBtn.onclick = () => {
    if (confirm("Diesen Eintrag wirklich löschen?")) {
      item.remove();
    }
  };

  item.appendChild(input);
  item.appendChild(delBtn);
  list.appendChild(item);
}

// ---- Kurzbefehle für A- und B-Gruppen ----
function addA(name = "") { addPerson("listA", name); }
function addB(name = "") { addPerson("listB", name); }

// ---- Staffel 2025 vorbelegen ----
function prefill2025() {
  const aList = [
    "Alicia", "Laura", "Nina", "Sophie", "Anna",
    "Julia", "Kim", "Sarah", "Lena", "Maya", "Tanja"
  ];
  const bList = [
    "Tom", "Luca", "Max", "Noah", "Jonas",
    "Finn", "Ben", "Leon", "Elias", "Paul"
  ];

  document.getElementById("listA").innerHTML = "";
  document.getElementById("listB").innerHTML = "";

  aList.forEach(n => addA(n));
  bList.forEach(n => addB(n));

  alert("Staffel 2025 wurde erfolgreich geladen!");
}

// ---- Dummy Berechnung mit Overlay ----
function solve() {
  const overlay = document.getElementById("overlay");
  overlay.classList.add("show");
  setTimeout(() => {
    overlay.classList.remove("show");
    alert("Berechnung abgeschlossen!");
  }, 2000);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ---- Overlay-Helfer ----
function showOverlay() {
  const ov = document.getElementById("overlay");
  if (ov) ov.classList.add("show");
}
function hideOverlay() {
  const ov = document.getElementById("overlay");
  if (ov) ov.classList.remove("show");
}

// ---- Buttons verbinden ----
window.addEventListener("DOMContentLoaded", () => {
  const solveBtn = document.getElementById("solveBtn");
  if (solveBtn) solveBtn.onclick = solve;

  const addAButton = document.getElementById("addA");
  if (addAButton) addAButton.onclick = () => addA();

  const addBButton = document.getElementById("addB");
  if (addBButton) addBButton.onclick = () => addB();

  const prefillButton = document.getElementById("prefill");
  if (prefillButton) prefillButton.onclick = prefill2025;
});
