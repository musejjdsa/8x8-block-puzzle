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
 /* Drag geometry: the ghost is board-sized (each block = one board cell, measured
    live as board width / 8) and lifted above the finger on touch (72px; 56px pen;
    14px mouse, where the pointer doesn't hide it). Placement is ALWAYS derived
    from the ghost's top-left corner — never the raw finger position — so the
    lift never shifts where the piece lands: what you see is what drops. */
 const GAP=3;
 const liftFor=e=>e.pointerType==='touch'?72:e.pointerType==='pen'?56:14;
 const ghostGeom=(e,p)=>{
  const rect=$('#grid').getBoundingClientRect();const cell=rect.width/8;
  const d=shapeDims(p.shape);const block=Math.max(10,cell-GAP);
  const w=d.w*cell-GAP,h=d.h*cell-GAP,lift=liftFor(e);
  const left=e.clientX-w/2,top=e.clientY-h/2-lift;
  return{d,cell,block,w,h,lift,left,top,gx:Math.round((left-rect.left)/cell),gy:Math.round((top-rect.top)/cell)};
 };
 const moveGhost=(e,ghost,p)=>{
  const g=ghostGeom(e,p);
  ghost.style.width=g.w+'px';ghost.style.height=g.h+'px';ghost.style.padding='0';ghost.style.margin='0';ghost.style.gap=GAP+'px';
  ghost.style.gridTemplateColumns=`repeat(${g.d.w}, ${g.block}px)`;ghost.style.gridTemplateRows=`repeat(${g.d.h}, ${g.block}px)`;
  ghost.querySelectorAll('.pcell').forEach(c=>{c.style.width=g.block+'px';c.style.height=g.block+'px';c.style.borderRadius='7px';});
  ghost.style.left=g.left+'px';ghost.style.top=g.top+'px';return g;
 };
 document.addEventListener('pointerdown',e=>{
  // Big grab area: a tap anywhere on the tray slot (or on the piece's generous
  // padded hit area) starts the drag — slots are separate grid cells, so
  // neighbouring pieces' hit areas never overlap or steal each other's grabs.
  const slot=e.target.closest?e.target.closest('.tray-slot'):null;
  const piece=(e.target.closest?e.target.closest('.piece'):null)||(slot?slot.querySelector('.piece'):null);
  if(!piece||state.over)return;const idx=+(piece.dataset.idx??(slot?slot.dataset.idx:NaN));if(Number.isNaN(idx))return;const p=state.pieces[idx];if(!p)return;
  state.selected=idx;$('#tray').querySelectorAll('.tray-slot').forEach((s,i)=>s.classList.toggle('selected',i===idx));
  const ghost=piece.cloneNode(true);ghost.classList.add('drag-ghost');ghost.draggable=false;ghost.setAttribute('draggable','false');ghost.querySelectorAll('*').forEach(n=>{n.draggable=false;});document.body.append(ghost);
  drag={idx,ghost,piece,p,over:null};const g=moveGhost(e,ghost,p);drag.over={gx:g.gx,gy:g.gy};e.preventDefault();});
 document.addEventListener('pointermove',e=>{if(!drag)return;e.preventDefault();const g=moveGhost(e,drag.ghost,drag.p);
  drag.over={gx:g.gx,gy:g.gy};const host=$('#grid');host.renderer?.showGhost(state.board,drag.p.shape,g.gx,g.gy,Board.canPlace(state.board,drag.p.shape,g.gx,g.gy));});
 document.addEventListener('pointerup',e=>{if(!drag)return;const{idx,ghost,p}=drag;const g=ghostGeom(e,p);ghost.remove();$('#grid').renderer?.clearGhost();drag=null;
  if(tryPlace(idx,g.gx,g.gy,e))return;refresh();});
 document.addEventListener('pointercancel',()=>{if(!drag)return;drag.ghost.remove();$('#grid').renderer?.clearGhost();drag=null;refresh();});
 // Tap board to place selected piece
 $('#grid').addEventListener('pointerup',e=>{if(state.selected==null||drag)return;const r=e.currentTarget.getBoundingClientRect();const p=state.pieces[state.selected];if(!p)return;const d=shapeDims(p.shape);
  const gx=Math.floor((e.clientX-r.left)/(r.width/8)-d.w/2+.5),gy=Math.floor((e.clientY-r.top)/(r.height/8)-d.h/2+.5);tryPlace(state.selected,gx,gy,e);});
};
