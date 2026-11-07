/* Component: js/components/shape-tray.js — the 3-piece tray.
   Renders pieces, marks dead (unplaceable) slots, handles the
   selected highlight. Drag handling lives in js/drag.js. */
class ShapeTray extends HTMLElement{
 render(pieces,theme,board){this.innerHTML='';pieces.forEach((p,i)=>{const slot=document.createElement('div');slot.className='tray-slot'+(p?'':' empty')+(p&&board&&!Board.anyFits(board,p.shape)?' dead':'');slot.dataset.idx=i;
  if(p){const d=shapeDims(p.shape);const el=document.createElement('div');el.className='piece';el.style.gridTemplateColumns=`repeat(${d.w},1fr)`;el.dataset.idx=i;
   const grid=Array.from({length:d.h},()=>Array(d.w).fill(0));p.shape.cells.forEach(([x,y])=>grid[y][x]=1);
   el.innerHTML=grid.flat().map(v=>`<div class="pcell${v?'':' blank'}" ${v?`style="background:${theme.palette[p.ci%theme.palette.length]}"`:''}></div>`).join('');
   slot.append(el, Object.assign(document.createElement('div'),{className:'pname',textContent:p.shape.name}));}
  else slot.innerHTML='<div class="pname">Placed ✓</div>';
  this.append(slot);});}
}

customElements.define('shape-tray',ShapeTray);
