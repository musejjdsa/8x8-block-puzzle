/* Module: js/drag.js — drag controller (pointer events) +
   tap-to-select fallback.
   Also defines the shared `$` query helper used by js/main.js
   (this file loads first, so `$` exists before main runs).
   While a drag is active, touchmove is preventDefaulted so a
   mobile drag never scrolls the page. */
const $=s=>document.querySelector(s);

/* Drag controller (pointer events; tap-to-select fallback) */
const initDrag=()=>{
 let drag=null;
 // While a drag is active, block the page from scrolling/rubber-banding on touch.
 document.addEventListener('touchmove',e=>{if(drag)e.preventDefault();},{passive:false});
 document.addEventListener('pointerdown',e=>{const piece=e.target.closest('.piece');if(!piece||state.over)return;const idx=+piece.dataset.idx;const p=state.pieces[idx];if(!p)return;
  state.selected=idx;$('#tray').querySelectorAll('.tray-slot').forEach((s,i)=>s.classList.toggle('selected',i===idx));
  const ghost=piece.cloneNode(true);ghost.classList.add('drag-ghost');ghost.draggable=false;ghost.setAttribute('draggable','false');ghost.querySelectorAll('*').forEach(n=>{n.draggable=false;});document.body.append(ghost);
  drag={idx,ghost,piece,p,over:null};moveGhost(e,ghost,p);e.preventDefault();});
 const moveGhost=(e,ghost,p)=>{const d=shapeDims(p.shape);ghost.style.left=(e.clientX-d.w*13)+'px';ghost.style.top=(e.clientY-d.h*13-46)+'px';};
 document.addEventListener('pointermove',e=>{if(!drag)return;e.preventDefault();moveGhost(e,drag.ghost,drag.p);
  const host=$('#grid');const r=host.getBoundingClientRect();const cell=r.width/8;
  const d=shapeDims(drag.p.shape);const gx=Math.round((e.clientX-r.left)/cell-d.w/2),gy=Math.round((e.clientY-46-r.top)/cell-d.h/2);
  drag.over={gx,gy};host.renderer?.showGhost(state.board,drag.p.shape,gx,gy,Board.canPlace(state.board,drag.p.shape,gx,gy));});
 document.addEventListener('pointerup',e=>{if(!drag)return;const{idx,ghost,over}=drag;ghost.remove();$('#grid').renderer?.clearGhost();drag=null;
  if(over&&tryPlace(idx,over.gx,over.gy,e))return;refresh();});
 // Tap board to place selected piece
 $('#grid').addEventListener('pointerup',e=>{if(state.selected==null||drag)return;const r=e.currentTarget.getBoundingClientRect();const p=state.pieces[state.selected];if(!p)return;const d=shapeDims(p.shape);
  const gx=Math.floor((e.clientX-r.left)/(r.width/8)-d.w/2+.5),gy=Math.floor((e.clientY-r.top)/(r.height/8)-d.h/2+.5);tryPlace(state.selected,gx,gy,e);});
};
