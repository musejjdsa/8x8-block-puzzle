ClearEffects.register({name:'chain-finisher',type:'both',duration:560,play:({clears,renderer,fx,intensity=3})=>{
 const cells=Board.clearedCells(clears);spawnParticles(fx,cells,'#ffd166',10+intensity*4,'burst');spawnParticles(fx,cells,'#ffffff',6,'right');renderer.ringBurst(clears);}});
