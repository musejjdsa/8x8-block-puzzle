/* ============================================================
   MODULE: js/effects/effect-selector.js — stateful effect selection.
   The ONLY place that decides which effect + intensity plays.
   Tracks: last-clear time, gap between clears, chain length, lines at once,
   board-clear flag, previous effect id + previous clear direction.
   Rules:
   - Clear within CHAIN_WINDOW (5s) of the last clear -> chain + 1, else chain = 1
   - A placement with NO clear -> recordNoClear() decays/resets the chain
   - Intensity = clamp(chain, 1..3); multi-line clears add +1 (cap 4)
   - Same direction as previous effect in a chain -> that effect UPGRADED (intensity+1)
   - Alternating row<->column in a chain -> 'chain-finisher' (combined variant)
   - Board fully cleared at intensity >= 2 -> 'perfect-burst' (biggest variant)
   Effects receive `intensity` and scale particles / flash / shake / pitch with it.
============================================================ */
const EffectSelector=(()=>{
 const CHAIN_WINDOW=5000;
 const s={lastClearAt:0,chain:0,intensity:1,prevEffect:null,prevDir:null,lastGap:null};
 let audioCtx=null;
 const soundHook=(intensity,lines)=>{ // higher pitch as intensity rises; created lazily, resumed on gestures elsewhere
   try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state!=='running')return;
   const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='triangle';o.frequency.value=380+intensity*130+lines*40;
   g.gain.setValueAtTime(.12,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.22);
   o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.24);}catch(_){}};
 const state=()=>({...s});
 const recordNoClear=()=>{s.chain=0;s.intensity=1;s.prevDir=null;/* prevEffect kept for history */};
 const select=(theme,clears,{boardEmpty=false,now=Date.now()}={})=>{
   const gap=s.lastClearAt?now-s.lastClearAt:null; s.lastGap=gap;
   s.chain=(gap!==null&&gap<=CHAIN_WINDOW)?s.chain+1:1;
   s.lastClearAt=now;
   const lines=clears.rows.length+clears.cols.length;
   const dir=clears.rows.length&&clears.cols.length?'both':clears.rows.length?'row':'col';
   let intensity=Math.min(3,s.chain)+(lines>=2?1:0);
   let names=[];
   if(boardEmpty&&intensity>=2){names=[theme.rowEffect,theme.colEffect,'perfect-burst'];intensity=4;}
   else if(s.chain>=2&&s.prevDir&&s.prevDir!=='both'&&dir!=='both'&&dir!==s.prevDir){names=['chain-finisher'];}
   else if(clears.rows.length&&clears.cols.length){names=[theme.rowEffect,theme.colEffect,theme.bothEffect];}
   else if(dir==='row'){names=[theme.rowEffect];if(s.chain>=2&&s.prevDir==='row')intensity=Math.min(4,intensity+1);}
   else {names=[theme.colEffect];if(s.chain>=2&&s.prevDir==='col')intensity=Math.min(4,intensity+1);}
   intensity=Math.max(1,Math.min(4,intensity)); s.intensity=intensity;
   const jobs=names.map(n=>ClearEffects.get(n)).filter(Boolean).map(e=>({effect:e,intensity}));
   if(jobs.length)s.prevEffect=jobs[jobs.length-1].effect.name;
   s.prevDir=dir;
   return{jobs,intensity,chain:s.chain,dir,lines};
 };
 const play=(theme,clears,ctx,opts)=>{const sel=select(theme,clears,opts);
   sel.jobs.forEach(({effect,intensity})=>{try{effect.play({...ctx,clears,intensity,chain:sel.chain});}catch(_){}});
   // board shake + sound scale with intensity — selector-level feedback, not per-effect
   const host=ctx.renderer?.host;if(host&&sel.intensity>=2){host.classList.remove('shake1','shake2','shake3');void host.offsetWidth;host.classList.add('shake'+Math.min(3,sel.intensity-1));setTimeout(()=>host.classList.remove('shake1','shake2','shake3'),450);}
   soundHook(sel.intensity,sel.lines);
   return sel;};
 return{select,play,recordNoClear,state,CHAIN_WINDOW};
})();
