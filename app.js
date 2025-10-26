
// ---- Bottom nav ----
const nav = document.getElementById('nav');
const pages = document.querySelectorAll('.page');
if (nav) {
  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if (!btn) return;
    document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const id = btn.getAttribute('data-target');
    pages.forEach(p=> p.classList.toggle('active', p.id===id));
    window.scrollTo({top:0, behavior:'smooth'});
  });
}

// ---- Overlay helpers ----
function showOverlay(){ const ov=document.getElementById('overlay'); if(ov){ ov.classList.add('show'); } }
function hideOverlay(){ const ov=document.getElementById('overlay'); if(ov){ ov.classList.remove('show'); } }

// ---- Try to expose module-scoped functions globally ----
(function(){
  const expose = (name)=>{ try{ if (typeof eval(name)==='function'){ window[name]=eval(name); } }catch(e){} };
  ['solve',
   'addA','addB','addPersonA','addPersonB','addParticipantA','addParticipantB',
   'prefill2025','prefill','prefillSeason','prefillDefault',
   'addNight','addMatchingNight','createNight'].forEach(expose);
})();

// ---- Bind buttons ----
window.addEventListener('DOMContentLoaded', ()=>{
  const solveBtn = document.getElementById('solveBtn');
  if(solveBtn){
    solveBtn.onclick = ()=>{ showOverlay(); setTimeout(()=>{ try{ if(typeof window.solve==='function') window.solve(); } finally { hideOverlay(); } }, 2000); };
  }
  const addA = document.getElementById('addA');
  if(addA){
    addA.onclick = ()=>{
      const fns = [window.addA, window.addPersonA, window.addParticipantA];
      for(const fn of fns){ if(typeof fn==='function'){ fn(); return; } }
      alert('„+ A‑Person“ ist nicht mit der App-Logik verknüpft.');
    };
  }
  const addB = document.getElementById('addB');
  if(addB){
    addB.onclick = ()=>{
      const fns = [window.addB, window.addPersonB, window.addParticipantB];
      for(const fn of fns){ if(typeof fn==='function'){ fn(); return; } }
      alert('„+ B‑Person“ ist nicht mit der App-Logik verknüpft.');
    };
  }
  const prefill = document.getElementById('prefill');
  if(prefill){
    prefill.onclick = ()=>{
      const fns = [window.prefill2025, window.prefill, window.prefillSeason, window.prefillDefault];
      for(const fn of fns){ if(typeof fn==='function'){ fn(); return; } }
      alert('„Staffel 2025 vorbelegen“ konnte nicht ausgeführt werden.');
    };
  }
});
