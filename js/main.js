/* Module: js/main.js — game state, placement, scoring hooks,
   level/theme progression, New Game, help modal, boot.
   `$` comes from js/drag.js (loaded first). The board ALWAYS
   starts completely empty — Board.create() is all nulls; blocks
   appear only when the player places a tray piece. */
/* The board ALWAYS starts completely empty — Board.create() is all nulls.
   Blocks appear only when the player places a tray piece (tryPlace). */
const state={board:Board.create(),pieces:[],score:0,best:0,level:1,multiplier:1,combo:0,lines:0,themeIdx:0,scoreInLevel:0,goal:800,over:false,selected:null};
const theme=()=>THEMES[state.themeIdx%THEMES.length];
const deal=()=>{state.pieces=[0,1,2].map(()=>{const shape=pickShape(state.level);return{shape,ci:Math.floor(Math.random()*theme().palette.length)};});};
const applyTheme=()=>{const t=theme();const rs=document.documentElement.style;rs.setProperty('--accent',t.accent);rs.setProperty('--accent2',t.accent2);rs.setProperty('--cell','#'+t.cell.toString(16).padStart(6,'0'));rs.setProperty('--board','#'+t.board.toString(16).padStart(6,'0'));$('#grid').renderer?.setTheme(t);};
const refresh=()=>{$('#hud').update({score:state.score,best:state.best,level:state.level,multiplier:state.multiplier,theme:theme(),scoreInLevel:state.scoreInLevel,goal:state.goal,lines:state.lines,chain:EffectSelector.state().chain,intensity:EffectSelector.state().intensity});$('#grid').renderer?.sync(state.board);$('#tray').render(state.pieces,theme(),state.board);};
const banner=(txt,ms=1100)=>{const b=$('#banner');b.textContent=txt;b.classList.add('show');setTimeout(()=>b.classList.remove('show'),ms);};
const popScore=(txt,x,y)=>{const e=document.createElement('div');e.className='pop';e.textContent=txt;e.style.left=x+'px';e.style.top=y+'px';e.style.color=theme().accent;e.style.fontSize='22px';document.body.append(e);setTimeout(()=>e.remove(),850);};

const tryPlace=(idx,gx,gy,evt)=>{
 const p=state.pieces[idx];if(!p||state.over)return false;
 if(!Board.canPlace(state.board,p.shape,gx,gy))return false;
 state.board=Board.place(state.board,p.shape,gx,gy,p.ci);
 const clears=Board.findClears(state.board);const lineCount=clears.rows.length+clears.cols.length;
 let clearedBoard=state.board;
 let sel=null;
 if(lineCount>0){
   // EffectSelector decides effect(s) + intensity from chain history — board logic knows no animation details. Non-blocking.
   const preBoard=Board.applyClears(state.board,clears);
   sel=EffectSelector.play(theme(),clears,{renderer:$('#grid').renderer,fx:$('#grid').fx,theme:theme()},{boardEmpty:Board.isEmpty(preBoard)});
   clearedBoard=preBoard;
 } else EffectSelector.recordNoClear();
 const empty=Board.isEmpty(clearedBoard)&&lineCount>0;
 const res=Scoring.resolve({cells:p.shape.cells.length,lines:lineCount,boardEmpty:empty,multiplier:state.multiplier,combo:state.combo});
 state.score+=res.points;state.scoreInLevel+=res.points;state.multiplier=res.multiplier;state.combo=res.combo;state.lines+=lineCount;state.best=Math.max(state.best,state.score);
 state.board=clearedBoard;state.pieces[idx]=null;state.selected=null;
 if(evt)popScore('+'+res.points,evt.clientX-10,evt.clientY-10);
 if(sel&&sel.chain>=2)banner('🔥 Chain ×'+sel.chain+' · Intensity Lv'+sel.intensity+'!',1300);
 if(res.perfect)banner('✦ PERFECT CLEAR! +'+(500*state.multiplier)+' · Multiplier ×'+state.multiplier,1500);
 else if(lineCount>1)banner('✨ '+lineCount+' lines at once! +'+res.points);
 else if(lineCount===1)banner(clears.rows.length?'↔ Row clear! +'+res.points:'↕ Column clear! +'+res.points,800);
 if(state.pieces.every(x=>!x))deal();
 // Level up
 if(state.scoreInLevel>=state.goal){state.scoreInLevel-=state.goal;state.level++;state.goal=800+state.level*250;state.themeIdx=(state.themeIdx+1)%THEMES.length;applyTheme();banner('🎉 Level '+state.level+' — '+theme().name,1600);}
 refresh();
 if(!Board.anyMove(state.board,state.pieces)){state.over=true;$('#finalScore').textContent=state.score;$('#finalStats').textContent=`Level ${state.level} · ${state.lines} lines cleared · Best ${state.best}`;setTimeout(()=>$('#modal').classList.add('open'),650);}
 return true;
};

const newGame=()=>{EffectSelector.recordNoClear();Object.assign(state,{board:Board.create(),score:0,level:1,multiplier:1,combo:0,lines:0,scoreInLevel:0,goal:800,over:false,selected:null});$('#grid').renderer?.clearAll();deal();applyTheme();refresh();$('#modal').classList.remove('open');banner(theme().name+' — drag a piece up!',1200);};
$('#newBtn').onclick=newGame;$('#againBtn').onclick=newGame;
$('#themeBtn').onclick=()=>{state.themeIdx=(state.themeIdx+1)%THEMES.length;applyTheme();refresh();banner(theme().name);};
/* How-to-play modal: (?) icon opens, × / tap-outside / Esc close */
const helpModal=$('#helpModal');
const openHelp=()=>helpModal.classList.add('open');
const closeHelp=()=>helpModal.classList.remove('open');
$('#helpBtn').onclick=openHelp;
$('#helpClose').onclick=closeHelp;
helpModal.addEventListener('pointerdown',e=>{if(e.target===helpModal)closeHelp();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeHelp();});
/* Prevent native text selection / drag from interfering with grabbing shapes */
document.addEventListener('selectstart',e=>{e.preventDefault();});
document.addEventListener('dragstart',e=>{e.preventDefault();});
document.onselectstart=()=>false;
document.querySelector('.wrap')?.addEventListener('selectstart',e=>{e.preventDefault();});
document.querySelectorAll('img').forEach(img=>{img.draggable=false;img.setAttribute('draggable','false');});
document.querySelectorAll('[data-version]').forEach(el=>{el.textContent='v'+VERSION;});
initDrag();deal();applyTheme();$('#grid').renderer?.clearAll();refresh();
