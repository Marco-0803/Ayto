

// Bottom nav + overlay logic (module-safe)
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
