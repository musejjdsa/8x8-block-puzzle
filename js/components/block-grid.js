/* Component: js/components/block-grid.js — the 8x8 board host.
   Owns the Three.js Renderer3D; hides the DOM cell layer when
   WebGL is live (DOM cells remain only as the no-WebGL fallback). */
class BlockGrid extends HTMLElement{
 connectedCallback(){this.innerHTML=`<div class="cells">${'<i></i>'.repeat(64)}</div><div class="dom-blocks"></div><canvas class="fx"></canvas>`;this.fx=this.querySelector('.fx');const size=()=>{const w=this.clientWidth||320;this.fx.width=w;this.fx.height=w;};new ResizeObserver(size).observe(this);setTimeout(size,50);
  this.renderer=new Renderer3D(this);
  /* When WebGL is live, the 3D flat tiles ARE the empty-cell grid — hide the DOM
     cell layer so the two grids can never show as offset double layers.
     The DOM layer remains only as the no-WebGL fallback. */
  if(this.renderer.ok){const c=this.querySelector('.cells');if(c)c.style.display='none';}}
}
customElements.define('block-grid',BlockGrid);
