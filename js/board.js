/* ============================================================
   MODULE: js/board.js — pure board logic (no DOM, no Three.js)
============================================================ */
const Board={
 create:()=>Array.from({length:8},()=>Array(8).fill(null)),
 canPlace:(b,shape,x,y)=>shape.cells.every(([dx,dy])=>{const cx=x+dx,cy=y+dy;return cx>=0&&cx<8&&cy>=0&&cy<8&&!b[cy][cx];}),
 place:(b,shape,x,y,ci)=>{const n=b.map(r=>[...r]);shape.cells.forEach(([dx,dy])=>n[y+dy][x+dx]={ci});return n;},
 findClears:b=>{const rows=[],cols=[];for(let y=0;y<8;y++)if(b[y].every(Boolean))rows.push(y);for(let x=0;x<8;x++)if(b.every(r=>r[x]))cols.push(x);return{rows,cols};},
 applyClears:(b,{rows,cols})=>{const n=b.map(r=>[...r]);rows.forEach(y=>n[y].fill(null));cols.forEach(x=>n.forEach(r=>r[x]=null));return n;},
 clearedCells:({rows,cols})=>{const s=new Set();rows.forEach(y=>{for(let x=0;x<8;x++)s.add(x+','+y)});cols.forEach(x=>{for(let y=0;y<8;y++)s.add(x+','+y)});return[...s].map(k=>k.split(',').map(Number));},
 isEmpty:b=>b.every(r=>r.every(c=>!c)),
 anyFits:(b,shape)=>{for(let y=0;y<8;y++)for(let x=0;x<8;x++)if(Board.canPlace(b,shape,x,y))return true;return false;},
 anyMove:(b,pieces)=>pieces.filter(Boolean).some(p=>Board.anyFits(b,p.shape)),
};
