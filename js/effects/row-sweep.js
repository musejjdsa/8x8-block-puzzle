/* --- Effect: row-sweep (js/effects/row-sweep.js) --- */
ClearEffects.register({name:'row-sweep',type:'row',duration:380,play:({clears,renderer,fx,intensity=1})=>{
 clears.rows.forEach(y=>{renderer.animateCells([...Array(8)].map((_,x)=>[x,y]),'row');renderer.flash('row',y);});
 spawnParticles(fx,Board.clearedCells({rows:clears.rows,cols:[]}),'#ffffff',3+intensity*3,'right');}});
