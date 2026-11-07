/* --- Effect: col-cascade (js/effects/col-cascade.js) --- */
ClearEffects.register({name:'col-cascade',type:'column',duration:440,play:({clears,renderer,fx,intensity=1})=>{
 clears.cols.forEach(x=>{renderer.animateCells([...Array(8)].map((_,y)=>[x,y]),'col');renderer.flash('col',x);});
 spawnParticles(fx,Board.clearedCells({rows:[],cols:clears.cols}),'#ffe66d',4+intensity*3,'down');}});
