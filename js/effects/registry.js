/* ============================================================
   MODULE: js/effects/registry.js — extensible clear-effects registry
   Add an effect = register one entry. Board/scoring/drag never change.
   Entry: { name, type:'row'|'column'|'both', duration, play(ctx) }
   ctx: { cells, rows, cols, renderer, fxCanvas, theme, isRow, isCol }
============================================================ */
const ClearEffects=(()=>{const map=new Map();return{
 register:e=>map.set(e.name,e), get:n=>map.get(n), list:()=>[...map.values()],
 playFor:(theme,clears,ctx)=>{const jobs=[];if(clears.rows.length&&clears.cols.length){const e=map.get(theme.bothEffect);if(e)jobs.push(e);}else if(clears.rows.length){const e=map.get(theme.rowEffect);if(e)jobs.push(e);}else if(clears.cols.length){const e=map.get(theme.colEffect);if(e)jobs.push(e);}
   // When both, also run row+col defaults layered under the burst
   if(clears.rows.length&&clears.cols.length){const r=map.get(theme.rowEffect),c=map.get(theme.colEffect);if(r)jobs.unshift(r);if(c)jobs.splice(1,0,c);}
   jobs.forEach(e=>{try{e.play({...ctx,clears});}catch(_){}});return jobs;}
};})();

/* Particles helper shared by effects (2D fx canvas over the 3D
   board). Moved here from the selector module: every effect in
   js/effects/ uses it, so it lives with the registry. */
/* Particles helper shared by effects (2D fx canvas over the 3D board) */
const spawnParticles=(fx,cells,color,n=5,dir='burst')=>{const ctx=fx.getContext('2d');const W=fx.width,H=fx.height;const ps=[];
 cells.forEach(([x,y])=>{for(let i=0;i<n;i++)ps.push({x:(x+.5)*W/8,y:(y+.5)*H/8,vx:dir==='right'?(1+Math.random()*3):(Math.random()-.5)*3,vy:dir==='down'?(1+Math.random()*3.4):(Math.random()-.7)*3,l:1,c:color});});
 let t=0;const tick=()=>{ctx.clearRect(0,0,W,H);t++;let alive=false;ps.forEach(p=>{if(p.l<=0)return;alive=true;p.x+=p.vx;p.y+=p.vy;if(dir==='down')p.vy+=.12;p.l-=.025;ctx.globalAlpha=Math.max(0,p.l);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,4*p.l+1,0,7);ctx.fill();});ctx.globalAlpha=1;if(alive&&t<50)requestAnimationFrame(tick);else ctx.clearRect(0,0,W,H);};tick();};
