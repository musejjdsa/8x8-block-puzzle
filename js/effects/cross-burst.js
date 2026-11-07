/* --- Effect: cross-burst (js/effects/cross-burst.js) — row+column together --- */
ClearEffects.register({name:'cross-burst',type:'both',duration:520,play:({clears,renderer,fx,intensity=1})=>{
 const cells=Board.clearedCells(clears);spawnParticles(fx,cells,'#ffffff',7+intensity*4,'burst');renderer.ringBurst(clears);}});
