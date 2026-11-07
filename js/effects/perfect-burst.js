ClearEffects.register({name:'perfect-burst',type:'both',duration:650,play:({clears,renderer,fx})=>{
 const cells=Board.clearedCells(clears);spawnParticles(fx,cells,'#ffd166',14,'burst');spawnParticles(fx,cells,'#ffffff',10,'down');renderer.ringBurst(clears);}});
