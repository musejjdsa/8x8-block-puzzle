/* Component: js/components/game-hud.js — score / best / level /
   multiplier / chain HUD. Styles live in the component template
   (shadow-free, inherits the page custom properties). */
class GameHud extends HTMLElement{
 connectedCallback(){this.innerHTML=`<style>
  .toprow{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
  .scorebox small{display:block;color:var(--muted);font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
  .scorebox b{font-family:Fredoka,sans-serif;font-size:32px;line-height:1;color:#ff9f1a;text-shadow:0 2px 0 rgba(0,0,0,.25)}
  .minis{display:flex;gap:14px;text-align:right;padding-top:2px}
  .mini small{display:block;color:var(--muted);font-size:9px;font-weight:900;letter-spacing:.07em;text-transform:uppercase}
  .mini b{font-family:Fredoka,sans-serif;font-size:16px;color:#fff}.mini b.mult{color:var(--accent2)}
  .mini b.chain{color:#53c8ff}
 </style><div class="hud">
  <div class="toprow">
   <div class="scorebox"><small>Score</small><b id="s">0</b></div>
   <div class="minis">
    <div class="mini"><small>Best</small><b id="b">0</b></div>
    <div class="mini"><small>Level</small><b id="l">1</b></div>
    <div class="mini"><small>Mult</small><b class="mult" id="m">×1</b></div>
    <div class="mini"><small>Chain</small><b class="chain" id="ch">0</b></div>
   </div>
  </div></div>`;}
 update(st){const $=id=>this.querySelector('#'+id);$('s').textContent=st.score;$('b').textContent=st.best;$('l').textContent=st.level;$('m').textContent='×'+st.multiplier;
  $('ch').textContent=st.chain||0;}
}
customElements.define('game-hud',GameHud);
